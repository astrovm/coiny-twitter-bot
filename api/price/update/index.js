// require libs
const { promisify } = require('util')
const { redisGet, redisSet } = require('../../../modules/redis')

// require and config bitcoinaverage
const ba = require('bitcoinaverage')
const baPublicKey = process.env.BITCOINAVERAGE_PUBLIC
const baSecretKey = process.env.BITCOINAVERAGE_SECRET
const baRestClient = ba.restfulClient(baPublicKey, baSecretKey)
const baGetTickerDataPerSymbol = promisify(baRestClient.getTickerDataPerSymbol).bind(baRestClient)

// function to request bitcoin average price
const getPrice = async () => {
  try {
    const SYMBOL_SET = 'global'
    const SYMBOL = 'BTCUSD'

    // this may look weird, when all goes fine bitcoinaverage throws an "error" that is the response
    try {
      const getPrice = await baGetTickerDataPerSymbol(SYMBOL_SET, SYMBOL)
      return getPrice
    } catch (result) {
      const price = JSON.parse(result).last
      return price
    }
  } catch (err) {
    console.error('Error ' + err)
    throw err
  }
}

// export api
module.exports = async (req, res) => {
  try {
    // check last time updated
    const lastUpdateTime = await redisGet('price:time')

    const FIFTEEN_MINUTES = 15 * 60 * 1000
    const currentTime = Date.now()

    // if price:time is empty, just run the price update
    const keyTime = ((lastUpdateTime == null) ? (currentTime - FIFTEEN_MINUTES) : lastUpdateTime)

    // calc diff
    const timeDiff = currentTime - keyTime

    // if last time >= 15 minutes, update it now
    if (timeDiff >= FIFTEEN_MINUTES) {
      // save time of the update
      const redisReplyPriceTimeSet = await redisSet('price:time', currentTime)
      console.log(redisReplyPriceTimeSet)

      // get last price
      const price = Number(await getPrice())

      // we check that we have received a number
      if (price > 0) {
        // save price
        const redisReplyPriceSet = await redisSet('price', price)
        console.log(redisReplyPriceSet)

        res.end('Updated ' + price)
        return
      } else {
        throw price
      }
    } else {
      const timeRemaining = new Date(FIFTEEN_MINUTES - timeDiff)
      res.end(`Wait ${timeRemaining.getUTCMinutes()} minutes and ${timeRemaining.getUTCSeconds()} seconds`)
      return
    }
  } catch (err) {
    console.error('Error ' + err)
    res.end('Error.')
  }
}
