'use strict'

// require libs
const trae = require('trae')
const schedule = require('node-schedule')

// request bitstamp api price
const getPrice = async () => {
  try {
    const res = await trae.get('https://www.bitstamp.net/api/ticker/')
    price = res.data.last
    return price
  } catch (err) {
    console.error(err)
    if (price) return price
    return err
  }
}

// init price data
let price = {}
getPrice()

// get bitstamp price every 3 minutes job
schedule.scheduleJob('*/3 * * * *', () => {
  getPrice()
})

// export price function
module.exports = () => price
