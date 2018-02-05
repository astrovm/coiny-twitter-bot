const URL = 'https://coiny.sh/api/v1/tx/fee/'

export default function getFees() {
  return fetch(URL)
  	.then(res => res.json())
  	.then(json => console.log(json))
}
