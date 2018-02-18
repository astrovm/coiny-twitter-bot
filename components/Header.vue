<template>
  <nav class="navbar is-dark" role="navigation" aria-label="main navigation">
    <div class="navbar-brand">
      <a class="navbar-item" href="/">
        <img src="../assets/img/logo.png" alt="Coiny" width="100" height="28">
      </a>
      <a class="navbar-item">
        BTC: {{ parseFloat(price).toFixed(2) }} USD
      </a>
      <div class="button navbar-burger is-dark" v-on:click="showNav = !showNav" v-bind:class="{ 'is-active' : showNav }">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>

    <div class="navbar-menu has-text-centered" v-bind:class="{ 'is-active' : showNav }">
      <div class="navbar-end">
        <router-link class="navbar-item" to="/">
          Home
        </router-link>
        <router-link class="navbar-item" to="about">
          About
        </router-link>
        <a class="navbar-item" href="https://twitter.com/coinyfees" target="_blank">
          <span class="icon">
            <i class="fab fa-twitter"></i>
          </span>
        </a>
        <a class="navbar-item" href="https://github.com/astrolince/coiny" target="_blank">
          <span class="icon">
            <i class="fab fa-github"></i>
          </span>
        </a>
      </div>
    </div>
  </nav>
</template>

<script>
export default {
  data() {
    return {
      showNav: false,
      price: 0
    }
  },
  methods: {
    getPrice() {
      const URL = 'https://coiny.sh/api/v1/'
      return fetch(URL + 'price/btcusd/').then(res => res.json())
    },
    updatePrice() {
      this.getPrice().then((price) => {
        this.price = price.last
      })
    },
    livePrice() {
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
