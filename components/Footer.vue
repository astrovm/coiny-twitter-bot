<template>
  <footer class="footer">
    <div class="container">
      <div class="content has-text-centered">
        <p>
          Coiny 2018. Developed with <font-awesome-icon :icon="heartIcon" /> by <a href="https://twitter.com/astrolince" target="_blank">@astrolince</a>. 3A6wYhFxojTxVVAVKvm83yKzttgPQYXnQo
        </p>
        <p>
          The source code is licensed under a
          <a href="https://github.com/astrolince/coiny/blob/master/LICENSE" target="_blank">MPL 2.0</a>. The website content is licensed under a <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank">CC BY 4.0</a>.
        </p>
      </div>
    </div>
  </footer>
</template>

<script>
import FontAwesomeIcon from '@fortawesome/vue-fontawesome'
import { faHeart } from '@fortawesome/fontawesome-free-solid'

export default {
  computed: {
    heartIcon() {
      return faHeart
    }
  },
  components: {
    FontAwesomeIcon
  }
}
</script>

<style scoped>
.fa-heart {
  color: #ff4081;
}
</style>
