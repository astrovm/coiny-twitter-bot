'use strict'

// require libs
const trae = require('trae')

// api urls obj
const apis = {
  ripio: {
    rates: 'https://www.ripio.com/api/v1/rates/',
    fees: 'https://www.ripio.com/api/v1/accounts/estimate_fee/'
  },
  satoshiTango: {
    rates: 'https://api.satoshitango.com/v2/ticker'
  },
  bitInka: {
    rates: 'https://www.bitinka.pe/api/apinka/ticker?format=json'
  }
}

// ripio cookie
const ripioConf = { headers: { 'Cookie': 'sessionid=' } }

// get data from api
const getUrl = async (api, conf = {}) => {
  try {
    const res = await trae.get(api, conf)
    const data = res.data
    if (typeof data === 'object') return data
    return JSON.parse(data)
  } catch (e) {
    console.error(e)
  }
}

// get all data from apis
const getAll = async () => {
  let tempData = {}
  for (let api in apis) {
    tempData[api] = {}
    for (let url in apis[api]) {
      const res = await getUrl(apis[api][url], api === 'ripio' ? ripioConf : {})
      tempData[api][url] = res
    }
  }
  return tempData
}

// save all data
let data = getAll()

// calc rates less fees
const getBuyPrices = async () => {
  const priceData = await data
  const ripioBuyRate = priceData.ripio.rates.rates.ARS_BUY
  const satoshiTangoBuyRate = priceData.satoshiTango.rates.data.compra.arsbtc
  const bitInkaBuyRate = priceData.bitInka.rates.ARS.ask
  const rates = {
    bank: {
      ripio: ripioBuyRate * (1.5 / 100 + 1) * (0.5 / 100 + 1),
      satoshiTango: satoshiTangoBuyRate * (1.21 / 100 + 1) * (2 / 100 + 1),
      bitInka: bitInkaBuyRate * (1 / 100 + 1) * (0.5 / 100 + 1) * (0.15 / 100 + 1)
    },
    rapiPago: {
      ripio: ripioBuyRate * (2.5 / 100 + 1) * (0.5 / 100 + 1),
      satoshiTango: satoshiTangoBuyRate * (3.1 / 100 + 1) * (2 / 100 + 1)
    },
    pagoFacil: {
      ripio: ripioBuyRate * (3 / 100 + 1) * (0.5 / 100 + 1),
      satoshiTango: satoshiTangoBuyRate * (5.8 / 100 + 1) * (2 / 100 + 1),
      bitInka: bitInkaBuyRate * (3.5 / 100 + 1) * (0.5 / 100 + 1) * (0.15 / 100 + 1)
    },
    provincia: {
      satoshiTango: satoshiTangoBuyRate * (5.2 / 100 + 1) * (2 / 100 + 1)
    },
    efectivo: {
      satoshiTango: satoshiTangoBuyRate * (13 / 100 + 1) * (2 / 100 + 1)
    },
    cuentaDigital: {
      satoshiTango: satoshiTangoBuyRate * (0.6 / 100 + 1) * (2 / 100 + 1)
    }
  }
  const fees = {
    ripio: priceData.ripio.fees.fee.low,
    satoshiTango: 0,
    bitInka: 0.00064876
  }
  return {'rates': rates, 'fees': fees}
}

// best brokers rank for specific buy target amount
const rankBuy = async (amount) => {
  let rank = {}
  let buy = await getBuyPrices()
  for (let method in buy.rates) {
    rank[method] = {}
    for (let broker in buy.rates[method]) {
      rank[method][broker] = {}
      rank[method][broker]['receive'] = amount / buy.rates[method][broker] - buy.fees[broker]
      rank[method][broker]['rate'] = amount / rank[method][broker]['receive']
    }
  }
  console.log(rank)
  return rank
}

// 1000 ars test
rankBuy(1000)
