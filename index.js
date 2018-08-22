'use strict'

// conf libs
const bitGo = require('./server/bitgo.js')
const price = require('./server/price.js')
const getBlockchainInfo = require('./server/blockchain.js')
const Twitter = require('twitter')
const Masto = require('mastodon')
const schedule = require('node-schedule')

// conf twitter
const tw = new Twitter({
  consumer_key: process.env.TW_CONSUMER_KEY,
  consumer_secret: process.env.TW_CONSUMER_SECRET,
  access_token_key: process.env.TW_ACCESS_TOKEN_KEY,
  access_token_secret: process.env.TW_ACCESS_TOKEN_SECRET
})

// conf mastodon
var M = new Masto({
  access_token: process.env.MASTODON_ACCESS_TOKEN,
  timeout_ms: 60*1000,  // optional HTTP request timeout to apply to all requests.
  api_url: 'https://bitcoinhackers.org/api/v1/', // optional, defaults to https://mastodon.social/api/v1/
})

// build json
const buildJSON = async (req) => {
  const defaults = [2, 4, 6, 12, 24, 48, 144, 504, 1008]
  const blocks = (req) ? defaults.concat(req.filter((i) => defaults.indexOf(i) < 0)) : defaults
  const res = await bitGo.feeFor(blocks)
  return res
}

// compare new fees with last tweet fees
let lastTweetJson = {}

const checkDiff = async (used = lastTweetJson) => {
  const getFees = await buildJSON()
  if (getFees.error) return null
  const fresh = getFees
  if (!used) return fresh
  if (Object.keys(used).length === 0) return fresh
  if (used.error) return fresh
  for (let i in used) {
    const diff = used[i] / fresh[i]
    if (diff < 0.9 || diff > 1.1) return fresh
  }
  return null
}

// build text
const buildText = async (fees) => {
  const usd = price() * 178 / 10 ** 8
  const blockchain = getBlockchainInfo()
  let text = `20 min ${fees[2]} sat/B ($${(fees[2] * usd).toFixed(2)})`
  if (fees[4] < fees[2]) text = text + `\n40 min ${fees[4]} sat/B ($${(fees[4] * usd).toFixed(2)})`
  if (fees[6] < fees[4]) text = text + `\n60 min ${fees[6]} sat/B ($${(fees[6] * usd).toFixed(2)})`
  if (fees[12] < fees[6]) text = text + `\n2 hours ${fees[12]} sat/B ($${(fees[12] * usd).toFixed(2)})`
  if (fees[24] < fees[12]) text = text + `\n4 hours ${fees[24]} sat/B ($${(fees[24] * usd).toFixed(2)})`
  if (fees[48] < fees[24]) text = text + `\n8 hours ${fees[48]} sat/B ($${(fees[48] * usd).toFixed(2)})`
  if (fees[144] < fees[48]) text = text + `\n24 hours ${fees[144]} sat/B ($${(fees[144] * usd).toFixed(2)})`
  if (fees[504] < fees[144]) text = text + `\n3 days ${fees[504]} sat/B ($${(fees[504] * usd).toFixed(2)})`
  if (fees[1008] < fees[504]) text = text + `\n7 days ${fees[1008]} sat/B ($${(fees[1008] * usd).toFixed(2)})`
  text = text + `\n\nheight ${blockchain.lastBlockHeight}`
  text = text + `\nblockchain size ${blockchain.size} GB`
  text = text + `\nprice $${price()}`
  return text
}

// make tweet
const makeTweet = async (tw) => {
  const json = await checkDiff()
  if (json !== null) {
    const tweet = await buildText(json)
    M.post('statuses', {status: tweet}, (err, toot, res) => {
      if (err) {
        console.error(err)
      } else {
        console.log(`Toot created at: ${toot.created_at}`)
      }
    })
    tw.post('statuses/update', {status: tweet}, (err, tweet, res) => {
      if (err) {
        console.error(err)
      } else {
        lastTweetJson = json
        console.log(`Tweet created at: ${tweet.created_at}`)
      }
    })
  } else {
    console.log('The last tweet is already updated.')
  }
}

// hourly tweet
schedule.scheduleJob('0 * * * *', () => {
  makeTweet(tw)
})

module.exports = () => lastTweetJson
