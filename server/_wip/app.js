'use strict'

// require libs
const Koa = require('koa')
const cors = require('koa-cors')
const serve = require('koa-static')
const Router = require('koa-router')
const fees = require('./back/fees.js')
const price = require('./back/price.js')
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
    ctx.type = 'application/json'
    if (block > 0 && block < 10 ** 4) {
      const fee = JSON.stringify(await fees.buildJSON([block]))
      ctx.body = fee
    } else {
      const fee = JSON.stringify(await fees.buildJSON())
      ctx.body = fee
    }
  },
  price: async (ctx) => {
    ctx.type = 'application/json'
    ctx.body = { last: price() }
  }
}

router.get('/api/v1/tx/fee', api.fee)
router.get('/api/v1/price/btcusd', api.price)
app.use(serve('./front/dist'))

app.use(cors())
app.use(router.routes())
app.listen(process.env.PORT || 3000)
