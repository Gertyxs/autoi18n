<template>
  <div id="app">
    <img alt="Vue logo" src="./assets/logo.png">
    地方法规的
    <div>{{true ? '是的法规' : `招待费`}} {{`${'sds三个'}`}}</div>
    <div aa="sdfg水电费" :bbb="'规划局'"></div>
    <HelloWorld msg="Welcome to Your Vue.js App"/>
  </div>
</template>

<script>
import HelloWorld from './components/HelloWorld.vue'

export default {
  name: 'App',
  components: {
    HelloWorld
  },
  created () {
    var a = '阿凡达'
    let b = `dsf视图`
    const c = `${'大师法规规范化'}`
    let d = `${true ? '电饭锅和' : 'sdf'}`
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
