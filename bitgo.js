'use strict'

// require libs
const trae = require('trae')
const schedule = require('node-schedule')

// request bitgo api fees
const getFees = async () => {
  try {
    const res = await trae.get('https://www.bitgo.com/api/v1/tx/fee')
    const newfees = sortFees(res.data.feeByBlockTarget)
    return newfees
  } catch (e) {
    console.error(e)
    if (fees) return fees
    return e
  }
}

// sort fees object
const sortFees = (resFees) => {
  const feesSorted = Object.keys(resFees).sort((a, b) => resFees[b] - resFees[a]) // sort fee numbers
  const blocksSorted = Object.keys(resFees).sort((a, b) => a - b) // sort block target numbers
  // recreate fees object by matching sorted blocks with sorted fees
  let tempFees = {}
  for (let i = 0; i < feesSorted.length; i++) {
    tempFees[blocksSorted[i]] = Math.floor(resFees[feesSorted[i]] / 1000)
  }
  return tempFees
}

// select bitgo fee for specific block target
const feeFor = async (blocks) => {
  if (fees === {}) {
    fees = await getFees()
  }
  const keysSorted = Object.keys(fees).sort((a, b) => fees[a] - fees[b])
  for (let key in keysSorted) {
    if (keysSorted[key] <= blocks) {
      return fees[keysSorted[key]]
    }
  }
}

// init fees data
let fees = {}

// get bitgo fees every 3 minutes job
schedule.scheduleJob('*/3 * * * *', async () => {
  fees = await getFees()
})

// export feeFor function
exports.feeFor = feeFor
