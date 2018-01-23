'use strict'

// require libs
const micro = require('micro')
const fees = require('./fees.js')
const Twitter = require('twitter')
const url = require('url-parse')
const schedule = require('node-schedule')

// conf twitter
const tw = new Twitter({
  consumer_key: process.env.TW_CONSUMER_KEY,
  consumer_secret: process.env.TW_CONSUMER_SECRET,
  access_token_key: process.env.TW_ACCESS_TOKEN_KEY,
  access_token_secret: process.env.TW_ACCESS_TOKEN_SECRET
})

// hourly tweet
schedule.scheduleJob('0 * * * *', () => {
  fees.makeTweet(tw)
})

// show fees in web sv, handle api requests
const server = micro(async (req, res) => {
  const parse = url(req.url, true)
  if (parse.pathname === '/api/v1/tx/fee') {
    const blocks = parseInt(parse.query.numBlocks)
    if (blocks < 10 ** 4) {
      res.end(JSON.stringify(await fees.buildJSON([blocks])))
    } else {
      res.end(JSON.stringify(await fees.buildJSON()))
    }
  } else {
    res.end(await fees.buildText())
  }
})

server.listen(process.env.PORT || 3000)
