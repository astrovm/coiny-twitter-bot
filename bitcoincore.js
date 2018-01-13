"use strict"

// require libs
const Bitcoin = require('bitcoin-core')
const schedule = require('node-schedule')

// conf bitcoin rpc
const rpc = new Bitcoin({
  network: 'mainnet',
  host: '',
  port: '',
  username: '',
  password: ''
})

// get info from bitcoin node
const getNodeInfo = () => {
  const batch = [
    { method: 'getblockchaininfo', parameters: [] },
    { method: 'getnetworkinfo', parameters: [] }
  ]
  rpc.command(batch).then((res) => console.log(res))
}

// request fees
let fees = {}
const getFees = () => {
  const batch = [
    { method: 'estimatesmartfee', parameters: [2] },
    { method: 'estimatesmartfee', parameters: [4] },
    { method: 'estimatesmartfee', parameters: [6] },
    { method: 'estimatesmartfee', parameters: [12] },
    { method: 'estimatesmartfee', parameters: [24] },
    { method: 'estimatesmartfee', parameters: [48] },
    { method: 'estimatesmartfee', parameters: [144] },
    { method: 'estimatesmartfee', parameters: [504] },
    { method: 'estimatesmartfee', parameters: [1008] }
  ]
  rpc.command(batch).then((res) => {
    fees = buildFeesObj(res)
    console.log(`Updated Core fees: ${new Date()}`)
  }).catch((err) => {
    console.error(err)
  })
}

// build fees obj
const buildFeesObj = (resfees) => {
  let tempFees = {}
  for (let fee in resfees) {
    tempFees[resfees[fee].blocks] = Math.floor(resfees[fee].feerate*100000)
  }
  return tempFees
}

// select fee for specific block target
const feeFor = (blocks) => {
  const keysSorted = Object.keys(fees).sort((a,b) => fees[a] - fees[b])
  for (let key in keysSorted) {
    if (keysSorted[key] <= blocks) {
      return fees[keysSorted[key]]
    }
  }
}

// init fees data
getFees()

// get core fees every 3 minutes job
const getFeesJob = schedule.scheduleJob('*/3 * * * *', () => {
  getFees()
  console.log(fees)
})

const asd = schedule.scheduleJob('*/1 * * * *', () => {
  console.log(feeFor(2))
})

// export feeFor function
exports.feeFor = feeFor
