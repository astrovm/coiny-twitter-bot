'use strict'

// require libs
const trae = require('trae')

// api urls obj
const apis = {
  ripio: {
    rates: 'https://www.ripio.com/api/v1/rates/',
    fees: 'https://www.ripio.com/api/v1/accounts/estimate_fee/?amount=1'
  },
  satoshiTango: {
    rates: 'https://api.satoshitango.com/v2/ticker'
  },
  bitInka: {
    rates: 'https://www.bitinka.pe/api/apinka/ticker?format=json'
  }
}

// ripio cookie
const ripioConf = { headers: { 'Cookie': process.env.RIPIO_SESSION } }

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
      ripio: ripioBuyRate * 1.015 * 1.005,
      satoshiTango: satoshiTangoBuyRate * 1.012 * 1.02,
      bitInka: bitInkaBuyRate * 1.01 * 1.005 * 1.0015
    },
    rapiPago: {
      ripio: ripioBuyRate * 1.025 * 1.005,
      satoshiTango: satoshiTangoBuyRate * 1.031 * 1.02
    },
    pagoFacil: {
      satoshiTango: satoshiTangoBuyRate * 1.07 * 1.02,
      bitInka: bitInkaBuyRate * 1.035 * 1.005 * 1.0015
    }
  }
  const fees = {
    ripio: priceData.ripio.fees.fee.low,
    satoshiTango: 0,
    bitInka: 0
  }
  return {'rates': rates, 'fees': fees}
}

// best brokers rank for specific buy target amount
const rankBuy = async (amount) => {
  let rank = {}
  let buy = await getBuyPrices(amount)
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

// ars test
rankBuy(1000)
