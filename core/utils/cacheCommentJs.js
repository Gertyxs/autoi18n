const baseUtils = require('./baseUtils')
/**
 * 对js注释缓存 恢复处理
 */
module.exports = {
  /**
   * 暂存Js注释对象
   */
  commentsCache: {},
  /**
   * 先去掉js的注释 暂存注释
   */
  stash(sourceCode, options) {
    this.commentsCache = {}
    let commentsIndex = 0
    sourceCode = sourceCode.replace(/(\/(\/.*))|(\/\*([\s\S]*?)\*\/)/g, (match, comment1, content1, comment2, content2, offset, string) => {
      let comment = ''
      let content = ''
      // 单行注释 防止匹配到url协议部分  类似 http://
      if (comment1 != undefined && comment1 != null && comment1.length > 0) {
        const len = '//'.length
        if (offset == 0) {
          // 匹配字符串起始就是 //，所以整行都是注释
          comment = comment1
          content = content1
        }
        // 获取当前字符串中第一个纯正的单选注释 //
        let idxSlash = 0;
        while ((idxSlash = comment1.indexOf('//', idxSlash)) >= 0) {
          let prefix = string.charAt(offset + idxSlash - 1)
          if (prefix === ':') {
            // 前一个字符是':'，所以不是单行注释
            idxSlash = idxSlash + len
            continue
          } else {
            // 拿出注释
            comment = comment1.substring(idxSlash, comment1.length)
            content = comment1.substring(idxSlash + len, comment1.length)
            break
          }
        }
      }
      // 多行注释
      if (comment2 !== undefined && comment2 !== null && comment2.length > 0) {
        comment = comment2
        content = content2
      }
      // 如果存在注释
      if (comment && content) {
        let commentsKey = `%%comment_js_${commentsIndex++}%%`
        this.commentsCache[commentsKey] = content
        return match.replace(content, commentsKey)
      } else {
        return match
      }
    })
    return sourceCode
  },
  /**
   * 恢复之前删除的注释
   */
  restore(sourceCode, options) {
    sourceCode = sourceCode.replace(/%%comment_js_\d+%%/gim, (match) => {
      return this.commentsCache[match]
    });
    this.commentsCache = {} // 清除缓存
    return sourceCode
  }
}