<template>
  <div class="userBtn">
    <v-btn class="btn" color="#4caf50" fab dark large @click="openRtc">
      <v-icon>mdi-cellphone</v-icon>
    </v-btn>
  </div>
</template>

<script>
export default {
  name: 'Index',
  data () {
    return {
    }
  },
  methods: {
    openRtc () {
      this.$janus.send({ message: { request: 'register', username: 'user' } })
      this.$router.push('/user')
    }
  },
  mounted () {
  }
}
</script>

<style>
  .userBtn .btn {
    position:fixed;
    bottom:25px;
    left: 25px;
  }
</style>
