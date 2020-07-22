<template>
  <v-app id="app">
   <iframe class="frame" src="https://www.thecloudgate.co.kr/"></iframe>
    <router-view/>
  </v-app>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
  html {
    overflow: hidden;
  }
  iframe.frame {
    position:fixed;
    top:0;
    left:0;
    width: 100%;
    height: 100%;
  }
</style>
