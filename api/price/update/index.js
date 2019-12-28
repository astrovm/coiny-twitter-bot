// require libs
const rp = require('request-promise')
const { redisGet, redisSet } = require('../../../modules/redis')

// function to request coinmarketcap price
const getPrice = async () => {
  try {
    const requestOptions = {
      method: 'GET',
      uri: 'https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest',
      qs: {
        'id': '1'
      },
      headers: {
        'X-CMC_PRO_API_KEY': process.env.COINMARKETCAP_API_KEY
      },
      json: true,
      gzip: true
    }

    const coinmarketcap = await rp(requestOptions)
    const coinmarketcapPrice = coinmarketcap.data['1'].quote.USD
    return coinmarketcapPrice
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
      const lastPrice = await getPrice()

      // we check that we have received a number
      if (lastPrice.price > 0) {
        // save price
        const redisReplyPriceSet = await redisSet('price', JSON.stringify(lastPrice))
        console.log(redisReplyPriceSet)

        res.end('Updated ' + lastPrice)
        return
      } else {
        throw lastPrice
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
