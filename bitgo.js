'use strict'

// require libs
const trae = require('trae')
const schedule = require('node-schedule')

// request bitgo api fees
const getFees = async () => {
  try {
    const res = await trae.get('https://www.bitgo.com/api/v1/tx/fee')
    const newFees = await sortFees(res.data.feeByBlockTarget)
    fees = newFees
    return newFees
  } catch (err) {
    console.error(err)
    if (fees) return fees
    return err
  }
}

// sort fees object
const sortFees = (req) => {
  const feesSorted = Object.keys(req).sort((a, b) => req[b] - req[a]) // sort fee numbers
  const blocksSorted = Object.keys(req).sort((a, b) => a - b) // sort block target numbers
  // recreate fees object by matching sorted blocks with sorted fees
  let res = {}
  for (let i in feesSorted) {
    res[blocksSorted[i]] = Math.floor(req[feesSorted[i]] / 1000)
  }
  return res
}

// select fee for specific block target
const feeFor = async (blocks) => {
  let tempFees = {}
  if (Object.keys(fees).length === 0) {
    tempFees = await getFees()
  } else {
    tempFees = fees
  }
  const keys = Object.keys(tempFees).sort((a, b) => tempFees[a] - tempFees[b])
  let res = {}
  for (let b in blocks) {
    for (let k in keys) {
      if (blocks[b] >= keys[k]) {
        res[blocks[b]] = tempFees[keys[k]]
        break
      }
    }
  }
  return res
}

// init fees data
let fees = {}

// get bitgo fees every 3 minutes job
schedule.scheduleJob('*/3 * * * *', () => {
  getFees()
})

// export feeFor function
exports.feeFor = feeFor
