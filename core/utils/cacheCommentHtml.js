
/**
 * 对html注释缓存 恢复处理
 */
module.exports = {
  /**
   * 暂存html注释对象
   */
  commentsCache: {},
  /**
   * 先去掉html的注释 暂存注释
   */
  stash(sourceCode, options) {
    this.commentsCache = {}
    let commentsIndex = 0
    sourceCode = sourceCode.replace(/<!--([\s\S]*?)-->/gm, (match, content) => {
      let commentsKey = `%%comment_html_${commentsIndex++}%%`
      this.commentsCache[commentsKey] = content
      return `<!--${commentsKey}-->`
    })
    return sourceCode
  },
  /**
   * 恢复之前删除的注释
   */
  restore(sourceCode, options) {
    sourceCode = sourceCode.replace(/%%comment_html_\d+%%/gim, (match) => {
      return this.commentsCache[match]
    });
    this.commentsCache = {} // 清除缓存
    return sourceCode
  }
}