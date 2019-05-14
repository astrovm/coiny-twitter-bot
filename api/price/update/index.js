// require promesify
const { promisify } = require('util')

// require and config bitcoinaverage libs
const ba = require('bitcoinaverage')
const baPublicKey = process.env.BITCOINAVERAGE_PUBLIC
const baSecretKey = process.env.BITCOINAVERAGE_SECRET
const baRestClient = ba.restfulClient(baPublicKey, baSecretKey)
const baGetTickerDataPerSymbol = promisify(baRestClient.getTickerDataPerSymbol).bind(baRestClient)

// require and config db libs
const redis = require('redis')
const redisPort = process.env.REDIS_PORT
const redisHost = process.env.REDIS_HOST
const redisPass = process.env.REDIS_PASS
const redisClient = redis.createClient(redisPort, redisHost)
redisClient.auth(redisPass)
redisClient.on('error', (err) => {
  console.error('Error ' + err)
})
const redisGet = promisify(redisClient.get).bind(redisClient)
const redisSet = promisify(redisClient.set).bind(redisClient)

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
    const redisReplyPriceTimeGet = await redisGet('price:time')

    const FIFTEEN_MINUTES = 15 * 60 * 1000
    const currentTime = Date.now()

    // if price:time is empty, just run the price update
    const keyTime = ((redisReplyPriceTimeGet == null) ? (currentTime - FIFTEEN_MINUTES) : redisReplyPriceTimeGet)

    // calc diff
    const timeDiff = currentTime - keyTime

    // if last time >= 15 minutes, update it now
    if (timeDiff >= FIFTEEN_MINUTES) {
      const price = Number(await getPrice())

      // we check that we have received a number
      if (price > 0) {
        const currentTime = Date.now()

        // save price
        const redisReplyPriceSet = await redisSet('price', price)
        console.log(redisReplyPriceSet)

        // save time of the update
        const redisReplyPriceTimeSet = await redisSet('price:time', currentTime)
        console.log(redisReplyPriceTimeSet)

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
