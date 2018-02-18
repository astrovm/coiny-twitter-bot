<template>
  <section class="hero is-success is-fullheight">
    <my-header/>
    <nuxt/>
    <my-footer/>
  </section>
</template>

<script>
import MyHeader from '../components/Header.vue'
import MyFooter from '../components/Footer.vue'

export default {
  components: {
    MyHeader,
    MyFooter
  }
}
</script>

<style>
</style>
