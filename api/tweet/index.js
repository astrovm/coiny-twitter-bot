// require redis
const { redisGet } = require('../../modules/redis')

// export api
module.exports = async (req, res) => {
  try {
    const redisReplyTweetGet = await redisGet('tweet')

    let respond = {}
    respond.data = JSON.parse(redisReplyTweetGet)
    respond.error = false
    respond.path = req.url

    res.end(JSON.stringify(respond))
  } catch (err) {
    console.error(err)

    let respond = {}
    respond.data = null
    respond.error = true
    respond.path = req.url

    res.end(JSON.stringify(respond))
  }
}
