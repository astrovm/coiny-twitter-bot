<template>
  <div id="app">
    <nav class="navbar is-dark" role="navigation" aria-label="main navigation">
      <div class="navbar-brand">
        <a class="navbar-item" href="https://coiny.sh/">
          <img src="./assets/coiny-logo.png" alt="Coiny" width="100" height="28">
        </a>
        <a class="navbar-item">
          BTC: {{ price }} USD
        </a>
        <div class="button navbar-burger is-dark" v-on:click="showNav = !showNav" v-bind:class="{ 'is-active' : showNav }">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>

      <div class="navbar-menu" v-bind:class="{ 'is-active' : showNav }">
        <div class="navbar-end">
          <router-link class="navbar-item" to="/">
            Home
          </router-link>
          <router-link class="navbar-item" to="about">
            About
          </router-link>
          <a class="navbar-item" href="https://github.com/astrolince/coiny" target="_blank">
            <span class="icon">
              <i class="fab fa-github"></i>
            </span>
          </a>
          <a class="navbar-item" href="https://twitter.com/coinyfees" target="_blank">
            <span class="icon">
              <i class="fab fa-twitter"></i>
            </span>
          </a>
        </div>
      </div>
    </nav>

    <router-view/>

    <footer class="footer">
      <div class="container">
        <div class="content has-text-centered">
          <p>
            Coiny 2018. Developed with <i class="fas fa-heart"></i> by <a href="https://twitter.com/astrolince">@astrolince</a>. 3A6wYhFxojTxVVAVKvm83yKzttgPQYXnQo
          </p>
          <p>
            The source code is licensed under
            <a href="https://github.com/astrolince/coiny/blob/master/LICENSE">MPL 2.0</a>. The website content
        is licensed under <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>.
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
      showNav: false,
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

<style lang="scss">
// Import Bulma's core
@import "~bulma/sass/utilities/_all";

// Set your colors
$primary: #16a085;
$primary-invert: findColorInvert($primary);
$dark: #2d3436;
$dark-invert: findColorInvert($dark);

$background: $dark;

$link-hover: #1abc9c;

$navbar-background-color: $dark;
$navbar-dropdown-background-color: $primary;
$navbar-item-hover-background-color: $primary;
$navbar-dropdown-item-hover-background-color: $primary;
$navbar-dropdown-item-active-background-color: $primary;

$navbar-dropdown-color: $white;
$navbar-dropdown-arrow: $white;
$navbar-item-color: $white;
$navbar-dropdown-item-hover-color: $dark;
$navbar-item-hover-color: $dark;

$family-serif: BlinkMacSystemFont, -apple-system, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", "Helvetica", "Arial", sans-serif;
$family-primary: $family-serif;

// Setup $colors to use as bulma classes (e.g. 'is-twitter')
$colors: (
    "white": ($white, $black),
    "black": ($black, $white),
    "light": ($light, $light-invert),
    "dark": ($dark, $dark-invert),
    "primary": ($primary, $primary-invert),
    "info": ($info, $info-invert),
    "success": ($success, $success-invert),
    "warning": ($warning, $warning-invert),
    "danger": ($danger, $danger-invert)
);

// Links
$link: $primary;
$link-invert: $primary-invert;
$link-focus-border: $primary;

// Import Bulma and Buefy styles
@import "~bulma";
@import "~buefy/src/scss/buefy";

.fa-heart {
    color: #ff4081;
}

#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: white;
}
</style>
