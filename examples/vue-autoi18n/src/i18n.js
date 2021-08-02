import Vue from 'vue'
import VueI18n from 'vue-i18n'

Vue.use(VueI18n)

const messages = {}
const files = require.context('./locales', true, /\.json$/)

files.keys().forEach((key) => {
  const name = key.replace(/^\.\/(.*)\.\w+$/, '$1')
  messages[name] = files(key)
})

const i18n = new VueI18n({
  locale: 'zh-cn',
  fallbackLocale: 'zh-cn',
  messages,
})

export default i18n
