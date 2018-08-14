'use strict'

// require libs
const trae = require('trae')
const schedule = require('node-schedule')

// request smartbit api totals
const getTotals = async () => {
  try {
    const res = await trae.get('https://api.smartbit.com.au/v1/blockchain/totals')
    totals = res.data.totals
    return totals
  } catch (err) {
    console.error(err)
    if (totals) return totals
    return err
  }
}

// init totals data
let totals = {}
getTotals()

// get smartbit totals every x minutes job
schedule.scheduleJob('9-59/10 * * * *', () => {
  getTotals()
})

// export totals function
module.exports = () => totals
