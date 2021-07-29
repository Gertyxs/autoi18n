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
    if (options.i18nInstanceExt && options.i18nInstanceExt.includes(ext)) {
      const matchInstance = code.match(new RegExp(this.stringRegEscape(options.i18nInstance), 'gm'))
      // 如果已经存在实例直接返回
      if (matchInstance) return code
      return `\n${options.i18nInstance}\n${code}`
    }
    return code
  }
}