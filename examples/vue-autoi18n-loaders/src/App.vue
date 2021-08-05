<template>
  <div id="app">
    <h1>欢迎使用 autoi18n</h1>
    <select @change="setLanguage" :value="lang">
      <option value="zh-cn">中文</option>
      <option value="en-us">英文</option>
    </select>
  </div>
</template>

<script>
import i18n from '@/i18n'
export default {
  name: 'App',
  data() {
    return {
      lang: 'zh-cn',
    }
  },
  components: {},
  created() {},
  methods: {
    setLanguage(e) {
      this.lang = e.target.value
      i18n.locale = this.lang
    },
  },
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
