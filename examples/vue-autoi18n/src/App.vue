<template>
  <div id="app">
    <h1>{{ $t('1457a8cf081b42e8461e210209b9661c') }}</h1>
    <select @change="setLanguage" :value="lang">
      <option value="zh-cn">{{ $t('a7bac2239fcdcb3a067903d8077c4a07') }}</option>
      <option value="en-us">{{ $t('f9fb6a063d1856da86a06def2dc6b921') }}</option>
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
