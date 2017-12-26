"use strict"

// conf libs
const Twitter = require('twitter')
const trae = require('trae')
const schedule = require('node-schedule')

const client = new Twitter({
})

//request bitgo api fees
let fees = {}
const getbitgofees = () => {
  trae.get('https://www.bitgo.com/api/v1/tx/fee')
    .then((res) => {
      fees = res.data.feeByBlockTarget
      console.log(`Updated BitGo fees: ${new Date()}`)
    })
    .catch((err) => {
      console.error(err)
    })
}
getbitgofees()

// select bitgo fee for specific block target
const bitgofeefor = (blocks) => {
  const keysSorted = Object.keys(fees).sort((a,b) => fees[a]-fees[b])
  for (let key in keysSorted) {
    if (keysSorted[key] <= blocks) {
      const satB = fees[keysSorted[key]]/1000
      return satB
    }
  }
}

// get bitgo fees every 7 minutes job
const bitgojob = schedule.scheduleJob('*/7 * * * *', () => {
  getbitgofees()
})

// hpurly tweet
const tweetjob = schedule.scheduleJob('0 * * * *', () => {
  if (Object.getOwnPropertyNames(fees).length > 0) { // if fees obj is not empty
    const tweet = `20 min ${bitgofeefor(2)} sat/B
40 min ${bitgofeefor(4)} sat/B
60 min ${bitgofeefor(6)} sat/B
2 hours ${bitgofeefor(12)} sat/B
4 hours ${bitgofeefor(24)} sat/B
8 hours ${bitgofeefor(48)} sat/B
24 hours ${bitgofeefor(144)} sat/B
3 days ${bitgofeefor(504)} sat/B
7 days ${bitgofeefor(1008)} sat/B`
    // tweet
    client.post('statuses/update', {status: tweet},  function(err, tweet, res) {
      ((err) ? console.log(err) : console.log(`Tweet created at: ${tweet.created_at}`))
    })
  }
})
