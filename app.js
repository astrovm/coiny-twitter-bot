'use strict'

// require libs
const Koa = require('koa')
const Router = require('koa-router')
const fees = require('./api/fees.js')
const Twitter = require('twitter')
const schedule = require('node-schedule')
const app = new Koa()
const router = new Router()

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
  fee: async (ctx) => {
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
const pages = {
  homepage: async (ctx) => {
    ctx.body = await fees.buildText()
  }
}

router.get('/api/v1/tx/fee', api.fee)
router.get('/', pages.homepage)

app.use(router.routes())
app.listen(process.env.PORT || 3000)
