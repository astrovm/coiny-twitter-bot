"use strict"

// require libs
const bitcoincore = require('./bitcoincore.js')
const bitgo = require('./bitgo.js')
const Twitter = require('twitter')
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
  const coreFee = bitcoincore.feeFor(blocks)
  const bitGoFee = bitgo.feeFor(blocks)
  if (coreFee && bitGoFee) {
    return Math.min(coreFee, bitGoFee)
  } else if (coreFee) {
    return coreFee
  } else if (bitGoFee) {
    return bitGoFee
  } else {
    throw new Error('minFeeFor index.js')
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

// hourly tweet
const tweetJob = schedule.scheduleJob('0 * * * *', () => {
  tw.post('statuses/update', {status: buildTweet()},  function(err, tweet, res) {
    (err) ? console.log('Error: tw.post index.js') : console.log(`Tweet created at: ${tweet.created_at}`)
  })
})

// show fees in web sv
module.exports = () => buildTweet()
