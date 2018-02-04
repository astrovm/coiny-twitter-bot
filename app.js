'use strict'

// require libs
const _ = require('koa-route')
const Koa = require('koa')
const app = new Koa()
const fees = require('./fees.js')
const Twitter = require('twitter')
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
const api = {
  fee: {
    list: async (ctx) => {
      const block = parseInt(ctx.request.query.numBlocks)
      if (block > 0 && block < 10 ** 4) {
        const fee = JSON.stringify(await fees.buildJSON([block]))
        ctx.body = fee
      } else {
        const fee = JSON.stringify(await fees.buildJSON())
        ctx.body = fee
      }
    }
  }
}
app.use(_.get('/api/v1/tx/fee', api.fee.list))

app.use(async ctx => {
  ctx.body = await fees.buildText()
})

app.listen(process.env.PORT || 3000)
