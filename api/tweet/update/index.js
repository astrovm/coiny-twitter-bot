// require libs
const Twitter = require('twitter')
const Masto = require('mastodon')
const { redisGet, redisSet } = require('../../../modules/redis')

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

    if (timeDiff >= maxTime) return fresh // if last tweet is very old, tweet

    const getTweet = await redisGet('tweet')
    const used = JSON.parse(getTweet)

    if (!used) return fresh
    if (Object.keys(used).length === 0) return fresh

    for (let i in used) {
      const diff = used[i] / fresh[i]
      if (diff < 0.9 || diff > 1.1) return fresh
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
    const price = Number(getPrice)

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
    text = text + `\n\nheight ${blocks.height}`
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
