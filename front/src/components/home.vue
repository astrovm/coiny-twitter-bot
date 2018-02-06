<template>
  <section class="hero is-medium is-primary is-bold">
    <div class="hero-body">
      <div class="container">
        <h1 class="title">
          Bitcoin fees
        </h1>
        <div class="columns is-mobile">
          <div class="column"></div>
          <div class="column is-narrow">
            Time
            <ul>
              <li v-for="time in times">
                {{ time }}
              </li>
            </ul>
          </div>
          <div class="column is-narrow">
            Fee
            <ul>
              <li v-for="fee in fees">
                {{ fee }} sat/B
              </li>
            </ul>
          </div>
          <div class="column"></div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import api from '../api'

export default {
  name: 'Home',
  data () {
    return {
      fees: {},
      times: ['20 minutes', '40 minutes', '60 minutes', '2 hours', '4 hours', '8 hours', '24 hours', '3 days', '7 days']
    }
  },
  mounted: function () {
    const self = this
    api.getFees().then((fees) => {
      self.fees = fees.coiny
    })
  }
}
</script>

<style scoped>
</style>
