const { md5 } = require('../utils/baseUtils')
/**
 * 设置替换
 * @param {*} code 
 */
const replaceStatement = ({ code, options, messages, ext, i18nIdent }) => {
  // 替换所有包含中文的普通字符串
  code = code.replace(/(['"])(((?!\1).)*[\u4e00-\u9fa5]+((?!\1).)*)\1/gm, (match, sign, value) => {
    // 生成key
    let key = md5(value)
    // 是否自定义key
    if (options.setMessageKey && typeof options.setMessageKey === 'function') {
      key = options.setMessageKey({ key, value })
    }
    messages[key] = value
    // 如果是函数
    if (options[i18nIdent] && typeof options[i18nIdent] !== 'string') {
      return options[i18nIdent]({ key, value, options, ext, sign })
    }
    return `${options[i18nIdent]}(${sign}${key}${sign})`
  })
  return code
}

/**
 * 匹配字符串模块
 * @param {*} code 
 */
 const matchStringTpl = ({ code, options, messages, ext, i18nIdent }) => {
  // 匹配存在中文的字符串模板内容
  code = code.replace(/(`)(((?!\1).)*[\u4e00-\u9fa5]+((?!\1).)*)\1/g, (match, sign, value) => {
    // 匹配占位符外面的内容
    const outValues = value.replace('`', '').replace(/(\${)([^}]+)(})/gm, ',,').split(',,').filter((item) => item)
    outValues.forEach(item => {
      value = value.replace(item, (value) => {
        // 是否是中文
        if (/[\u4e00-\u9fa5]+/g.test(value)) {
          value = `\${'${value}'}`
        }
        return value
      })
    })
    // //  匹配模板字符串占位符内容
    // value = value.replace(/(\${)([^}]+)(})/gm, (match, beforeBrace, value, afterBrace) => {
    //   return `${beforeBrace}${replaceStatement({ code: value, options, messages, ext, i18nIdent })}${afterBrace}`
    // })
    return `${sign}${value}${sign}`;
  })
  return code
}

/**
 * 处理包含中文的语句，包括普通字符串和模板字符串
 * @param {*} code 
 */
exports.handleStatement = ({ code, options, messages, ext, i18nIdent }) => {
  // 匹配字符串模板处理
  code = matchStringTpl({ code, options, messages, ext, i18nIdent })
  // 普通字符串
  code = replaceStatement({ code, options, messages, ext, i18nIdent })
  return code
}