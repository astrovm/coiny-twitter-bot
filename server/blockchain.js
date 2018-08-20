'use strict'

// require libs
const trae = require('trae')
const schedule = require('node-schedule')

// request smartbit api
const getBlockchain = async () => {
  try {
    const resTotals = await trae.get('https://api.smartbit.com.au/v1/blockchain/totals')
    const resBlockchainSize = await trae.get('https://api.smartbit.com.au/v1/blockchain/chart/block-size-total?from=2018-8-15')
    totals = resTotals.data.totals
    blockchainSize = resBlockchainSize.data.chart.data.slice(-1)[0].y/1000000000
  } catch (err) {
    console.error(err)
    return err
  }
}

// init data
let totals = {}
let blockchainSize = {}
getBlockchain()

// get smartbit data every x minutes job
schedule.scheduleJob('9-59/10 * * * *', () => {
  getBlockchain()
})

// export data
exports.totals = totals
exports.blockchainSize = blockchainSize
