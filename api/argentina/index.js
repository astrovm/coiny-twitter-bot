// require libs
const { parse } = require('url')
const { redisGet } = require('../../modules/redis')

// calc best exchange for buying including withdrawal fees
const bestBuy = (amount, prices) => {
  const sorted = Object.keys(prices).sort(function (a, b) { return (amount / prices[b].ask - prices[b].networkfee) - (amount / prices[a].ask - prices[a].networkfee) })
  const btcamount = amount / prices[sorted[0]].ask - prices[sorted[0]].networkfee

  const best = {
    exchange: sorted[0],
    amount: btcamount,
    rate: amount / btcamount,
    data: prices[sorted[0]],
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

    let resPrices = getprices
    resPrices.BTC_ARS.best = {
      ask: bestBuy(amount, getprices.BTC_ARS)
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
