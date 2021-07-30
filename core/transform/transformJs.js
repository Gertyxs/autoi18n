const cacheCommentJs = require('../utils/cacheCommentJs')
const cacheI18nField = require('../utils/cacheI18nField')
const ast = require('./ast')
const baseUtils = require('../utils/baseUtils')

/**
 * @param {*} options.code 源代码 
 * @param {*} options.file 文件对象 
 * @param {*} options.options 国际化配置对象 
 * @param {*} options.messages 国际化字段对象 
 * @param {*} options.codeType 代码类型 
 * @param {*} options.ext 文件类型 
 * @returns 
 */
module.exports = function ({ code, file, options, messages, codeType = 'js', ext = '.js' }) {
  // 复制一份国际化数据配置
  const oldMessages = JSON.stringify(messages)
  // 暂存注释
  // code = cacheCommentJs.stash(code, options)
  // 暂存已经设置的国际化字段
  // code = cacheI18nField.stash(code, options)
  // 转换js
  code = ast({ code, file, options, messages, ext, codeType })
  // 恢复注释
  // code = cacheCommentJs.restore(code, options)
  // 恢复已经设置的国际化字段
  // code = cacheI18nField.restore(code, options)
  // 国际化数据发生变化才注入 证明该js有国际化字段
  if (oldMessages !== JSON.stringify(messages)) {
    // 注入实例
    code = baseUtils.injectInstance({ code, ext, options })
  }
  return code
}
