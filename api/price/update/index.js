// require libs
const trae = require('trae');
const { redisGet, redisSet } = require('../../../modules/redis')

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
      coiny: (coinapiPrice + coinmarketcapPrice + coingeckoPrice) / 3,
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
      const price = await getPrice()

      // we check that we have received a number
      if (price.coiny > 0) {
        // save price
        const redisReplyPriceSet = JSON.stringify(await redisSet('price', price))
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
