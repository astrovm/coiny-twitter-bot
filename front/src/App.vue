<template>
  <div id="app">
    <nav class="navbar is-dark" role="navigation" aria-label="main navigation">
      <div class="navbar-brand">
        <a class="navbar-item" href="https://coiny.sh/">
          <p>
            <img src="./assets/coiny-logo.png" alt="Coiny" width="100" height="28">
          </p>
        </a>
        <div class="navbar-burger burger" data-target="navbarExampleTransparentExample">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>

      <div id="navbarExampleTransparentExample" class="navbar-menu">
        <div class="navbar-start">
          <a class="navbar-item" href="https://coiny.sh/">
            Home
          </a>
          <a class="navbar-item">
            BTC: {{ price }} USD
          </a>
        </div>

        <div class="navbar-end">
          <div class="navbar-item">
            <div class="field is-grouped">
              <p class="control">
                <a class="bd-tw-button button" data-social-network="Twitter" target="_blank" href="https://twitter.com/coinyfees">
                  <span class="icon">
                    <i class="fab fa-twitter"></i>
                  </span>
                  <span>
                    Twitter
                  </span>
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <router-view/>

    <footer class="footer">
      <div class="container">
        <div class="content has-text-centered">
          <p>
            <strong>Coiny 2018</strong>. Developed with <i class="fas fa-heart"></i> by <a href="https://twitter.com/astrolince">@astrolince</a>. The source code is licensed
            <a href="https://github.com/astrolince/coiny/blob/master/LICENSE">MPL 2.0</a>.
          </p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script>
import api from './api'

export default {
  name: 'App',
  data () {
    return {
      price: 0
    }
  },
  mounted: function () {
    const self = this
    api.getPrice().then((price) => {
      self.price = price.last
    })
  }
}
</script>

<style>
.fa-heart {
    color: #ff4081;
}

#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
}
</style>
