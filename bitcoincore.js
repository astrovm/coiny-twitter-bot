'use strict'

// require libs
const Bitcoin = require('bitcoin-core')
const schedule = require('node-schedule')

// conf bitcoin rpc
const rpc = new Bitcoin({
  network: 'mainnet',
  host: process.env.BITCOIN_CORE_HOST,
  port: process.env.BITCOIN_CORE_PORT,
  username: process.env.BITCOIN_CORE_USER,
  password: process.env.BITCOIN_CORE_PASS
})

// get info from bitcoin node
const getNodeInfo = () => {
  const batch = [
    { method: 'getblockchaininfo', parameters: [] },
    { method: 'getnetworkinfo', parameters: [] }
  ]
  rpc.command(batch)
    .then((res) => {
      console.log(`Node version: ${res[1].subversion}`)
      console.log(`Node blocks: ${res[0].blocks} (${(res[0].verificationprogress * 100).toFixed(2)}%)`)
      console.log(`Node connections: ${res[1].connections}`)
    }).catch((err) => {
      console.error(err)
    })
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
    { method: 'estimatesmartfee', parameters: [72] },
    { method: 'estimatesmartfee', parameters: [108] },
    { method: 'estimatesmartfee', parameters: [144] },
    { method: 'estimatesmartfee', parameters: [216] },
    { method: 'estimatesmartfee', parameters: [288] },
    { method: 'estimatesmartfee', parameters: [360] },
    { method: 'estimatesmartfee', parameters: [432] },
    { method: 'estimatesmartfee', parameters: [504] },
    { method: 'estimatesmartfee', parameters: [576] },
    { method: 'estimatesmartfee', parameters: [648] },
    { method: 'estimatesmartfee', parameters: [720] },
    { method: 'estimatesmartfee', parameters: [792] },
    { method: 'estimatesmartfee', parameters: [864] },
    { method: 'estimatesmartfee', parameters: [936] },
    { method: 'estimatesmartfee', parameters: [1008] }
  ]
  rpc.command(batch)
    .then((res) => {
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
    tempFees[resfees[fee].blocks] = Math.floor(resfees[fee].feerate * 100000)
  }
  return tempFees
}

// select fee for specific block target
const feeFor = (blocks) => {
  const keysSorted = Object.keys(fees).sort((a, b) => fees[a] - fees[b])
  for (let key in keysSorted) {
    if (keysSorted[key] <= blocks) {
      return fees[keysSorted[key]]
    }
  }
}

// init fees data, get node info
getFees()
getNodeInfo()

// get core fees every 3 minutes job
schedule.scheduleJob('*/3 * * * *', () => {
  getFees()
})

// hourly get node info
schedule.scheduleJob('0 * * * *', () => {
  getNodeInfo()
})

// export feeFor function
exports.feeFor = feeFor
