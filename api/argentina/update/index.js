// require libs
const trae = require('trae')
const { redisGet, redisSet } = require('../../../modules/redis')

// functions to request prices
const getPrices = async () => {
  try {
    const ripio = await trae.get('https://ripio.com/api/v1/rates/')
    const bitso = await trae.get('https://api.bitso.com/v3/ticker/?book=btc_ars')
    const argenbtc = await trae.get('https://argenbtc.com/public/cotizacion_js.php')

    const ripioPrices = ripio.data.rates
    const bitsoPrices = bitso.data.payload
    const argenbtcPrices = JSON.parse(argenbtc.data)

    const prices = {
      BTC_ARS: {
        ripio: {
          bid: Number(ripioPrices.ARS_SELL) * 0.99, // 1% fee
          ask: Number(ripioPrices.ARS_BUY) * 1.01, // 1% fee
          networkfee: 0.00000582 // https://ripio.com/api/v3/transactions/fees/network-fee/BTC/
        },
        bitso: {
          bid: Number(bitsoPrices.bid) * 0.998, // 0.2% fee
          ask: Number(bitsoPrices.ask) * 1.002, // 0.2% fee
          networkfee: 0.00004227 // https://bitso.com/fees
        },
        argenbtc: {
          bid: Number(argenbtcPrices.precio_venta), // spread fee
          ask: Number(argenbtcPrices.precio_compra), // spread fee
          networkfee: 0.00005000 // https://argenbtc.com/SolicitarRetirosBTC
        }
      }
    }

    return prices
  } catch (err) {
    console.error('Error ' + err)
    throw err
  }
}

// export api
module.exports = async (req, res) => {
  try {
    // check last time updated
    const lastUpdateTime = await redisGet('argentina:time')

    const ONE_MINUTE = 1 * 60 * 1000
    const currentTime = Date.now()

    // if argentina:time is empty, just run the prices update
    const keyTime = ((lastUpdateTime == null) ? (currentTime - ONE_MINUTE) : lastUpdateTime)

    // calc diff
    const timeDiff = currentTime - keyTime

    // if last time >= 1 minute, update it now
    if (timeDiff >= ONE_MINUTE) {
      // save time of the update
      const redisReplyArgentinaTimeSet = await redisSet('argentina:time', currentTime)
      console.log(redisReplyArgentinaTimeSet)

      // get last prices
      const prices = JSON.stringify(await getPrices())

      // save prices
      const redisReplyArgentinaSet = await redisSet('argentina', prices)
      console.log(redisReplyArgentinaSet)

      res.end('Updated ' + prices)
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
