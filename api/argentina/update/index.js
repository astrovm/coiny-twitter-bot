// require libs
const trae = require('trae')
const { redisGet, redisSet } = require('../../../modules/redis')

// functions to request prices
const getPrices = async () => {
  try {
    const ripio = await trae.get('https://ripio.com/api/v1/rates/')
    const bitso = await trae.get('https://api.bitso.com/v3/ticker/?book=btc_ars')
    const argenbtc = await trae.get('https://argenbtc.com/public/cotizacion_js.php')
    const satoshitango = await trae.get('https://api.satoshitango.com/v3/ticker/ARS')
    const cryptomkt = await trae.get('https://api.cryptomkt.com/v1/ticker?market=BTCARS')
    const bitex = await trae.get('https://bitex.la/api/tickers/btc_ars')
    const buda = await trae.get('https://www.buda.com/api/v2/markets/btc-ars/ticker')
    const qubit_bid = await trae.get('https://www.qubit.com.ar/c_unvalue')
    const qubit_ask = await trae.get('https://www.qubit.com.ar/c_value')
    const buenbit = await trae.get('https://be.buenbit.com/api/market/tickers/')
    const coinbasepro_BTC_USDC = await trae.get('https://api.pro.coinbase.com/products/btc-usdc/ticker')
    const coinbasepro_DAI_USDC = await trae.get('https://api.pro.coinbase.com/products/dai-usdc/ticker')
    const coinbasepro_ETH_DAI = await trae.get('https://api.pro.coinbase.com/products/eth-dai/ticker')
    const coinbasepro_ETH_BTC = await trae.get('https://api.pro.coinbase.com/products/eth-btc/ticker')

    const ripioPrices = ripio.data.rates
    const bitsoPrices = bitso.data.payload
    const argenbtcPrices = JSON.parse(argenbtc.data)
    const satoshitangoPrices = satoshitango.data.data.ticker
    const cryptomktPrices = cryptomkt.data.data[0]
    const bitexPrices = JSON.parse(bitex.data).data
    const budaPrices = buda.data.ticker
    const qubitPrices = {
      bid: qubit_bid.data.BTC[2],
      ask: qubit_ask.data.BTC[2]
    }
    const buenbitPrices = buenbit.data.object
    const coinbaseproPrices = {
      BTC_USDC: coinbasepro_BTC_USDC.data,
      DAI_USDC: coinbasepro_DAI_USDC.data,
      ETH_DAI: coinbasepro_ETH_DAI.data,
      ETH_BTC: coinbasepro_ETH_BTC.data
    }

    const prices = {
      BTC_ARS: {
        ripio: {
          bid: Number(ripioPrices.ARS_SELL) * 0.99, // 1% fee
          ask: Number(ripioPrices.ARS_BUY) * 1.01, // 1% fee
          networkfee: 0.00001164 // https://ripio.com/api/v3/transactions/fees/network-fee/BTC/
        },
        bitso: {
          bid: Number(bitsoPrices.bid) * 0.998, // 0.2% fee
          ask: Number(bitsoPrices.ask) * 1.002, // 0.2% fee
          networkfee: 0.00003599 // https://bitso.com/fees
        },
        argenbtc: {
          bid: Number(argenbtcPrices.precio_venta), // spread fee
          ask: Number(argenbtcPrices.precio_compra), // spread fee
          networkfee: 0.00005 // https://argenbtc.com/SolicitarRetirosBTC
        },
        satoshitango: {
          bid: Number(satoshitangoPrices.BTC.bid) * 0.99, // 1% fee
          ask: Number(satoshitangoPrices.BTC.ask) * 1.01, // 1% fee
          networkfee: 0.0003 // https://www.satoshitango.com/help
        },
        cryptomkt: {
          bid: Number(cryptomktPrices.bid) * 0.985, // 1.5% fee
          ask: Number(cryptomktPrices.ask) * 1.015, // 1.5% fee
          networkfee: 0.0005 // https://www.cryptomkt.com/en/fees
        },
        bitex: {
          bid: Number(bitexPrices.attributes.bid) * 0.989 * 0.9975, // 1.1% + 0.25% fee
          ask: Number(bitexPrices.attributes.ask) * 1.011 * 1.0025, // 1.1% + 0.25% fee
          networkfee: 0 // https://bitex.zendesk.com/hc/es/articles/115000357172-Comisiones
        },
        buda: {
          bid: Number(budaPrices.max_bid[0]) * 0.994 * 0.996, // 0.6% + 0.4% fee
          ask: Number(budaPrices.min_ask[0]) * 1.006 * 1.004, // 0.6% + 0.4% fee
          networkfee: 0 // https://www.buda.com/comisiones
        },
        qubit: {
          bid: Number(qubitPrices.bid), // spread fee
          ask: Number(qubitPrices.ask), // spread fee
          networkfee: 0 // https://www.qubit.com.ar/faq
        },
        dai_buenbit_usdc_coinbasepro_btc: {
          bid: coinbaseproPrices.BTC_USDC.bid * 0.995 * coinbaseproPrices.DAI_USDC.ask * 0.995 * buenbitPrices.daiars.purchase_price, // 0.5% + 0.5% fee
          ask: 1 / (1 / buenbitPrices.daiars.selling_price * coinbaseproPrices.DAI_USDC.bid * 0.995 / coinbaseproPrices.BTC_USDC.ask * 0.995), // 0.5% + 0.5% fee
          networkfee: 0
        },
        dai_buenbit_eth_coinbasepro_btc: {
          bid: 1 / coinbaseproPrices.ETH_BTC.ask * 0.995 * coinbaseproPrices.ETH_DAI.bid * 0.995 * buenbitPrices.daiars.purchase_price, // 0.5% + 0.5% fee
          ask: 1 / (1 / buenbitPrices.daiars.selling_price / coinbaseproPrices.ETH_DAI.ask * 0.995 * coinbaseproPrices.ETH_BTC.bid * 0.995), // 0.5% + 0.5% fee
          networkfee: 0
        }
      },
      DAI_ARS: {
        buenbit: {
          bid: Number(buenbitPrices.daiars.purchase_price),
          ask: Number(buenbitPrices.daiars.selling_price),
          networkfee: 0
        }
      },
      DAI_USD: {
        buenbit: {
          bid: Number(buenbitPrices.daiusd.purchase_price),
          ask: Number(buenbitPrices.daiusd.selling_price),
          networkfee: 0
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
