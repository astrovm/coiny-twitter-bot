// require libs
const Twitter = require('twitter')
const Masto = require('mastodon')
const trae = require('trae')
const { redisGet, redisSet } = require('../../../modules/redis')

// request block height
const getBlocks = async () => {
  try {
    const lastBlockHeight = await trae.get('https://blockstream.info/api/blocks/tip/height')
    const blocks = {
      height: lastBlockHeight.data
    }
    return blocks
  } catch (err) {
    console.error('Error ' + err)
    throw err
  }
}

// convert bitgo fees to satoshis
const convertToSats = (fees) => {
  const keys = Object.keys(fees)

  let response = {}
  for (let key in keys) {
    response[keys[key]] = fees[keys[key]] / 1000
  }

  return response
}

// select the cheapest fees
const bestFees = (bitGoFees, blockstreamFees) => {
  const targetsBitGo = Object.keys(bitGoFees)
  const targetsBlockstream = Object.keys(blockstreamFees)
  const targets = [2, 4, 6, 12, 24, 48, 144, 504, 1008]

  let response = {}

  for (let target in targets) {
    for (let key in targetsBitGo) {
      if (targets[target] >= Number(targetsBitGo[key])) {
        response[targets[target]] = bitGoFees[targetsBitGo[key]].toFixed(2)
      }
    }

    for (let key in blockstreamFees) {
      if (targets[target] >= Number(targetsBlockstream[key])) {
        if (blockstreamFees[targetsBlockstream[key]] < response[targets[target]]) {
          response[targets[target]] = blockstreamFees[targetsBlockstream[key]].toFixed(2)
        }
      }
    }
  }

  return response
}

// request fees
const getFees = async () => {
  try {
    const _bitGo = await trae.get('https://www.bitgo.com/api/v1/tx/fee')
    const bitGoFees = convertToSats(_bitGo.data.feeByBlockTarget)
    const _blockstream = await trae.get('https://blockstream.info/api/fee-estimates')
    const blockstreamFees = _blockstream.data

    const fees = {
      coiny: bestFees(bitGoFees, blockstreamFees),
      bitgo: bitGoFees,
      blockstream: blockstreamFees
    }

    return fees
  } catch (err) {
    console.error('Error ' + err)
    throw err
  }
}

// request price
const getPrice = async () => {
  try {
    const coingecko = await trae.get('https://api.coingecko.com/api/v3/simple/price', {
      params: {
        ids: 'bitcoin',
        vs_currencies: 'usd'
      }
    })

    const coingeckoPrice = Number(coingecko.data.bitcoin.usd)

    return coingeckoPrice
  } catch (err) {
    console.error('Error ' + err)
    throw err
  }
}

const triggerDBUpdate = async () => {
  try {
    // check last time updated
    const lastUpdateTime = await redisGet('update:time')

    const ONE_MINUTE = 1 * 60 * 1000
    const currentTime = Date.now()

    // if fees:time is empty, just run the update
    const keyTime = ((lastUpdateTime == null) ? (currentTime - ONE_MINUTE) : lastUpdateTime)

    // calc diff
    const timeDiff = currentTime - keyTime

    // if last time >= 1 minute, update it now
    if (timeDiff >= ONE_MINUTE) {
      // save time of the update
      const redisReplyUpdateTimeSet = await redisSet('update:time', currentTime)
      console.log(redisReplyUpdateTimeSet)

      // request data
      const blocks = await getBlocks()
      const fees = await getFees()
      const price = await getPrice()

      // stringify for redis
      const blocksString = JSON.stringify(blocks)
      const feesString = JSON.stringify(fees)

      // save to redis
      const redisReplyBlocksSet = await redisSet('blocks', blocksString)
      console.log(redisReplyBlocksSet)
      const redisReplyFeesSet = await redisSet('fees', feesString)
      console.log(redisReplyFeesSet)
      const redisReplyPriceSet = await redisSet('price', price)
      console.log(redisReplyPriceSet)

      res.end('Updated ' + blocksString + feesString + price)
      return
    } else {
      const timeRemaining = new Date(ONE_MINUTE - timeDiff)
      res.end(`Wait ${timeRemaining.getUTCMinutes()} minutes and ${timeRemaining.getUTCSeconds()} seconds`)
      return
    }
  } catch (err) {
    console.error('Error ' + err)
    throw err
  }
}

// conf twitter
const tw = new Twitter({
  consumer_key: process.env.TW_CONSUMER_KEY,
  consumer_secret: process.env.TW_CONSUMER_SECRET,
  access_token_key: process.env.TW_ACCESS_TOKEN_KEY,
  access_token_secret: process.env.TW_ACCESS_TOKEN_SECRET
})

// conf mastodon
const mastodon = new Masto({
  access_token: process.env.MASTODON_ACCESS_TOKEN,
  timeout_ms: 60 * 1000, // optional HTTP request timeout to apply to all requests.
  api_url: 'https://bitcoinhackers.org/api/v1/' // optional, defaults to https://mastodon.social/api/v1/
})

const checkDiff = async (currentTime, maxTime) => {
  try {
    const getFees = await redisGet('fees')
    const fresh = JSON.parse(getFees)

    // check last tweet creation time
    const lastTweetCreatedAt = new Date(await redisGet('tweet:created_at'))

    // if tweet:time is empty, just run the update
    const keyTime = ((lastTweetCreatedAt == null) ? (currentTime - maxTime) : lastTweetCreatedAt)

    // calc diff
    const timeDiff = currentTime - keyTime

    if (timeDiff >= maxTime) return fresh.coiny // if last tweet is very old, tweet

    const getTweet = await redisGet('tweet')
    const used = JSON.parse(getTweet)

    if (!used) return fresh.coiny
    if (Object.keys(used).length === 0) return fresh.coiny

    for (let i in used) {
      const diff = used[i] / fresh.coiny[i]
      if (diff < 0.9 || diff > 1.1) return fresh.coiny
    }

    return null
  } catch (err) {
    console.error('Error ' + err)
    throw err
  }
}

// build text
const buildText = async (fees) => {
  try {
    const getPrice = await redisGet('price')
    const price = Number(getPrice).toFixed(2)

    const usdtobtc = (1 / price).toFixed(8)
    const usdtosats = (usdtobtc * 10 ** 8).toFixed()
    const feetousd = 178 / usdtosats

    const getBlocks = await redisGet('blocks')
    const blocks = JSON.parse(getBlocks)

    let text = `$${price} (1 usd = ${usdtosats} sats)`
    text = text + `\n\n${fees[2]} sat/B ($${(fees[2] * feetousd).toFixed(2)}) - 20m`
    if (fees[4] < fees[2]) text = text + `\n${fees[4]} sat/B ($${(fees[4] * feetousd).toFixed(2)}) - 40m`
    if (fees[6] < fees[4]) text = text + `\n${fees[6]} sat/B ($${(fees[6] * feetousd).toFixed(2)}) - 60m`
    if (fees[12] < fees[6]) text = text + `\n${fees[12]} sat/B ($${(fees[12] * feetousd).toFixed(2)}) - 2h`
    if (fees[24] < fees[12]) text = text + `\n${fees[24]} sat/B ($${(fees[24] * feetousd).toFixed(2)}) - 4h`
    if (fees[48] < fees[24]) text = text + `\n${fees[48]} sat/B ($${(fees[48] * feetousd).toFixed(2)}) - 8h`
    if (fees[144] < fees[48]) text = text + `\n${fees[144]} sat/B ($${(fees[144] * feetousd).toFixed(2)}) - 24h`
    if (fees[504] < fees[144]) text = text + `\n${fees[504]} sat/B ($${(fees[504] * feetousd).toFixed(2)}) - 3d`
    if (fees[1008] < fees[504]) text = text + `\n${fees[1008]} sat/B ($${(fees[1008] * feetousd).toFixed(2)}) - 7d`
    text = text + `\n\nblocks ${blocks.height}`
    return text
  } catch (err) {
    console.error('Error ' + err)
    throw err
  }
}

// make tweet
const makeTweet = async (currentTime, maxTime) => {
  try {
    const json = await checkDiff(currentTime, maxTime)
    if (!json) {
      console.log('The last tweet is already updated.')
      return null
    }

    const tweet = await buildText(json)

    const doTweet = await tw.post('statuses/update', { status: tweet })
    console.log(`Tweet created at: ${doTweet.created_at}`)

    // save creation time of the tweet
    const redisReplyTweetCreatedAtSet = await redisSet('tweet:created_at', doTweet.created_at)
    console.log(redisReplyTweetCreatedAtSet)

    const doMast = await mastodon.post('statuses', { status: tweet })
    console.log(`Toot created at: ${doMast.data.created_at}`)

    return json
  } catch (err) {
    console.error('Error ' + err)
    throw err
  }
}

// export api
module.exports = async (req, res) => {
  try {
    // check last time updated
    const lastUpdateTime = await redisGet('tweet:time')

    const ONE_HOUR = 60 * 60 * 1000
    const THREE_HOURS = ONE_HOUR * 3
    const TWENTY_MINUTES = 20 * 60 * 1000
    const currentTime = Date.now()

    // if tweet:time is empty, just run the update
    const keyTime = ((lastUpdateTime == null) ? (currentTime - TWENTY_MINUTES) : lastUpdateTime)

    // calc diff
    const timeDiff = currentTime - keyTime

    // if last time >= 20 minutes, update it now
    if (timeDiff >= TWENTY_MINUTES) {
      // save time of the update
      const redisReplyTweetTimeSet = await redisSet('tweet:time', currentTime)
      console.log(redisReplyTweetTimeSet)

      // generate tweet
      const getTweet = await makeTweet(currentTime, THREE_HOURS)
      const tweet = JSON.stringify(getTweet)

      // ff last tweeted fees are not too different from the current ones, cancel tweet
      if (!getTweet) {
        res.end('Already updated fees in last tweet ' + req.url)
        return
      }

      // save tweet
      const redisReplyTweetSet = await redisSet('tweet', tweet)
      console.log(redisReplyTweetSet)

      res.end('Updated ' + tweet)
      return
    } else {
      const timeRemaining = new Date(TWENTY_MINUTES - timeDiff)
      res.end(`Wait ${timeRemaining.getUTCMinutes()} minutes and ${timeRemaining.getUTCSeconds()} seconds`)
      return
    }
  } catch (err) {
    console.error('Error ' + err)
    res.end('Error.')
  }
}
