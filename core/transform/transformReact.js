const cacheCommentJs = require('../utils/cacheCommentJs')
const cacheI18nField = require('../utils/cacheI18nField')
const ast = require('./ast')
const baseUtils = require('../utils/baseUtils')

/**
 * 转换react
 * @param {*} options.code 源代码
 * @param {*} options.options 国际化配置对象
 * @param {*} options.file 文件对象
 * @param {*} options.messages 国际化字段对象
 * @param {*} options.ext 文件类型
 * @returns
 */
module.exports = function ({ code, file, options, messages, ext = '.jsx' }) {
  // 复制一份国际化数据配置
  const oldMessages = JSON.stringify(messages)
  // 暂存注释 react 注释 就是js注释 ast替换的是字符串 所以可以不处理注释
  // code = cacheCommentJs.stash(code, options)
  // 暂存已经设置的国际化字段
  code = cacheI18nField.stash(code, options)
  // 转换react
  const lang = ['.ts', '.tsx'].includes(ext) ? 'ts' : 'js'
  code = ast({ code, file, options, messages, ext, codeType: 'jsx', lang })
  // 恢复注释
  // code = cacheCommentJs.restore(code, options)
  // 恢复已经设置的国际化字段
  code = cacheI18nField.restore(code, options)
  // 国际化数据发生变化才注入 证明该js有国际化字段
  if (oldMessages !== JSON.stringify(messages)) {
    // 注入实例
    code = baseUtils.injectInstance({ code, ext, options })
  }
  return code
}
