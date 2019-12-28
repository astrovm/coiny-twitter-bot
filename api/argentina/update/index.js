// require libs
const trae = require('trae')
const { redisGet, redisSet } = require('../../../modules/redis')

// request exchanges prices
const getExchanges = async () => {
  try {
    const ripio = await trae.get('https://app.ripio.com/api/v3/rates/?country=AR')
    let exchanges = {}
    exchanges.ripio = ripio.data
    return exchanges
  } catch (err) {
    console.error('Error ' + err)
    throw err
  }
}

// export api
module.exports = async (req, res) => {
  try {
    // check last time updated
    const lastUpdateTime = await redisGet('argentina:time')

    const TEN_MINUTES = 10 * 60 * 1000
    const currentTime = Date.now()

    // if argentina:time is empty, just run the update
    const keyTime = ((lastUpdateTime == null) ? (currentTime - TEN_MINUTES) : lastUpdateTime)

    // calc diff
    const timeDiff = currentTime - keyTime

    // if last time >= 10 minutes, update it now
    if (timeDiff >= TEN_MINUTES) {
      // save time of the update
      const redisReplyArgentinaTimeSet = await redisSet('argentina:time', currentTime)
      console.log(redisReplyArgentinaTimeSet)

      // generate data update
      const exchanges = JSON.stringify(await getExchanges())

      // save data
      const redisReplyArgentinaSet = await redisSet('argentina', exchanges)
      console.log(redisReplyArgentinaSet)

      res.end('Updated ' + exchanges)
      return
    } else {
      const timeRemaining = new Date(TEN_MINUTES - timeDiff)
      res.end(`Wait ${timeRemaining.getUTCMinutes()} minutes and ${timeRemaining.getUTCSeconds()} seconds`)
      return
    }
  } catch (err) {
    console.error('Error ' + err)
    res.end('Error.')
  }
}
