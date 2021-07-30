const baseUtils = require('./baseUtils')
/**
 * 对已设置国际化的字段进行缓存 恢复
 * 忽略已经设置了国际化的字符串 防止key为中文时 会重复设置
 */
module.exports = {
  /**
   * 暂存国际化字符串对象
   */
  i18nFieldCache: {},
  /**
   * 先去掉国际化字符串 缓存
   */
  stash(sourceCode, options) {
    this.i18nFieldCache = {}
    let i18nFieldIndex = 0
    let ignoreMethods = options.ignoreMethods
    // 转义字符串
    ignoreMethods = ignoreMethods.map((item) => baseUtils.stringRegEscape(item))
    const ident = ignoreMethods.join('|')
    sourceCode = sourceCode.replace(new RegExp(`(${ident})\\([^\\(]+?\\)`, 'gm'), (match) => {
      let i18nFieldKey = `__i18n_field_${i18nFieldIndex++}__()`
      this.i18nFieldCache[i18nFieldKey] = match
      return i18nFieldKey
    })
    return sourceCode
  },
  /**
   * 恢复之前删除的国际化字符串
   */
  restore(sourceCode, options) {
    sourceCode = sourceCode.replace(/__i18n_field_\d+__\(\)/gm, (match) => {
      return this.i18nFieldCache[match]
    });
    this.i18nFieldCache = {} // 清除缓存
    return sourceCode
  }
}