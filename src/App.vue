<script setup>
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>

  <div class="tabs is-centered">
    <ul>
      <!-- <li class="is-active"><a>Pictures</a></li> -->
      <RouterLink to="/">EN</RouterLink>
      <RouterLink to="/jp">日本語</RouterLink>
    </ul>
  </div>

    <div class="wrapper">

    </div>

    <RouterView />

</template>

<style scoped>
</style>
