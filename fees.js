'use strict'

// require libs
const bitcoincore = require('./bitcoincore.js')
const bitgo = require('./bitgo.js')

// get min fee for x block target
const minFeeFor = (blocks) => {
  const coreFee = bitcoincore.feeFor(blocks)
  const bitGoFee = bitgo.feeFor(blocks)
  const tempFees = {}
  for (let block in blocks) {
    if (coreFee[blocks[block]] && bitGoFee[blocks[block]]) {
      tempFees[[blocks[block]]] = Math.min(coreFee[blocks[block]], bitGoFee[blocks[block]])
    } else if (coreFee) {
      console.log('Undefined BitGo fee')
      tempFees[[blocks[block]]] = coreFee[blocks[block]]
    } else if (bitGoFee) {
      console.log('Undefined Core fee')
      tempFees[[blocks[block]]] = bitGoFee[blocks[block]]
    } else {
      throw new Error('minFeeFor fees.js')
    }
  }
  return tempFees
}

// build json
const buildJSON = async (reqBlocks = [2]) => {
  const presetBlocks = [2, 4, 6, 12, 24, 48, 144, 504, 1008]
  const blocks = presetBlocks.concat(reqBlocks.filter((block) => {
    return presetBlocks.indexOf(block) < 0
  }))
  const res = await minFeeFor(blocks)
  return res
}

// compare new fees with last tweet fees
let lastTweetJson = buildJSON()
setTimeout(function () {
  console.log(JSON.stringify(lastTweetJson))
}, 5000)
const checkDiff = () => {
  const fees = buildJSON()
  for (let fee in lastTweetJson) {
    const diff = lastTweetJson[fee] / fees[fee]
    if (diff < 0.95 || diff > 1.05) return fees
  }
  return null
}

// build text
const buildText = (fees = buildJSON()) => {
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
const makeTweet = (tw) => {
  const json = checkDiff()
  if (json) {
    const tweet = buildText(json)
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
