const md5 = require('crypto-js/md5')

module.exports = {
  /**
   * 是否是中文
   * @param value 内容
   */
  isChinese(value) {
    return /[\u4e00-\u9fa5]/.test(value)
  },
  /**
   * md5加密
   * @param value 加密参数
   */
  md5(value) {
    return md5(value).toString()
  },
  /**
   * 匹配是否导入某个模块 es6 模式
   * @param moduleName 模块名称
   */
  // matchImportModule(moduleName) {
  //   return new RegExp(`(import\\s+(?:(?:\\w+|{(?:\\s*\\w\\s*,?\\s*)+})\\s+from)?\\s*['"\`](${moduleName}+?)['"\`])`, 'gm');
  // },
  /**
   * 匹配是否导入某个模块 commonjs 模式
   * @param moduleName 模块名称
   */
  // matchRequireModule(moduleName) {
  //   return new RegExp(`(?:var|let|const)\\s+(?:(?:\\w+|{(?:\\s*\\w\\s*,?\\s*)+}))\\s*=\\s*require\\s*\\(\\s*['"\`](${moduleName}+?)['"\`]\\s*\\)`, 'gm');
  // },
  /**
   * 字符串正则转义
   * @param value 加密参数
   */
  stringRegEscape(value) {
    return value.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
  },
  /**
   * 注入国际化实例
   * @param options 国际化配置对象
   */
  injectInstance({ code, ext, options }) {
    // 如果存在需要注入的文件 进行注入
    if (options.i18nInstance) {
      const matchInstance = code.match(new RegExp(this.stringRegEscape(options.i18nInstance), 'gm'))
      // 如果已经存在实例直接返回
      if (matchInstance) return code
      return `${options.i18nInstance}\n${code.trim()}`
    }
    return code
  },
  /**
   * 去掉首尾空白字符，中间的连续空白字符替换成一个空格
   */
  formatWhitespace(str) {
    return str.trim().replace(/\s+/g, ' ')
  }
}