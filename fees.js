'use strict'

// require libs
const bitcoincore = require('./bitcoincore.js')
const bitgo = require('./bitgo.js')

// get min fee for x block target
const minFeeFor = async (blocks) => {
  const getBitGo = await bitgo.feeFor(blocks)
  const getCore = await bitcoincore.feeFor(blocks)
  let tempFees = {}
  for (let i in blocks) {
    const bitGoFee = getBitGo[blocks[i]]
    const coreFee = getCore[blocks[i]]
    if (bitGoFee && coreFee) {
      tempFees[[blocks[i]]] = Math.min(bitGoFee, coreFee)
    } else if (bitGoFee) {
      console.log('Undefined Core fee')
      tempFees[[blocks[i]]] = bitGoFee
    } else if (coreFee) {
      console.log('Undefined BitGo fee')
      tempFees[[blocks[i]]] = coreFee
    } else {
      throw new Error('minFeeFor fees.js')
    }
  }
  return tempFees
}

// build json
const buildJSON = (req = [2]) => {
  const presetBlocks = [2, 4, 6, 12, 24, 48, 144, 504, 1008]
  const blocks = presetBlocks.concat(req.filter((block) => {
    return presetBlocks.indexOf(block) < 0
  }))
  const res = minFeeFor(blocks)
  return res
}

// compare new fees with last tweet fees
let lastTweetJson = {}

const checkDiff = async () => {
  const fees = await buildJSON()
  if (Object.keys(lastTweetJson).length === 0) {
    lastTweetJson = fees
    return null
  }
  for (let fee in lastTweetJson) {
    const diff = lastTweetJson[fee] / fees[fee]
    if (diff < 0.95 || diff > 1.05) return fees
  }
  return null
}

checkDiff()

// build text
const buildText = async (fees = {}) => {
  if (Object.keys(fees).length === 0) fees = await buildJSON()
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
        console.log(`Tweet created at: ${tweet.created_at}`)
      }
    })
  }
}

// export functions
exports.makeTweet = makeTweet
exports.buildJSON = buildJSON
exports.buildText = buildText
