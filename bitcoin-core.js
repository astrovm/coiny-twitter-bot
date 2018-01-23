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
      console.log(`Bitcoin ${res[1].subversion}`)
      console.log(`Blocks: ${res[0].blocks} (${(res[0].verificationprogress * 100).toFixed(2)}%)`)
      console.log(`Connections: ${res[1].connections}`)
    }).catch((err) => {
      console.error(err)
    })
}

// request fees
const getFees = async () => {
  try {
    const batch = [
      { method: 'estimatesmartfee', parameters: [1] },
      { method: 'estimatesmartfee', parameters: [2] },
      { method: 'estimatesmartfee', parameters: [3] },
      { method: 'estimatesmartfee', parameters: [4] },
      { method: 'estimatesmartfee', parameters: [5] },
      { method: 'estimatesmartfee', parameters: [6] },
      { method: 'estimatesmartfee', parameters: [8] },
      { method: 'estimatesmartfee', parameters: [12] },
      { method: 'estimatesmartfee', parameters: [13] },
      { method: 'estimatesmartfee', parameters: [21] },
      { method: 'estimatesmartfee', parameters: [24] },
      { method: 'estimatesmartfee', parameters: [34] },
      { method: 'estimatesmartfee', parameters: [48] },
      { method: 'estimatesmartfee', parameters: [55] },
      { method: 'estimatesmartfee', parameters: [72] },
      { method: 'estimatesmartfee', parameters: [89] },
      { method: 'estimatesmartfee', parameters: [108] },
      { method: 'estimatesmartfee', parameters: [144] },
      { method: 'estimatesmartfee', parameters: [216] },
      { method: 'estimatesmartfee', parameters: [233] },
      { method: 'estimatesmartfee', parameters: [288] },
      { method: 'estimatesmartfee', parameters: [360] },
      { method: 'estimatesmartfee', parameters: [377] },
      { method: 'estimatesmartfee', parameters: [432] },
      { method: 'estimatesmartfee', parameters: [504] },
      { method: 'estimatesmartfee', parameters: [610] },
      { method: 'estimatesmartfee', parameters: [576] },
      { method: 'estimatesmartfee', parameters: [648] },
      { method: 'estimatesmartfee', parameters: [720] },
      { method: 'estimatesmartfee', parameters: [792] },
      { method: 'estimatesmartfee', parameters: [864] },
      { method: 'estimatesmartfee', parameters: [936] },
      { method: 'estimatesmartfee', parameters: [987] },
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
  for (let i in req) {
    res[req[i].blocks] = Math.floor(req[i].feerate * 10 ** 8)
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
  const feeData = (Object.keys(fees).length === 0) ? await getFees() : fees  // if fees obj is empty fill it
  const feeDataSorted = Object.keys(feeData).sort((a, b) => b - a) // sort block targets from highest to lowest
  const minBlock = parseInt(feeDataSorted.slice(-1)[0])
  let res = {}
  for (let b in blocks) {
    const target = (blocks[b] < minBlock) ? minBlock : blocks[b]
    for (let i in feeDataSorted) {
      if (target >= feeDataSorted[i]) {
        res[blocks[b]] = feeData[feeDataSorted[i]]
        break
      }
    }
  }
  return res
}

// init fees data, get node info
let fees = {}
getFees()
getNodeInfo()

// get core fees every 3 minutes job
schedule.scheduleJob('*/3 * * * *', () => {
  getFees()
})

// export feeFor function
exports.feeFor = feeFor
