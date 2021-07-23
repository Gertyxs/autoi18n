const baseUtils = require('./baseUtils')
/**
 * 对html模板进行缓存 恢复处理 jsx语法包含模板和js需要通过此方法分开
 */
module.exports = {
  /**
   * 暂存html模板对象
   */
  htmlTemplateCache: {},
  /**
   * 先去掉html模板 缓存
   */
  stash(sourceCode, options) {
    this.htmlTemplateCache = {}
    let htmlTemplateIndex = 0
    const htmlTemplateMatch = baseUtils.getNestedTags({ code: sourceCode })
    for (let index = 0; index < htmlTemplateMatch.length; index++) {
      sourceCode = sourceCode.replace(htmlTemplateMatch[index], (match) => {
        let htmlTemplateKey = `/%%html_template_${htmlTemplateIndex++}%%/`
        this.htmlTemplateCache[htmlTemplateKey] = match
        return htmlTemplateKey
      })
    }
    return sourceCode
  },
  /**
   * 恢复之前删除的html模板
   */
  restore(sourceCode, options) {
    sourceCode = sourceCode.replace(/\/%%html_template_\d+%%\//gim, (match) => {
      return this.htmlTemplateCache[match]
    });
    this.htmlTemplateCache = {} // 清除缓存
    return sourceCode
  }
}