"use strict"

// require libs
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

// build tweet
const buildTweet = () =>
`20 min ${bitgo.feeFor(2)} sat/B
40 min ${bitgo.feeFor(4)} sat/B
60 min ${bitgo.feeFor(6)} sat/B
2 hours ${bitgo.feeFor(12)} sat/B
4 hours ${bitgo.feeFor(24)} sat/B
8 hours ${bitgo.feeFor(48)} sat/B
24 hours ${bitgo.feeFor(144)} sat/B
3 days ${bitgo.feeFor(504)} sat/B
7 days ${bitgo.feeFor(1008)} sat/B`

// hourly tweet
const tweetJob = schedule.scheduleJob('0 * * * *', () => {
  tw.post('statuses/update', {status: buildTweet()},  function(err, tweet, res) {
      ((err) ? console.error(err) : console.log(`Tweet created at: ${tweet.created_at}`))
    })
})

// show fees in web sv
module.exports = () => buildTweet()
