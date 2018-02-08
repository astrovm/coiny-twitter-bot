<template>
  <section class="hero is-medium is-primary is-bold">
    <div class="hero-body">
      <div class="container">

        <h1 class="title is-3 has-text-centered">
          Bitcoin fee estimates
        </h1>

        <div class="columns is-mobile">
          <div class="column"></div>

          <div class="column is-narrow">
            <p class="subtitle is-5 has-text-centered">Time</p>
            <ul>
              <li v-for="time in times">
                <div class="level">

                  <div class="level-left">
                    <p class="level-item">
                      {{ time[0] }}
                    </p>
                  </div>

                  <div class="level-right">
                    <p class="level-item"></p>

                    <p class="level-item">
                      {{ time[1] }}
                    </p>
                  </div>
                </div>
              </li>
            </ul>
          </div>

          <div class="column is-narrow">
            <p class="subtitle is-5 has-text-centered">Fee</p>
            <ul>
              <li v-for="fee in fees">
                <div class="level">

                  <div class="level-left">
                    <p class="level-item">
                      {{ fee }}
                    </p>
                  </div>

                  <div class="level-right">
                    <p class="level-item"></p>

                    <p class="level-item">
                      sat/B
                    </p>
                  </div>
                </div>
              </li>
            </ul>
          </div>

          <div class="column is-narrow">
            <p class="subtitle is-5 has-text-centered">USD</p>
            <ul>
              <li v-for="fee in fees">
                <div class="level">

                  <div class="level-left">
                    <p class="level-item">
                      $
                    </p>
                  </div>

                  <div class="level-right">
                    <p class="level-item">
                      {{ (fee * $parent.price * 225 / 10 ** 8).toFixed(2) }}
                    </p>
                  </div>
                </div>
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
      times: [['20', 'minutes'], ['40', 'minutes'], ['60', 'minutes'], ['2', 'hours'], ['4', 'hours'], ['8', 'hours'], ['24', 'hours'], ['3', 'days'], ['7', 'days']]
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
