// require libs
const trae = require('trae')
const { redisGet, redisSet } = require('../../../modules/redis')
const { mean, median } = require('mathjs')

// function to request price
const getPrice = async () => {
  try {
    const coinapi = await trae.get('https://rest.coinapi.io/v1/exchangerate/BTC/USD', {
      headers: {
        'X-CoinAPI-Key': process.env.COINAPI_KEY
      }
    })

    const coinmarketcap = await trae.get('https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest', {
      params: {
        id: 1
      },
      headers: {
        'X-CMC_PRO_API_KEY': process.env.COINMARKETCAP_API_KEY
      }
    })

    const coingecko = await trae.get('https://api.coingecko.com/api/v3/simple/price', {
      params: {
        ids: 'bitcoin',
        vs_currencies: 'usd'
      }
    })

    const coinapiPrice = Number(coinapi.data.rate)
    const coinmarketcapPrice = Number(coinmarketcap.data.data['1'].quote.USD.price)
    const coingeckoPrice = Number(coingecko.data.bitcoin.usd)

    const price = {
      mean: mean(coinapiPrice, coinmarketcapPrice, coingeckoPrice),
      median: median(coinapiPrice, coinmarketcapPrice, coingeckoPrice),
      coinapi: coinapiPrice,
      coinmarketcap: coinmarketcapPrice,
      coingecko: coingeckoPrice
    }

    return price
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

    const ONE_MINUTE = 1 * 60 * 1000
    const currentTime = Date.now()

    // if price:time is empty, just run the price update
    const keyTime = ((lastUpdateTime == null) ? (currentTime - ONE_MINUTE) : lastUpdateTime)

    // calc diff
    const timeDiff = currentTime - keyTime

    // if last time >= 1 minute, update it now
    if (timeDiff >= ONE_MINUTE) {
      // save time of the update
      const redisReplyPriceTimeSet = await redisSet('price:time', currentTime)
      console.log(redisReplyPriceTimeSet)

      // get last price
      const price = await getPrice()

      // we check that we have received a number
      if (price.mean > 0) {
        // save price
        const redisReplyPriceSet = await redisSet('price', JSON.stringify(price))
        console.log(redisReplyPriceSet)

        res.end('Updated ' + price)
        return
      } else {
        throw price
      }
    } else {
      const timeRemaining = new Date(ONE_MINUTE - timeDiff)
      res.end(`Wait ${timeRemaining.getUTCMinutes()} minutes and ${timeRemaining.getUTCSeconds()} seconds`)
      return
    }
  } catch (err) {
    console.error('Error ' + err)
    res.end('Error.')
  }
}
