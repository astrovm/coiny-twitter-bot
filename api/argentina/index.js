// require libs
const { parse } = require('url')
const { redisGet } = require('../../modules/redis')

// calc best exchange including withdrawal fees
const alternativesCalc = (amount, prices) => {
  let alternatives = prices

  for (let pair in prices) {
    if (pair.endsWith('ARS') && !pair.startsWith('BTC') && !pair.startsWith('USD')) {
      const coin = pair.substring(0, 3)
      const coinToBTC = coin + '_BTC'
      for (let externalExchange in prices[coinToBTC]) {
        for (let localExchange in prices[pair]) {
          const routeName = localExchange + '_' + pair + '_' + externalExchange + '_' + coinToBTC
          alternatives.BTC_ARS[routeName] = {
            bid: amount / (amount / prices[pair][localExchange].bid * prices[coinToBTC][externalExchange].ask - prices[coinToBTC][externalExchange].networkfee),
            ask: amount / ((amount / prices[pair][localExchange].ask - prices[pair][localExchange].networkfee) * prices[coinToBTC][externalExchange].bid),
            networkfee: prices[coinToBTC][externalExchange].networkfee
          }
        }
      }
    }
  }

  return alternatives
}

const bestSort = (amount, prices) => {
  const sorted = Object.keys(prices).sort(function (a, b) { return (amount / prices[b].ask - prices[b].networkfee) - (amount / prices[a].ask - prices[a].networkfee) })
  const btcamount = amount / prices[sorted[0]].ask - prices[sorted[0]].networkfee

  const best = {
    exchange: sorted[0],
    ars_amount: amount,
    btc_amount: btcamount,
    rate: amount / btcamount,
    sorted: sorted
  }

  return best
}

// export api
module.exports = async (req, res) => {
  try {
    const getprices = JSON.parse(await redisGet('argentina'))
    const { query } = parse(req.url, true)
    const amount = (query.amount) ? Number(query.amount) : 2500

    const alternatives = await alternativesCalc(amount, getprices)

    let resPrices = alternatives

    resPrices.BTC_ARS.best = {
      ask: bestSort(amount, alternatives.BTC_ARS),
      bid: Object.keys(alternatives.BTC_ARS).sort(function (a, b) { return alternatives.BTC_ARS[b].bid - alternatives.BTC_ARS[a].bid })
    }

    let respond = {}
    respond.data = resPrices
    respond.error = false
    respond.path = req.url

    res.end(JSON.stringify(respond))
  } catch (err) {
    console.error(err)

    let respond = {}
    respond.data = null
    respond.error = true
    respond.path = req.url

    res.end(JSON.stringify(respond))
  }
}
