'use strict'

// conf libs
const bitcoinCore = require('./bitcoin-core.js')
const bitGo = require('./bitgo.js')
const price = require('./price.js')
const redis = require('redis')
const redisClient = redis.createClient(
  process.env.REDISCLOUD_URL
).on('error', (err) => console.error('ERR:REDIS:', err))

// sort fees object
const sortFees = (req) => {
  const feesSorted = Object.keys(req).sort((a, b) => req[b] - req[a]) // sort fee numbers
  const blocksSorted = Object.keys(req).sort((a, b) => a - b) // sort block target numbers
  // recreate fees object by matching sorted blocks with sorted fees
  let res = {}
  for (let i in feesSorted) {
    res[blocksSorted[i]] = req[feesSorted[i]]
  }
  return res
}

// get min fee for x block target
const minFeeFor = async (blocks) => {
  const getBitGo = await bitGo.feeFor(blocks)
  const getCore = await bitcoinCore.feeFor(blocks)

  let tempFees = {}
  for (let i in blocks) {
    const bitGoFee = getBitGo[blocks[i]]
    const coreFee = getCore[blocks[i]]
    if (bitGoFee && coreFee) {
      const max = Math.max(bitGoFee, coreFee)
      const min = Math.min(bitGoFee, coreFee)
      const lvl = min / max * 150 // larger number = lower fees
      const soft = (max + min * lvl) / (1 + lvl)
      tempFees[[blocks[i]]] = Math.ceil(soft)
    } else if (bitGoFee) {
      console.error(new Error('Undefined Bitcoin Core fee.'))
      tempFees[[blocks[i]]] = bitGoFee
    } else if (coreFee) {
      console.error(new Error('Undefined BitGo fee.'))
      tempFees[[blocks[i]]] = coreFee
    } else {
      const err = 'UNDEFINED FEES'
      console.error(new Error(err))
      return {'error': err}
    }
  }

  const coinyFees = await sortFees(tempFees)

  return { coiny: coinyFees, _bitGo: getBitGo, _bitcoinCore: getCore }
}

// build json
const buildJSON = async (req) => {
  const defaults = [2, 4, 6, 12, 24, 48, 144, 504, 1008]
  const blocks = (req) ? defaults.concat(req.filter((i) => defaults.indexOf(i) < 0)) : defaults
  const res = await minFeeFor(blocks)
  return res
}

// compare new fees with last tweet fees
let lastTweetJson = {}
redisClient.get('lastTweetJson', (err, reply) => {
  (err) ? console.error('ERR:REDIS:', err) : lastTweetJson = JSON.parse(reply)
})

const checkDiff = async (used = lastTweetJson) => {
  const getFees = await buildJSON()
  if (getFees.error) return null
  const fresh = getFees.coiny
  if (!used) return fresh
  if (Object.keys(used).length === 0) return fresh
  if (used.error) return fresh
  for (let i in used) {
    const diff = used[i] / fresh[i]
    if (diff < 0.9 || diff > 1.1) return fresh
  }
  return null
}

// build text
const buildText = async (fees) => {
  const usd = price() * 225 / 10 ** 8
  let text = `20 min ${fees[2]} sat/B ($${(fees[2] * usd).toFixed(2)})`
  if (fees[4] < fees[2]) text = text + `\n40 min ${fees[4]} sat/B ($${(fees[4] * usd).toFixed(2)})`
  if (fees[6] < fees[4]) text = text + `\n60 min ${fees[6]} sat/B ($${(fees[6] * usd).toFixed(2)})`
  if (fees[12] < fees[6]) text = text + `\n2 hours ${fees[12]} sat/B ($${(fees[12] * usd).toFixed(2)})`
  if (fees[24] < fees[12]) text = text + `\n4 hours ${fees[24]} sat/B ($${(fees[24] * usd).toFixed(2)})`
  if (fees[48] < fees[24]) text = text + `\n8 hours ${fees[48]} sat/B ($${(fees[48] * usd).toFixed(2)})`
  if (fees[144] < fees[48]) text = text + `\n24 hours ${fees[144]} sat/B ($${(fees[144] * usd).toFixed(2)})`
  if (fees[504] < fees[144]) text = text + `\n3 days ${fees[504]} sat/B ($${(fees[504] * usd).toFixed(2)})`
  if (fees[1008] < fees[504]) text = text + `\n7 days ${fees[1008]} sat/B ($${(fees[1008] * usd).toFixed(2)})`
  return text
}

// make tweet
const makeTweet = async (tw) => {
  const json = await checkDiff()
  if (json !== null) {
    const tweet = await buildText(json)
    tw.post('statuses/update', {status: tweet}, (err, tweet, res) => {
      if (err) {
        console.error(err)
      } else {
        lastTweetJson = json
        redisClient.set('lastTweetJson', JSON.stringify(json), redis.print)
        console.log(`Tweet created at: ${tweet.created_at}`)
      }
    })
  } else {
    console.log('The last tweet is already updated.')
  }
}

// export functions
exports.makeTweet = makeTweet
exports.buildJSON = buildJSON
