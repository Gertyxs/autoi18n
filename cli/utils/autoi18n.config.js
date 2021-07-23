module.exports = {
  /**
   * 需要国际化的语言种类
   */
  language: ['zh-cn', 'en-us'],
  /**
   * 国际化配置文件应用的 模块模式 根据这个模式 使用 module.exports 或者 export default
   * 如果localeFileExt 配置为json时 此配置不起效
   */
  modules: 'es6',
  /**
   * 需要国际化的目录
   */
  entry: ['./src'],
  /**
   * 国际化配置文件输出目录
   */
  localePath: './src/locales',
  /**
   * 国际化文件类型 默认 为 .json文件 支持.js和.json
   */
  localeFileExt: '.json',
  /**
   * 需要处理国际化的文件后缀
   */
  extensions: [],
  /**
   * 需要排除国际化的文件 glob模式数组
   */
  exclude: [],
  /**
   * 设置读取国际化方法名称的列表 此项配置用来去除已经设置了国际化项 防止重复做国际化
   */
  i18nIdent: ['this.$t', '$t'],
  /**
   * vue单文件组织 js 读取的方法
   */
  vueJsIdent: 'this.$t',
  /**
   * vue单文件组织 标签 读取的方法
   */
  vueTagIdent: '$t',
  /**
   * react js 读取的方法
   */
  reactJsIdent: '$t',
  /**
   * react 标签 读取的方法
   */
  reactTagIdent: '$t',
  /**
   * js 读取的方法
   */
  jsIdent: '$t',
  /**
   * 如果不喜欢又臭又长的key 可以自定义国际化配置文件的key 
   * 默认为 false 不自定义 
   */
  setMessageKey: false,
  /**
   * 国际化要注入到js里面的实例 会在js文件第一行注入
   */
  i18nInstance: '',
  /**
   * 哪些后缀文件需要注入 默认在所有js文件和script标签第一行注入
   */
  i18nInstanceExt: ['.js']
}