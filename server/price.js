'use strict'

// require libs
const schedule = require('node-schedule')
const ba = require('bitcoinaverage');

var publicKey = process.env.BITCOINAVERAGE_PUBLIC
var secretKey = process.env.BITCOINAVERAGE_SECRET

var restClient = ba.restfulClient(publicKey, secretKey);
var wsClient = ba.websocketClient(publicKey, secretKey);

// request api price
const getPrice = () => {
  const symbol_set = 'global'
  const symbol = 'BTCUSD'

  restClient.getTickerDataPerSymbol('global', 'BTCUSD', (res) => {
    price = JSON.parse(res).last
  }, (err) => {
    console.log(err)
  })
}

// init price data
let price = 0
getPrice()

// get bitcoinaverage price every x minutes job
schedule.scheduleJob('9-59/10 * * * *', () => {
  getPrice()
})

// export price function
module.exports = () => price
