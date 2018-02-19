import Koa from 'koa'
import { Nuxt, Builder } from 'nuxt'

async function start () {
  const app = new Koa()
  const host = process.env.HOST || '127.0.0.1'
  const port = process.env.PORT || 3000

  // Import and Set Nuxt.js options
  let config = require('../nuxt.config.js')
  config.dev = !(app.env === 'production')

  // Instantiate nuxt.js
  const nuxt = new Nuxt(config)

  // Build in development
  if (config.dev) {
    const builder = new Builder(nuxt)
    await builder.build()
  }

  //WIP
  // require libs
  const cors = require('@koa/cors')
  const Router = require('koa-router')
  const fees = require('./fees.js')
  const price = require('./price.js')
  const Twitter = require('twitter')
  const schedule = require('node-schedule')
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
      ctx.type = 'application/json'
      ctx.set('Cache-Control', 'max-age=300')

      const block = parseInt(ctx.request.query.numBlocks)
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
      ctx.set('Cache-Control', 'max-age=300')
      ctx.body = { last: price() }
    }
  }

  router.get('/api/v1/tx/fee', api.fee)
  router.get('/api/v1/price/btcusd', api.price)

  app.use(cors())
  app.use(router.routes())
  //WIP

  app.use(async (ctx, next) => {
    await next()
    ctx.status = 200 // koa defaults to 404 when it sees that status is unset
    return new Promise((resolve, reject) => {
      ctx.res.on('close', resolve)
      ctx.res.on('finish', resolve)
      nuxt.render(ctx.req, ctx.res, promise => {
        // nuxt.render passes a rejected promise into callback on error.
        promise.then(resolve).catch(reject)
      })
    })
  })

  app.listen(port, host)
  console.log('Server listening on ' + host + ':' + port) // eslint-disable-line no-console
}

start()
