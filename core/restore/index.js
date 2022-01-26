const baseUtils = require('../utils/baseUtils')
/**
 * 恢复不同的文件文案
 * @param {*} options.code 源代码 
 * @param {*} options.targetFile 文件对象 
 * @param {*} options.options 国际化配置对象 
 * @param {*} options.messages 国际化字段对象 
 * @returns code 经过恢复文案的代码
 */
module.exports = function ({ code, targetFile, options, messages }) {
  let ignoreMethods = options.ignoreMethods
  // 转义字符串
  ignoreMethods = ignoreMethods.map((item) => baseUtils.stringRegEscape(item))
  const ident = ignoreMethods.join('|')
  code = code.replace(new RegExp(`(${ident})\\((['"\`])((((?!\\2|\\().)+))\\2[^(]*?\\)`, 'gm'), (match, method, sign , key) => {
    if (messages[key]) {
      return `${sign}${messages[key]}${sign}`
    }
    return match
  })
  // 删除import 实例对象
  // code = code.replace(new RegExp(baseUtils.stringRegEscape(options.i18nInstance), 'gm'), '')
  return code
}