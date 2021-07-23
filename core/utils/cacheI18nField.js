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
    let i18nIdent = options.i18nIdent || ['this.$t', '$t']
    // 转义字符串
    i18nIdent = i18nIdent.map((item) => baseUtils.stringRegEscape(item))
    const ident = i18nIdent.join('|')
    sourceCode = sourceCode.replace(new RegExp(`(${ident})\\([^(]+\\)`, 'gm'), (match) => {
      let i18nFieldKey = `/%%i18nField_${i18nFieldIndex++}%%/`
      this.i18nFieldCache[i18nFieldKey] = match
      return i18nFieldKey
    })
    return sourceCode
  },
  /**
   * 恢复之前删除的国际化字符串
   */
  restore(sourceCode, options) {
    sourceCode = sourceCode.replace(/\/%%i18nField_\d+%%\//gm, (match) => {
      return this.i18nFieldCache[match]
    });
    this.i18nFieldCache = {} // 清除缓存
    return sourceCode
  }
}