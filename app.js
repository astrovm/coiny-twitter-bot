"use strict"

// conf libs
const Twitter = require('twitter')
const trae = require('trae')
const schedule = require('node-schedule')

const client = new Twitter({
})

// request bitgo api fees
let bitGoFees = {}
const getBitGoFees = () => {
  trae.get('https://www.bitgo.com/api/v1/tx/fee')
    .then((res) => {
      bitGoFees = sortBitGoFees(res.data.feeByBlockTarget)
      tweet = buildTweet()
      console.log(`Updated BitGo fees: ${new Date()}`)
    })
    .catch((err) => {
      console.error(err)
    })
}

// sort fees object
const sortBitGoFees = (resFees) => {
  const feesSorted = Object.keys(resFees).sort((a, b) => resFees[b] - resFees[a]) // sort fee numbers
  const blocksSorted = Object.keys(resFees).sort((a, b) => a - b) // sort block target numbers
  // recreate fees object by matching sorted blocks with sorted fees
  let tempBitGofees = {}
  for (let i = 0; i < feesSorted.length; i++) {
    tempBitGofees[blocksSorted[i]] = resFees[feesSorted[i]]
  }
  return tempBitGofees
}

// select bitgo fee for specific block target
const bitGoFeeFor = (blocks) => {
  const keysSorted = Object.keys(bitGoFees).sort((a,b) => bitGoFees[a] - bitGoFees[b])
  for (let key in keysSorted) {
    if (keysSorted[key] <= blocks) {
      const satB = bitGoFees[keysSorted[key]]/1000
      return satB
    }
  }
}

// build tweet
let tweet
const buildTweet = () =>
`20 min ${bitGoFeeFor(2)} sat/B
40 min ${bitGoFeeFor(4)} sat/B
60 min ${bitGoFeeFor(6)} sat/B
2 hours ${bitGoFeeFor(12)} sat/B
4 hours ${bitGoFeeFor(24)} sat/B
8 hours ${bitGoFeeFor(48)} sat/B
24 hours ${bitGoFeeFor(144)} sat/B
3 days ${bitGoFeeFor(504)} sat/B
7 days ${bitGoFeeFor(1008)} sat/B`

// init fees data
getBitGoFees()

// get bitgo fees every 7 minutes job
const bitGoJob = schedule.scheduleJob('*/7 * * * *', () => {
  getBitGoFees()
})

// hpurly tweet
const tweetJob = schedule.scheduleJob('0 * * * *', () => {
  if (Object.getOwnPropertyNames(bitGoFees).length > 0) { // if fees obj is not empty
    // tweet
    client.post('statuses/update', {status: tweet},  function(err, tweet, res) {
      ((err) ? console.log(err) : console.log(`Tweet created at: ${tweet.created_at}`))
    })
  }
})
