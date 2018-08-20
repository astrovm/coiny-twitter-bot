'use strict'

// require libs
const trae = require('trae')
const schedule = require('node-schedule')

// request smartbit api
const getBlockchain = async () => {
  try {
    const resTotals = await trae.get('https://api.smartbit.com.au/v1/blockchain/totals')
    const resBlockchainSize = await trae.get('https://api.smartbit.com.au/v1/blockchain/chart/block-size-total?from=2018-8-15')
    blockchain.lastBlockHeight = resTotals.data.totals.block_count-1
    blockchain.size = (Number(resBlockchainSize.data.chart.data.slice(-1)[0].y)/1000000000).toFixed(2)
  } catch (err) {
    console.error(err)
    return err
  }
}

// init data
let blockchain = {}
getBlockchain()

// get smartbit data every x minutes job
schedule.scheduleJob('9-59/10 * * * *', () => {
  getBlockchain()
})

// export data
module.exports = () => blockchain
