// require libs
const trae = require('trae')
const { redisGet, redisSet } = require('../../../modules/redis')

// function to request bitstamp price
const getPrice = async () => {
  try {
    const bitstamp = await trae.get('https://www.bitstamp.net/api/ticker/')
    const bitstampPrice = bitstamp.data.last
    return bitstampPrice
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
