// require libs
const { parse } = require('url')
const { redisGet } = require('../../modules/redis')

// select fee for specific block target
const feeFor = (unsortedTargets, fees) => {
  const targets = unsortedTargets.sort() // sort from lowest to highest
  const feesBlocks = Object.keys(fees).sort((a, b) => b - a) // sort from highest to lowest
  const minTarget = parseInt(feesBlocks.slice(-1)[0]) // take last 'feesBlocks' block

  let response = {}
  for (let t in targets) {
    const target = (targets[t] < minTarget) ? minTarget : targets[t]
    for (let b in feesBlocks) {
      if (target >= feesBlocks[b]) {
        response[targets[t]] = fees[feesBlocks[b]]
        break
      }
    }
  }
  return response
}

// export api
module.exports = async (req, res) => {
  try {
    const rawFees = JSON.parse(await redisGet('fees:raw'))
    const defaults = [2, 4, 6, 12, 24, 48, 144, 504, 1008]
    const { query } = parse(req.url, true)
    const targets = (query.target) ? defaults.concat(parseInt(query.target)) : defaults

    const resFees = {
      coiny: feeFor(targets, rawFees.coiny),
      bitgo: feeFor(targets, rawFees.bitgo),
      blockstream: feeFor(targets, rawFees.blockstream)
    }

    let respond = {}
    respond.data = resFees
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
