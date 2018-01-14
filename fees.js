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

// build tweet
const buildTweet = () =>
`20 min ${minFeeFor(2)} sat/B
40 min ${minFeeFor(4)} sat/B
60 min ${minFeeFor(6)} sat/B
2 hours ${minFeeFor(12)} sat/B
4 hours ${minFeeFor(24)} sat/B
8 hours ${minFeeFor(48)} sat/B
24 hours ${minFeeFor(144)} sat/B
3 days ${minFeeFor(504)} sat/B
7 days ${minFeeFor(1008)} sat/B`

// build json
const buildJSON = (blocks) => {
  let res =
    {
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
  if (blocks) {
    res.feePerB = minFeeFor(blocks)
    res.numBlocks = parseInt(blocks)
    return res
  } else {
    return res
  }
}

// export functions
exports.buildTweet = buildTweet
exports.buildJSON = buildJSON
