// require redis
const { redisGet } = require('../../modules/redis')

// export api
module.exports = async (req, res) => {
  try {
    const redisReplyArgentinaGet = await redisGet('argentina')

    let respond = {}
    respond.data = redisReplyArgentinaGet
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
