const URL = 'https://coiny.sh/api/v1/'

exports.getFees = () => {
  return fetch(URL + 'tx/fee/').then(res => res.json())
}

exports.getPrice = () => {
  return fetch(URL + 'price/btcusd/').then(res => res.json())
}
