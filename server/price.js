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
let price = 0
getPrice()

// get bitstamp price every x minutes job
schedule.scheduleJob('*/9 * * * *', () => {
  getPrice()
})

// export price function
module.exports = () => price
