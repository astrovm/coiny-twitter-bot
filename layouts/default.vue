<template>
  <div id="app">
    <my-header/>
    <nuxt/>
    <my-footer/>
  </div>
</template>

<script>
import MyHeader from '../components/Header.vue'
import MyFooter from '../components/Footer.vue'

export default {
  components: {
    MyHeader,
    MyFooter
  },
  data () {
    return {
      price: 0
    }
  },
  methods: {
    getPrice () {
      const URL = 'https://coiny.sh/api/v1/'
      return fetch(URL + 'price/btcusd/').then(res => res.json())
    },
    updatePrice () {
      this.getPrice().then((price) => {
        this.price = price.last
      })
    },
    livePrice () {
      const Pusher = require('pusher-js')
      const pusher = new Pusher('de504dc5763aeef9ff52')
      const tradesChannel = pusher.subscribe('live_trades')
      tradesChannel.bind('trade', data => {
        this.price = data.price
      })
    }
  },
  mounted: function () {
    this.updatePrice()
    this.livePrice()
  }

}
</script>

<style>
</style>
