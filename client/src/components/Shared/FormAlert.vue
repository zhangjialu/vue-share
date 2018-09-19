<template>
  <v-alert type="error" :value="true" transition="scale-transition" dismissible>
    <h3>{{message}}</h3>
  </v-alert>
</template>

<script>
export default {
  props: ['message']
}
</script>

<style>
.custom-loader {
  animation: loader 1s infinite;
  display: flex;
}
@keyframes loader {
  from {
    transform: rotate(0);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
