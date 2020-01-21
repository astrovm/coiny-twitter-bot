// require libs
const trae = require('trae')
const { redisGet, redisSet } = require('../../../modules/redis')

// request smartbit api
const getBlocks = async () => {
  try {
    const lastBlockHeight = await trae.get('https://blockstream.info/api/blocks/tip/height')
    const blockchainSize = await trae.get('https://api.smartbit.com.au/v1/blockchain/chart/block-size-total?from=2020-01-01')
    let blocks = {}
    blocks.height = lastBlockHeight.data
    blocks.size = (Number(blockchainSize.data.chart.data.slice(-1)[0].y) / 1000000000).toFixed(2)
    return blocks
  } catch (err) {
    console.error('Error ' + err)
    throw err
  }
}

// export api
module.exports = async (req, res) => {
  try {
    // check last time updated
    const lastUpdateTime = await redisGet('blocks:time')

    const ONE_MINUTE = 1 * 60 * 1000
    const currentTime = Date.now()

    // if blocks:time is empty, just run the update
    const keyTime = ((lastUpdateTime == null) ? (currentTime - ONE_MINUTE) : lastUpdateTime)

    // calc diff
    const timeDiff = currentTime - keyTime

    // if last time >= 1 minute, update it now
    if (timeDiff >= ONE_MINUTE) {
      // save time of the update
      const redisReplyBlocksTimeSet = await redisSet('blocks:time', currentTime)
      console.log(redisReplyBlocksTimeSet)

      // generate data update
      const blocks = JSON.stringify(await getBlocks())

      // save data
      const redisReplyBlocksSet = await redisSet('blocks', blocks)
      console.log(redisReplyBlocksSet)

      res.end('Updated ' + blocks)
      return
    } else {
      const timeRemaining = new Date(ONE_MINUTE - timeDiff)
      res.end(`Wait ${timeRemaining.getUTCMinutes()} minutes and ${timeRemaining.getUTCSeconds()} seconds`)
      return
    }
  } catch (err) {
    console.error('Error ' + err)
    res.end('Error.')
  }
}
