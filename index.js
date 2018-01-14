'use strict'

// require libs
const bitcoincore = require('./bitcoincore.js')
const bitgo = require('./bitgo.js')
const Twitter = require('twitter')
const url = require('url-parse')
const schedule = require('node-schedule')

// conf twitter
const tw = new Twitter({
  consumer_key: process.env.BITFEES_TW_CONSUMER_KEY,
  consumer_secret: process.env.BITFEES_TW_CONSUMER_SECRET,
  access_token_key: process.env.BITFEES_TW_ACCESS_TOKEN_KEY,
  access_token_secret: process.env.BITFEES_TW_ACCESS_TOKEN_SECRET
})

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
    throw new Error('minFeeFor index.js:30')
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

// hourly tweet
schedule.scheduleJob('0 * * * *', () => {
  tw.post('statuses/update', {status: buildTweet()}, (err, tweet, res) => {
    (err) ? console.error(err) : console.log(`Tweet created at: ${tweet.created_at}`)
  })
})

// show fees in web sv, handle api requests
module.exports = (req, res) => {
  const parse = url(req.url, true)
  if (parse.pathname === '/api/v1/tx/fee') {
    try {
      res.end(JSON.stringify(buildJSON(parseInt(parse.query.numBlocks))))
    } catch (e) {
      res.end(buildJSON())
    }
  } else {
    res.end(buildTweet())
  }
}
