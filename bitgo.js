"use strict"

// require libs
const trae = require('trae')
const schedule = require('node-schedule')

// request bitgo api fees
let fees = {}
const getFees = () => {
  trae.get('https://www.bitgo.com/api/v1/tx/fee')
    .then((res) => {
      fees = sortFees(res.data.feeByBlockTarget)
      console.log(`Updated BitGo fees: ${new Date()}`)
    })
    .catch((err) => {
      console.error(err)
    })
}

// sort fees object
const sortFees = (resFees) => {
  const feesSorted = Object.keys(resFees).sort((a, b) => resFees[b] - resFees[a]) // sort fee numbers
  const blocksSorted = Object.keys(resFees).sort((a, b) => a - b) // sort block target numbers
  // recreate fees object by matching sorted blocks with sorted fees
  let tempFees = {}
  for (let i = 0; i < feesSorted.length; i++) {
    tempFees[blocksSorted[i]] = resFees[feesSorted[i]]
  }
  return tempFees
}

// select bitgo fee for specific block target
const feeFor = (blocks) => {
  const keysSorted = Object.keys(fees).sort((a,b) => fees[a] - fees[b])
  for (let key in keysSorted) {
    if (keysSorted[key] <= blocks) {
      const satB = Math.floor(fees[keysSorted[key]]/1000)
      return satB
    }
  }
}

// init fees data
getFees()

// get bitgo fees every 3 minutes job
const getFeesJob = schedule.scheduleJob('*/3 * * * *', () => {
  getFees()
})

// export feeFor function
exports.feeFor = feeFor
