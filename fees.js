'use strict'

// conf libs
const bitcoinCore = require('./bitcoin-core.js')
const bitGo = require('./bitgo.js')
const redis = require('redis')
const redisClient = redis.createClient(
  process.env.REDIS_URL,
  {
    'auth_pass': process.env.REDIS_PASS
  }
).on('error', (err) => console.error('ERR:REDIS:', err))

// get min fee for x block target
const minFeeFor = async (blocks) => {
  const getBitGo = await bitGo.feeFor(blocks)
  const getCore = await bitcoinCore.feeFor(blocks)
  let tempFees = {}
  for (let i in blocks) {
    const bitGoFee = getBitGo[blocks[i]]
    const coreFee = getCore[blocks[i]]
    if (bitGoFee && coreFee) {
      tempFees[[blocks[i]]] = Math.min(bitGoFee, coreFee)
    } else if (bitGoFee) {
      console.error(new Error(`Undefined Core fee (~${coreFee}~) (fallback: ~${bitGoFee}~)`))
      tempFees[[blocks[i]]] = bitGoFee
    } else if (coreFee) {
      console.error(new Error(`Undefined BitGo fee (~${bitGoFee}~) (fallback: ~${coreFee}~)`))
      tempFees[[blocks[i]]] = coreFee
    } else {
      const err = `Undefined fees (BitGo: ~${bitGoFee}~) (Core: ~${coreFee}~)`
      console.error(new Error(err))
      return {'error': err}
    }
  }
  return tempFees
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
  const fresh = await buildJSON()
  if (fresh.error) return null
  if (Object.keys(used).length === 0) return fresh
  if (used.error) return fresh
  for (let i in used) {
    const diff = used[i] / fresh[i]
    if (diff < 0.85 || diff > 1.15) return fresh
  }
  return null
}

// build text
const buildText = async (fees = {}) => {
  if (Object.keys(fees).length === 0) fees = await buildJSON()
  if (fees.error) return `Error: ${fees.error}`
  const text =
`20 min ${fees[2]} sat/B
40 min ${fees[4]} sat/B
60 min ${fees[6]} sat/B
2 hours ${fees[12]} sat/B
4 hours ${fees[24]} sat/B
8 hours ${fees[48]} sat/B
24 hours ${fees[144]} sat/B
3 days ${fees[504]} sat/B
7 days ${fees[1008]} sat/B`
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
  }
}

// export functions
exports.makeTweet = makeTweet
exports.buildJSON = buildJSON
exports.buildText = buildText
