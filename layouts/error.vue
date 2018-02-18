<template>
  <section class="hero is-large is-danger is-bold">
    <div class="hero-body">
      <div class="container has-text-centered">
        <h1 class="title is-3" v-if="error.statusCode === 404">Page not found</h1>
        <h1 class="title is-3" v-else>An error occurred</h1>
        <nuxt-link class="subtitle is-3" to="/">Home page</nuxt-link>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  props: ['error']
}
</script>
