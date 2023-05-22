<script setup>
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>

  <div class="tabs is-centered">
    <ul>
      <RouterLink to="/jp">日本語</RouterLink>
      <RouterLink to="/en">EN</RouterLink>
    </ul>
  </div>

    <div class="wrapper">

    </div>

    <RouterView />

</template>

<style scoped>
</style>
