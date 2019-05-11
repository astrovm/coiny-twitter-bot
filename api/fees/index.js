// require promisify
const { promisify } = require('util')
const { parse } = require('url')

// require and config db libs
const redis = require('redis')
const redisPort = process.env.REDIS_PORT
const redisHost = process.env.REDIS_HOST
const redisPass = process.env.REDIS_PASS
const redisClient = redis.createClient(redisPort, redisHost)
redisClient.auth(redisPass)
redisClient.on('error', (err) => {
  console.error('Error ' + err)
})
const redisGet = promisify(redisClient.get).bind(redisClient)

// select fee for specific block target
const feeFor = (unsortedTargets, unparsedFees) => {
  const targets = unsortedTargets.sort() // sort from lowest to highest
  const fees = JSON.parse(unparsedFees)
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
    const rawFees = await redisGet('fees:raw')
    const defaults = [2, 4, 6, 12, 24, 48, 144, 504, 1008]
    const { query } = parse(req.url, true)
    const targets = (query.target) ? defaults.concat(parseInt(query.target)) : defaults
    const resFees = feeFor(targets, rawFees)

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
