<template>
  <nav class="navbar is-dark" role="navigation" aria-label="main navigation">
    <div class="navbar-brand">
      <a class="navbar-item" href="/">
        <img src="../assets/img/logo.png" alt="Coiny" width="100" height="28">
      </a>
      <a class="navbar-item">
        BTC: {{ parseFloat($parent.price).toFixed(2) }} USD
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
            <font-awesome-icon :icon="twitterIcon" />
          </span>
        </a>
        <a class="navbar-item" href="https://github.com/astrolince/coiny" target="_blank">
          <span class="icon">
            <font-awesome-icon :icon="githubIcon" />
          </span>
        </a>
      </div>
    </div>
  </nav>
</template>

<script>
import FontAwesomeIcon from '@fortawesome/vue-fontawesome'
import { faTwitter, faGithub } from '@fortawesome/fontawesome-free-brands'

export default {
  computed: {
    twitterIcon() {
      return faTwitter
    },
    githubIcon() {
      return faGithub
    }
  },
  components: {
    FontAwesomeIcon
  },
  data() {
    return {
      showNav: false
    }
  }
}
</script>
