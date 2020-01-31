// require libs
const { parse } = require('url')
const { redisGet } = require('../../modules/redis')

// calc rates based in amount
const orderBookRate = (amount, prices) => {
  let response = prices

  for (let pair in prices) {
    if (pair.endsWith('ARS')) {
      for (let exchange in prices[pair]) {
        if (prices[pair][exchange].bids) {
          let pendingAmount = amount
          let coveredAmount = 0
          for (let order in prices[pair][exchange].bids) {
            const orderRate = Number(prices[pair][exchange].bids[order].price)
            const orderAmount = Number(prices[pair][exchange].bids[order].amount)
            const orderAmountConverted = orderRate * orderAmount
            if (pendingAmount > orderAmountConverted) {
              coveredAmount += orderAmount
              pendingAmount -= orderAmountConverted
            } else {
              coveredAmount += pendingAmount / orderRate
              pendingAmount -= pendingAmount
            }
            if (pendingAmount == 0) {
              response[pair][exchange].bid = amount / coveredAmount
              delete response[pair][exchange].bids
              break
            }
          }
        }

        if (prices[pair][exchange].asks) {
          let pendingAmount = amount
          let coveredAmount = 0
          for (let order in prices[pair][exchange].asks) {
            const orderRate = Number(prices[pair][exchange].asks[order].price)
            const orderAmount = Number(prices[pair][exchange].asks[order].amount)
            const orderAmountConverted = orderRate * orderAmount
            if (pendingAmount > orderAmountConverted) {
              coveredAmount += orderAmount
              pendingAmount -= orderAmountConverted
            } else {
              coveredAmount += pendingAmount / orderRate
              pendingAmount -= pendingAmount
            }
            if (pendingAmount == 0) {
              response[pair][exchange].ask = amount / coveredAmount
              delete response[pair][exchange].asks
              break
            }
          }
        }
      }
    }
  }

  return response
}

// calc best exchange including withdrawal fees
const alternativesCalc = (amount, prices) => {
  let alternatives = prices

  for (let pair in prices) {
    if (pair.endsWith('ARS') && !pair.startsWith('BTC') && !pair.startsWith('USD')) {
      const coin = pair.substring(0, 3)
      const coinToBTC = coin + '_BTC'
      for (let externalExchange in prices[coinToBTC]) {
        for (let localExchange in prices[pair]) {
          const routeName = localExchange + '_ARS<>' + coin + '_' + externalExchange + '_' + coin + '<>BTC'
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

// sort best exchange rates
const bestSort = (amount, prices) => {
  const sortedAsk = Object.keys(prices).sort(function (a, b) { return (amount / prices[b].ask - prices[b].networkfee) - (amount / prices[a].ask - prices[a].networkfee) })
  const btcamountAsk = amount / prices[sortedAsk[0]].ask - prices[sortedAsk[0]].networkfee
  const sortedBid = Object.keys(prices).sort(function (a, b) { return prices[b].bid - prices[a].bid })
  const btcamountBid = amount / prices[sortedBid[0]].bid

  let best = {
    ask: {
      exchange: sortedAsk[0],
      ars_amount: amount,
      btc_amount: btcamountAsk,
      rate: amount / btcamountAsk,
      sorted: {}
    },
    bid: {
      exchange: sortedBid[0],
      ars_amount: amount,
      btc_amount: btcamountBid,
      rate: amount / btcamountBid,
      sorted: {}
    }
  }

  for (let exchange in sortedAsk) {
    best.ask.sorted[sortedAsk[exchange]] = amount / (amount / prices[sortedAsk[exchange]].ask - prices[sortedAsk[exchange]].networkfee)
  }

  for (let exchange in sortedBid) {
    best.bid.sorted[sortedBid[exchange]] = prices[sortedBid[exchange]].bid
  }

  return best
}

// export api
module.exports = async (req, res) => {
  try {
    const getprices = JSON.parse(await redisGet('argentina'))
    const { query } = parse(req.url, true)
    const amount = (query.amount) ? Number(query.amount) : 2500

    const prices = await orderBookRate(amount, getprices)
    const alternatives = await alternativesCalc(amount, prices)

    let resPrices = alternatives
    resPrices.BTC_ARS.best = await bestSort(amount, alternatives.BTC_ARS)

    // temp
    resPrices.BTC_USD.buenbit_dai_coinbasepro_usdc = {
      bid: 1 / getprices.DAI_BTC.coinbasepro_usdc.ask * getprices.DAI_USD.buenbit.bid,
      ask: 1 / (1 / getprices.DAI_USD.buenbit.ask * getprices.DAI_BTC.coinbasepro_usdc.bid)
    }

    resPrices.BTC_USD.buenbit_dai_coinbasepro_eth = {
      bid: 1 / getprices.DAI_BTC.coinbasepro_eth.ask * getprices.DAI_USD.buenbit.bid,
      ask: 1 / (1 / getprices.DAI_USD.buenbit.ask * getprices.DAI_BTC.coinbasepro_eth.bid)
    }

    resPrices.BTC_USD.best_ars = {
      bid: alternatives.BTC_ARS.best.bid.rate / alternatives.USD_ARS.buenbit.ask,
      ask: alternatives.BTC_ARS.best.ask.rate / alternatives.USD_ARS.buenbit.bid
    }
    //

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
