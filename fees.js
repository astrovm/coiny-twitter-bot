'use strict'

// require libs
const bitcoincore = require('./bitcoincore.js')
const bitgo = require('./bitgo.js')

// get min fee for x block target
const minFeeFor = (blocks) => {
  const coreFee = bitcoincore.feeFor(parseInt(blocks))
  const bitGoFee = bitgo.feeFor(parseInt(blocks))
  if (coreFee && bitGoFee) {
    return Math.min(coreFee, bitGoFee)
  } else if (coreFee) {
    console.log('Undefined BitGo fee')
    return coreFee
  } else if (bitGoFee) {
    console.log('Undefined Core fee')
    return bitGoFee
  } else {
    throw new Error('minFeeFor fees.js')
  }
}

// build json
const buildJSON = (blocks = 2) => {
  const res =
    {
      'feePerB': minFeeFor(blocks),
      'numBlocks': parseInt(blocks),
      'feeByBlockTarget':
      {
        '2': minFeeFor(2),
        '4': minFeeFor(4),
        '6': minFeeFor(6),
        '12': minFeeFor(12),
        '24': minFeeFor(24),
        '48': minFeeFor(48),
        '144': minFeeFor(144),
        '504': minFeeFor(504),
        '1008': minFeeFor(1008)
      }
    }
  return res
}

// compare new fees with last tweet fees
let lastTweetJson = buildJSON()
setTimeout(function () {
  console.log(JSON.stringify(lastTweetJson))
}, 5000)
const checkDiff = () => {
  const json = buildJSON()
  const lastTweetFees = lastTweetJson.feeByBlockTarget
  const newFees = json.feeByBlockTarget
  for (let fee in lastTweetFees) {
    const diff = lastTweetFees[fee] / newFees[fee]
    if (diff < 0.95 || diff > 1.05) return json
  }
  return null
}

// build text
const buildText = (json = buildJSON()) => {
  const fees = json.feeByBlockTarget
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
