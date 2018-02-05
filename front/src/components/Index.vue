<template>
  <section class="hero is-medium is-success is-bold">
    <div class="hero-body">
      <div class="container">
        <h1 class="title">
          Full Height title
        </h1>
        <div class="columns is-gapless">
          <div class="column">
            {{ msg }}
          </div>
          <div class="column">
            Time
            <ul>
              <li v-for="fee in fees">
                {{ fee }}
              </li>
            </ul>
          </div>
          <div class="column">
            Fee
          </div>
          <div class="column">
            No gap
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import getFees from '../api'

export default {
  name: 'Index',
  data () {
    return {
      msg: 'Welcome to Your Vue.js App',
      fees: {}
    }
  },
  mounted: function () {
    const self = this
    getFees()
      .then(function (fees) {
        self.fees = fees
      })
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
