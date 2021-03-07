<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>
<style>
body {
  height: 100%;
  margin: 0;
}
html {
  height: 100%;
  box-sizing: border-box;
}
#app {
  height: 100%;
  width: 100%;
}
</style>
