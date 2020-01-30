// require libs
const trae = require('trae')
const { redisGet, redisSet } = require('../../../modules/redis')

// functions to request prices
const getPrices = async () => {
  // prices object
  let prices = {
    BTC_ARS: {},
    DAI_ARS: {},
    USD_ARS: {},
    ETH_ARS: {},
    LTC_ARS: {},
    XLM_ARS: {},
    XRP_ARS: {},
    BTC_USD: {},
    DAI_USD: {},
    BTC_DAI: {},
    DAI_BTC: {},
    XLM_BTC: {},
    XRP_BTC: {},
    ETH_BTC: {},
    LTC_BTC: {}
  }

  // ripio.com
  try {
    const ripio = await trae.get('https://ripio.com/api/v1/rates/')
    const ripioPrices = {
      BTC_ARS: {
        bid: Number(ripio.data.rates.ARS_SELL),
        ask: Number(ripio.data.rates.ARS_BUY)
      }
    }

    prices.BTC_ARS.ripio = {
      bid: ripioPrices.BTC_ARS.bid * 0.99, // 1% trade fee
      ask: ripioPrices.BTC_ARS.ask * 1.01, // 1% trade fee
      networkfee: 0.00001164 // https://ripio.com/api/v3/transactions/fees/network-fee/BTC/
    }
  } catch (err) {
    console.error('Error with ripio.com: ' + err)
  }

  // bitso.com
  try {
    const bitso = await trae.get('https://api.bitso.com/v3/ticker')
    const bitso_BTC_ARS = bitso.data.payload.find(coin => coin.book === 'btc_ars')
    const bitso_LTC_BTC = bitso.data.payload.find(coin => coin.book === 'ltc_btc')
    const bitso_XRP_BTC = bitso.data.payload.find(coin => coin.book === 'xrp_btc')
    const bitso_ETH_BTC = bitso.data.payload.find(coin => coin.book === 'eth_btc')
    const bitsoPrices = {
      BTC_ARS: {
        bid: Number(bitso_BTC_ARS.bid),
        ask: Number(bitso_BTC_ARS.ask)
      },
      LTC_BTC: {
        bid: Number(bitso_LTC_BTC.bid),
        ask: Number(bitso_LTC_BTC.ask)
      },
      XRP_BTC: {
        bid: Number(bitso_XRP_BTC.bid),
        ask: Number(bitso_XRP_BTC.ask)
      },
      ETH_BTC: {
        bid: Number(bitso_ETH_BTC.bid),
        ask: Number(bitso_ETH_BTC.ask)
      },
    }

    prices.BTC_ARS.bitso = {
      bid: bitsoPrices.BTC_ARS.bid * 0.998, // 0.2% trade fee
      ask: bitsoPrices.BTC_ARS.ask * 1.002, // 0.2% trade fee
      networkfee: 0.00003963 // https://bitso.com/fees
    }

    prices.ETH_ARS.bitso_btc = {
      bid: bitsoPrices.ETH_BTC.bid * 0.99925 * bitsoPrices.BTC_ARS.bid * 0.998, // 0.075% + 0.2% trade fee
      ask: 1 / (1 / bitsoPrices.BTC_ARS.ask * 0.998 / bitsoPrices.ETH_BTC.ask * 0.99902), // 0.2% + 0.098% trade fee
      networkfee: 0.00024150
    }

    prices.XRP_ARS.bitso_btc = {
      bid: bitsoPrices.XRP_BTC.bid * 0.99925 * bitsoPrices.BTC_ARS.bid * 0.998, // 0.075% + 0.2% trade fee
      ask: 1 / (1 / bitsoPrices.BTC_ARS.ask * 0.998 / bitsoPrices.XRP_BTC.ask * 0.99902), // 0.2% + 0.098% trade fee
      networkfee: 0
    }

    prices.LTC_ARS.bitso_btc = {
      bid: bitsoPrices.LTC_BTC.bid * 0.99925 * bitsoPrices.BTC_ARS.bid * 0.998, // 0.075% + 0.2% trade fee
      ask: 1 / (1 / bitsoPrices.BTC_ARS.ask * 0.998 / bitsoPrices.LTC_BTC.ask * 0.99902), // 0.2% + 0.098% trade fee
      networkfee: 0.00091800
    }
  } catch (err) {
    console.error('Error with bitso.com: ' + err)
  }

  // argenbtc.com
  try {
    const argenbtc = await trae.get('https://argenbtc.com/public/cotizacion_js.php')
    const argenbtc_BTC_ARS = JSON.parse(argenbtc.data)
    const argenbtcPrices = {
      BTC_ARS: {
        bid: Number(argenbtc_BTC_ARS.precio_venta),
        ask: Number(argenbtc_BTC_ARS.precio_compra)
      }
    }

    prices.BTC_ARS.argenbtc = {
      bid: argenbtcPrices.BTC_ARS.bid, // spread fee
      ask: argenbtcPrices.BTC_ARS.ask, // spread fee
      networkfee: 0.00005 // https://argenbtc.com/SolicitarRetirosBTC
    }
  } catch (err) {
    console.error('Error with argenbtc.com: ' + err)
  }

  // satoshitango.com
  try {
    const satoshitango = await trae.get('https://api.satoshitango.com/v3/ticker/ARS')
    const satoshitangoPrices = {
      BTC_ARS: {
        bid: Number(satoshitango.data.data.ticker.BTC.bid),
        ask: Number(satoshitango.data.data.ticker.BTC.ask)
      },
      ETH_ARS: {
        bid: Number(satoshitango.data.data.ticker.ETH.bid),
        ask: Number(satoshitango.data.data.ticker.ETH.ask)
      },
      LTC_ARS: {
        bid: Number(satoshitango.data.data.ticker.LTC.bid),
        ask: Number(satoshitango.data.data.ticker.LTC.ask)
      },
      XRP_ARS: {
        bid: Number(satoshitango.data.data.ticker.XRP.bid),
        ask: Number(satoshitango.data.data.ticker.XRP.ask)
      }
    }

    prices.BTC_ARS.satoshitango = {
      bid: satoshitangoPrices.BTC_ARS.bid * 0.99, // 1% trade fee
      ask: satoshitangoPrices.BTC_ARS.ask * 1.01, // 1% trade fee
      networkfee: 0.0003 // https://www.satoshitango.com/help
    }

    prices.LTC_ARS.satoshitango = {
      bid: satoshitangoPrices.LTC_ARS.bid * 0.99, // 1% trade fee
      ask: satoshitangoPrices.LTC_ARS.ask * 1.01, // 1% trade fee
      networkfee: 0.001 // https://www.satoshitango.com/help
    }

    prices.ETH_ARS.satoshitango = {
      bid: satoshitangoPrices.ETH_ARS.bid * 0.99, // 1% trade fee
      ask: satoshitangoPrices.ETH_ARS.ask * 1.01, // 1% trade fee
      networkfee: 0.001 // https://www.satoshitango.com/help
    }

    prices.XRP_ARS.satoshitango = {
      bid: satoshitangoPrices.XRP_ARS.bid * 0.99, // 1% trade fee
      ask: satoshitangoPrices.XRP_ARS.ask * 1.01, // 1% trade fee
      networkfee: 0.02 // https://www.satoshitango.com/help
    }
  } catch (err) {
    console.error('Error with satoshitango.com: ' + err)
  }

  // cryptomkt.com
  try {
    const cryptomkt = await trae.get('https://api.cryptomkt.com/v1/ticker')
    const cryptomkt_BTC_ARS = cryptomkt.data.data.find(coin => coin.market === 'BTCARS')
    const cryptomkt_ETH_ARS = cryptomkt.data.data.find(coin => coin.market === 'ETHARS')
    const cryptomkt_XLM_ARS = cryptomkt.data.data.find(coin => coin.market === 'XLMARS')
    const cryptomktPrices = {
      BTC_ARS: {
        bid: Number(cryptomkt_BTC_ARS.bid),
        ask: Number(cryptomkt_BTC_ARS.ask)
      },
      ETH_ARS: {
        bid: Number(cryptomkt_ETH_ARS.bid),
        ask: Number(cryptomkt_ETH_ARS.ask)
      },
      XLM_ARS: {
        bid: Number(cryptomkt_XLM_ARS.bid),
        ask: Number(cryptomkt_XLM_ARS.ask)
      }
    }

    prices.BTC_ARS.cryptomkt = {
      bid: cryptomktPrices.BTC_ARS.bid * 0.985, // 1.5% trade fee
      ask: cryptomktPrices.BTC_ARS.ask * 1.015, // 1.5% trade fee
      networkfee: 0.0005 // https://www.cryptomkt.com/en/fees
    }

    prices.ETH_ARS.cryptomkt = {
      bid: cryptomktPrices.ETH_ARS.bid * 0.985, // 1.5% trade fee
      ask: cryptomktPrices.ETH_ARS.ask * 1.015, // 1.5% trade fee
      networkfee: 0.0005 // https://www.cryptomkt.com/en/fees
    }

    prices.XLM_ARS.cryptomkt = {
      bid: cryptomktPrices.XLM_ARS.bid * 0.985, // 1.5% trade fee
      ask: cryptomktPrices.XLM_ARS.ask * 1.015, // 1.5% trade fee
      networkfee: 0 // https://www.cryptomkt.com/en/fees
    }
  } catch (err) {
    console.error('Error with cryptomkt.com: ' + err)
  }

  // bitex.la
  try {
    const bitex = await trae.get('https://bitex.la/api/tickers/btc_ars')
    const bitexParse = JSON.parse(bitex.data).data.attributes
    const bitexPrices = {
      BTC_ARS: {
        bid: Number(bitexParse.bid),
        ask: Number(bitexParse.ask)
      }
    }

    prices.BTC_ARS.bitex = {
      bid: bitexPrices.BTC_ARS.bid * 0.989 * 0.9975, // 1.1% withdraw fee + 0.25% trade fee
      ask: bitexPrices.BTC_ARS.ask * 1.011 * 1.0025, // 1.1% deposit fee + 0.25% trade fee
      networkfee: 0 // https://bitex.zendesk.com/hc/es/articles/115000357172-Comisiones
    }
  } catch (err) {
    console.error('Error with bitex.la: ' + err)
  }

  // buda.com
  try {
    const buda_BTC = await trae.get('https://www.buda.com/api/v2/markets/btc-ars/order_book')
    let fiveAskFiat = 0
    let fiveAskCrypto = 0
    let fiveBidFiat = 0
    let fiveBidCrypto = 0
    for (let index = 0; index < 5; index++) {
      fiveAskFiat += buda_BTC.data.order_book.asks[index][0] * buda_BTC.data.order_book.asks[index][1]
      fiveAskCrypto += buda_BTC.data.order_book.asks[index][1]
      fiveBidFiat += buda_BTC.data.order_book.asks[index][0] * buda_BTC.data.order_book.asks[index][1]
      fiveBidCrypto += buda_BTC.data.order_book.asks[index][1]
    }
    const fiveAsk = fiveAskFiat / fiveAskCrypto
    const fiveBid = fiveBidFiat / fiveBidCrypto
    const buda_ETH = await trae.get('https://www.buda.com/api/v2/markets/eth-ars/ticker')
    const buda_LTC = await trae.get('https://www.buda.com/api/v2/markets/ltc-ars/ticker')
    const budaPrices = {
      BTC_ARS: {
        bid: Number(fiveBid),
        ask: Number(fiveAsk)
      },
      ETH_ARS: {
        bid: Number(buda_ETH.data.ticker.max_bid[0]),
        ask: Number(buda_ETH.data.ticker.min_ask[0])
      },
      LTC_ARS: {
        bid: Number(buda_LTC.data.ticker.max_bid[0]),
        ask: Number(buda_LTC.data.ticker.min_ask[0])
      }
    }

    prices.BTC_ARS.buda = {
      bid: budaPrices.BTC_ARS.bid * 0.994 * 0.996, // 0.6% withdraw fee + 0.4% trade fee
      ask: budaPrices.BTC_ARS.ask * 1.006 * 1.004, // 0.6% deposit fee + 0.4% trade fee
      networkfee: 0.0001 // https://www.buda.com/comisiones
    }

    prices.BTC_ARS.buda_ln = {
      bid: budaPrices.BTC_ARS.bid * 0.994 * 0.996, // 0.6% withdraw fee + 0.4% trade fee
      ask: budaPrices.BTC_ARS.ask * 1.006 * 1.004, // 0.6% deposit fee + 0.4% trade fee
      networkfee: 0 // https://www.buda.com/comisiones
    }

    prices.LTC_ARS.buda = {
      bid: budaPrices.LTC_ARS.bid * 0.994 * 0.996, // 0.6% withdraw fee + 0.4% trade fee
      ask: budaPrices.LTC_ARS.ask * 1.006 * 1.004, // 0.6% deposit fee + 0.4% trade fee
      networkfee: 0.00005 // https://www.buda.com/comisiones
    }

    prices.ETH_ARS.buda = {
      bid: budaPrices.ETH_ARS.bid * 0.994 * 0.996, // 0.6% withdraw fee + 0.4% trade fee
      ask: budaPrices.ETH_ARS.ask * 1.006 * 1.004, // 0.6% deposit fee + 0.4% trade fee
      networkfee: 0.000164321 // https://www.buda.com/comisiones
    }
  } catch (err) {
    console.error('Error with buda.com: ' + err)
  }

  // qubit.com.ar
  try {
    const qubit_bid = await trae.get('https://www.qubit.com.ar/c_unvalue')
    const qubit_ask = await trae.get('https://www.qubit.com.ar/c_value')
    const qubitPrices = {
      BTC_ARS: {
        bid: Number(qubit_bid.data.BTC[2]),
        ask: Number(qubit_ask.data.BTC[2])
      },
      USDT_ARS: {
        bid: Number(qubit_bid.data.USDT[2]),
        ask: Number(qubit_ask.data.USDT[2])
      },
      ETH_ARS: {
        bid: Number(qubit_bid.data.ETH[2]),
        ask: Number(qubit_ask.data.ETH[2])
      },
      XRP_ARS: {
        bid: Number(qubit_bid.data.XRP[2]),
        ask: Number(qubit_ask.data.XRP[2])
      },
      XLM_ARS: {
        bid: Number(qubit_bid.data.XLM[2]),
        ask: Number(qubit_ask.data.XLM[2])
      },
      TUSD_ARS: {
        bid: Number(qubit_bid.data.TUSD[2]),
        ask: Number(qubit_ask.data.TUSD[2])
      },
      PAX_ARS: {
        bid: Number(qubit_bid.data.PAX[2]),
        ask: Number(qubit_ask.data.PAX[2])
      },
      LTC_ARS: {
        bid: Number(qubit_bid.data.LTC[2]),
        ask: Number(qubit_ask.data.LTC[2])
      }
    }

    prices.BTC_ARS.qubit = {
      bid: qubitPrices.BTC_ARS.bid, // spread fee
      ask: qubitPrices.BTC_ARS.ask, // spread fee
      networkfee: 0 // https://www.qubit.com.ar/faq
    }

    prices.LTC_ARS.qubit = {
      bid: qubitPrices.LTC_ARS.bid, // spread fee
      ask: qubitPrices.LTC_ARS.ask, // spread fee
      networkfee: 0 // https://www.qubit.com.ar/faq
    }

    prices.ETH_ARS.qubit = {
      bid: qubitPrices.ETH_ARS.bid, // spread fee
      ask: qubitPrices.ETH_ARS.ask, // spread fee
      networkfee: 0 // https://www.qubit.com.ar/faq
    }

    prices.XRP_ARS.qubit = {
      bid: qubitPrices.XRP_ARS.bid, // spread fee
      ask: qubitPrices.XRP_ARS.ask, // spread fee
      networkfee: 0 // https://www.qubit.com.ar/faq
    }

    prices.XLM_ARS.qubit = {
      bid: qubitPrices.XLM_ARS.bid, // spread fee
      ask: qubitPrices.XLM_ARS.ask, // spread fee
      networkfee: 0 // https://www.qubit.com.ar/faq
    }
  } catch (err) {
    console.error('Error with qubit.com.ar: ' + err)
  }

  // buenbit.com
  try {
    const buenbit = await trae.get('https://be.buenbit.com/api/market/tickers/')
    const buenbit_old = await trae.get('https://exchange.buenbit.com/api/v2/tickers')
    const buenbitPrices = {
      DAI_ARS: {
        bid: Number(buenbit.data.object.daiars.purchase_price),
        ask: Number(buenbit.data.object.daiars.selling_price)
      },
      DAI_USD: {
        bid: Number(buenbit.data.object.daiusd.purchase_price),
        ask: Number(buenbit.data.object.daiusd.selling_price)
      },
      BTC_ARS: {
        bid: Number(buenbit_old.data.btcars.ticker.buy),
        ask: Number(buenbit_old.data.btcars.ticker.sell)
      },
      ETH_ARS: {
        bid: Number(buenbit_old.data.ethars.ticker.buy),
        ask: Number(buenbit_old.data.ethars.ticker.sell)
      },
      BTC_DAI: {
        bid: Number(buenbit_old.data.btcdai.ticker.buy),
        ask: Number(buenbit_old.data.btcdai.ticker.sell)
      }
    }

    prices.BTC_ARS.buenbit = {
      bid: buenbitPrices.BTC_ARS.bid * 0.994 * 0.9965, // 0.6% withdraw fee + 0.35% trade fee
      ask: buenbitPrices.BTC_ARS.ask * 1.006 * 1.0035, // 0.6% deposit fee + 0.35% trade fee
      networkfee: 0.00030 // https://exchange.buenbit.com/funds#/withdraws/btc
    }

    prices.ETH_ARS.buenbit = {
      bid: buenbitPrices.ETH_ARS.bid * 0.994 * 0.9965, // 0.6% withdraw fee + 0.35% trade fee
      ask: buenbitPrices.ETH_ARS.ask * 1.006 * 1.0035 * 1.006, // 0.6% deposit fee + 0.35% trade fee + 0.6% withdrawal fee
      networkfee: 0 // https://exchange.buenbit.com/funds#/withdraws/eth
    }

    prices.DAI_ARS.buenbit = {
      bid: buenbitPrices.DAI_ARS.bid,
      ask: buenbitPrices.DAI_ARS.ask,
      networkfee: 0
    }

    prices.DAI_USD.buenbit = {
      bid: buenbitPrices.DAI_USD.bid,
      ask: buenbitPrices.DAI_USD.ask,
      networkfee: 0
    }

    prices.USD_ARS.buenbit = {
      bid: buenbitPrices.DAI_ARS.bid / buenbitPrices.DAI_USD.ask,
      ask: buenbitPrices.DAI_ARS.ask / buenbitPrices.DAI_USD.bid
    }
  } catch (err) {
    console.error('Error with buenbit.com: ' + err)
  }

  // universalcoins.net
  try {
    const universalcoins = await trae.get('https://api.universalcoins.net/Criptomonedas/obtenerDatosHome')
    const universalcoins_BTC_ARS = universalcoins.data.find(coin => coin.codigo === 'BTC')
    const universalcoins_ETH_ARS = universalcoins.data.find(coin => coin.codigo === 'ETH')
    const universalcoins_XRP_ARS = universalcoins.data.find(coin => coin.codigo === 'XRP')
    const universalcoins_LTC_ARS = universalcoins.data.find(coin => coin.codigo === 'LTC')
    const universalcoinsPrices = {
      BTC_ARS: {
        bid: Number(universalcoins_BTC_ARS.cotizacionBaseCompraARS) * Number(universalcoins_BTC_ARS.multiplicadorCompraARS),
        ask: Number(universalcoins_BTC_ARS.cotizacionBaseCompraARS) * Number(universalcoins_BTC_ARS.multiplicadorVentaARS)
      },
      ETH_ARS: {
        bid: Number(universalcoins_ETH_ARS.cotizacionBaseCompraARS) * Number(universalcoins_ETH_ARS.multiplicadorCompraARS),
        ask: Number(universalcoins_ETH_ARS.cotizacionBaseCompraARS) * Number(universalcoins_ETH_ARS.multiplicadorVentaARS)
      },
      XRP_ARS: {
        bid: Number(universalcoins_XRP_ARS.cotizacionBaseCompraARS) * Number(universalcoins_XRP_ARS.multiplicadorCompraARS),
        ask: Number(universalcoins_XRP_ARS.cotizacionBaseCompraARS) * Number(universalcoins_XRP_ARS.multiplicadorVentaARS)
      },
      LTC_ARS: {
        bid: Number(universalcoins_LTC_ARS.cotizacionBaseCompraARS) * Number(universalcoins_LTC_ARS.multiplicadorCompraARS),
        ask: Number(universalcoins_LTC_ARS.cotizacionBaseCompraARS) * Number(universalcoins_LTC_ARS.multiplicadorVentaARS)
      }
    }

    prices.BTC_ARS.universalcoins = {
      bid: universalcoinsPrices.BTC_ARS.bid, // spread fee
      ask: universalcoinsPrices.BTC_ARS.ask * 1.032, // 3.2% deposit fee
      networkfee: 0
    }

    prices.LTC_ARS.universalcoins = {
      bid: universalcoinsPrices.LTC_ARS.bid, // spread fee
      ask: universalcoinsPrices.LTC_ARS.ask * 1.032, // 3.2% deposit fee
      networkfee: 0
    }

    prices.ETH_ARS.universalcoins = {
      bid: universalcoinsPrices.ETH_ARS.bid, // spread fee
      ask: universalcoinsPrices.ETH_ARS.ask * 1.032, // 3.2% deposit fee
      networkfee: 0
    }

    prices.XRP_ARS.universalcoins = {
      bid: universalcoinsPrices.XRP_ARS.bid, // spread fee
      ask: universalcoinsPrices.XRP_ARS.ask * 1.032, // 3.2% deposit fee
      networkfee: 0
    }
  } catch (err) {
    console.error('Error with universalcoins.net: ' + err)
  }

  // pro.coinbase.com
  try {
    const coinbasepro_BTC_USDC = await trae.get('https://api.pro.coinbase.com/products/btc-usdc/ticker')
    const coinbasepro_DAI_USDC = await trae.get('https://api.pro.coinbase.com/products/dai-usdc/ticker')
    const coinbasepro_ETH_DAI = await trae.get('https://api.pro.coinbase.com/products/eth-dai/ticker')
    const coinbasepro_ETH_BTC = await trae.get('https://api.pro.coinbase.com/products/eth-btc/ticker')
    const coinbasepro_LTC_BTC = await trae.get('https://api.pro.coinbase.com/products/ltc-btc/ticker')
    const coinbasepro_XRP_BTC = await trae.get('https://api.pro.coinbase.com/products/xrp-btc/ticker')
    const coinbasepro_XLM_BTC = await trae.get('https://api.pro.coinbase.com/products/xlm-btc/ticker')
    const coinbaseproPrices = {
      BTC_USDC: {
        bid: Number(coinbasepro_BTC_USDC.data.bid),
        ask: Number(coinbasepro_BTC_USDC.data.ask)
      },
      DAI_USDC: {
        bid: Number(coinbasepro_DAI_USDC.data.bid),
        ask: Number(coinbasepro_DAI_USDC.data.ask)
      },
      ETH_DAI: {
        bid: Number(coinbasepro_ETH_DAI.data.bid),
        ask: Number(coinbasepro_ETH_DAI.data.ask)
      },
      ETH_BTC: {
        bid: Number(coinbasepro_ETH_BTC.data.bid),
        ask: Number(coinbasepro_ETH_BTC.data.ask)
      },
      LTC_BTC: {
        bid: Number(coinbasepro_LTC_BTC.data.bid),
        ask: Number(coinbasepro_LTC_BTC.data.ask)
      },
      XRP_BTC: {
        bid: Number(coinbasepro_XRP_BTC.data.bid),
        ask: Number(coinbasepro_XRP_BTC.data.ask)
      },
      XLM_BTC: {
        bid: Number(coinbasepro_XLM_BTC.data.bid),
        ask: Number(coinbasepro_XLM_BTC.data.ask)
      }
    }

    prices.BTC_DAI.coinbasepro_usdc = {
      bid: coinbaseproPrices.BTC_USDC.bid * 0.995 / coinbaseproPrices.DAI_USDC.ask * 0.995,  // 0.5% + 0.5% fee
      ask: 1 / (coinbaseproPrices.DAI_USDC.bid * 0.995 / coinbaseproPrices.BTC_USDC.ask * 0.995),  // 0.5% + 0.5% fee
      networkfee: 0
    }

    prices.BTC_DAI.coinbasepro_eth = {
      bid: 1 / coinbaseproPrices.ETH_BTC.ask * 0.995 * coinbaseproPrices.ETH_DAI.bid * 0.995,  // 0.5% + 0.5% fee
      ask: 1 / (1 / coinbaseproPrices.ETH_DAI.ask * 0.995 * coinbaseproPrices.ETH_BTC.bid * 0.995),  // 0.5% + 0.5% fee
      networkfee: 0
    }

    prices.DAI_BTC.coinbasepro_usdc = {
      bid: 1 / (1 / (coinbaseproPrices.DAI_USDC.bid * 0.995 / coinbaseproPrices.BTC_USDC.ask * 0.995)),  // 0.5% + 0.5% fee
      ask: 1 / (coinbaseproPrices.BTC_USDC.bid * 0.995 / coinbaseproPrices.DAI_USDC.ask * 0.995),  // 0.5% + 0.5% fee
      networkfee: 0
    }

    prices.DAI_BTC.coinbasepro_eth = {
      bid: 1 / (1 / (1 / coinbaseproPrices.ETH_DAI.ask * 0.995 * coinbaseproPrices.ETH_BTC.bid * 0.995)),  // 0.5% + 0.5% fee
      ask: 1 / (1 / coinbaseproPrices.ETH_BTC.ask * 0.995 * coinbaseproPrices.ETH_DAI.bid * 0.995),  // 0.5% + 0.5% fee
      networkfee: 0
    }

    prices.XLM_BTC.coinbasepro = {
      bid: coinbaseproPrices.XLM_BTC.bid * 0.995,
      ask: coinbaseproPrices.XLM_BTC.ask * 1.005,
      networkfee: 0
    }

    prices.XRP_BTC.coinbasepro = {
      bid: coinbaseproPrices.XRP_BTC.bid * 0.995,
      ask: coinbaseproPrices.XRP_BTC.ask * 1.005,
      networkfee: 0
    }

    prices.ETH_BTC.coinbasepro = {
      bid: coinbaseproPrices.ETH_BTC.bid * 0.995,
      ask: coinbaseproPrices.ETH_BTC.ask * 1.005,
      networkfee: 0
    }

    prices.LTC_BTC.coinbasepro = {
      bid: coinbaseproPrices.LTC_BTC.bid * 0.995,
      ask: coinbaseproPrices.LTC_BTC.ask * 1.005,
      networkfee: 0
    }
  } catch (err) {
    console.error('Error with pro.coinbase.com: ' + err)
  }

  return prices
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
