const cacheCommentJs = require('../utils/cacheCommentJs')
const cacheI18nField = require('../utils/cacheI18nField')
const ast = require('./ast')

/**
 * @param {*} options.code 源代码 
 * @param {*} options.options 国际化配置对象 
 * @param {*} options.messages 国际化字段对象 
 * @param {*} options.ext 文件类型 
 * @returns 
 */
module.exports = function ({ code, options, messages, ext = '.jsx' }) {
  // 暂存注释 react 注释 就是js注释
  code = cacheCommentJs.stash(code, options)
  // 暂存已经设置的国际化字段
  code = cacheI18nField.stash(code, options)
  // 转换react
  code = ast({ code, options, messages, ext, codeType: 'jsx' })
  // 恢复注释
  code = cacheCommentJs.restore(code, options)
  // 恢复已经设置的国际化字段
  code = cacheI18nField.restore(code, options)
  return code
}
