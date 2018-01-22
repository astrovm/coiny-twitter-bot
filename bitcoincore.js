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
const getFees = async () => {
  try {
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
    const res = await rpc.command(batch)
    const feesObj = await buildFeesObj(res)
    const newFees = await sortFees(feesObj)
    fees = newFees
    return newFees
  } catch (err) {
    console.error(err)
    if (fees) return fees
    return err
  }
}

// build fees obj
const buildFeesObj = (req) => {
  let res = {}
  for (let fee in req) {
    res[req[fee].blocks] = Math.floor(req[fee].feerate * 10 ** 8)
  }
  return res
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

// init fees data, get node info
let fees = {}
getNodeInfo()

// get core fees every 3 minutes job
schedule.scheduleJob('*/3 * * * *', () => {
  getFees()
})

// export feeFor function
exports.feeFor = feeFor
