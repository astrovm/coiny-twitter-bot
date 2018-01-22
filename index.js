'use strict'

// require libs
const fees = require('./fees.js')
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

// hourly tweet
schedule.scheduleJob('0 * * * *', () => {
  fees.makeTweet(tw)
})

// show fees in web sv, handle api requests
module.exports = (req, res) => {
  const parse = url(req.url, true)
  if (parse.pathname === '/api/v1/tx/fee') {
    try {
      res.end(JSON.stringify(fees.buildJSON(parseInt(parse.query.numBlocks))))
    } catch (e) {
      res.end(JSON.stringify(fees.buildJSON()))
    }
  } else {
    res.end(fees.buildText())
  }
}
