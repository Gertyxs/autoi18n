module.exports = {
  /**
   * 需要国际化的语言种类
   */
  language: ['zh-cn', 'en-us'],
  /**
   * 国际化资源文件应用的 模块模式 根据这个模式 使用 module.exports 或者 export default
   * 如果localeFileExt 配置为json时 此配置不起效
   */
  modules: 'es6',
  /**
   * 需要国际化的目录
   */
  entry: ['./src'],
  /**
   * 国际化资源文件输出目录
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
   * 要忽略做国际化的方法
   */
  ignoreMethods: ['i18n.t', '$t'],
  /**
   * 要忽略做标签属性
   */
  ignoreTagAttr: ['class', 'style', 'src', 'href', 'width', 'height'],
  /**
   * 国际化对象方法，可以自定义使用方法返回 注意：如果改变国际化方法记得把该方法加到ignoreMethods忽略列表里面
   */
  i18nObjectMethod: 'i18n.t',
  /**
   * 国际化方法简写模式，可以自定使用方法返回 注意：如果改变国际化方法记得把该方法加到ignoreMethods忽略列表里面
   */
  i18nMethod: '$t',
  /**
   * 如果不喜欢又臭又长的key 可以自定义国际化配置文件的key 
   * 默认为 false 不自定义 
   */
  setMessageKey: false,
  /**
   * 生成md5的key长度 true: 32位字符 false: 16位字符
   */
  maxLenKey: false,
  /**
   * 国际化要注入到js里面的实例 会在js文件第一行注入
   */
  i18nInstance: "import i18n from '~/i18n'",
  /**
   * 格式化文件配置
   */
  prettier: {
    singleQuote: true,
    trailingComma: 'es5',
    endOfLine: 'lf',
  }
}