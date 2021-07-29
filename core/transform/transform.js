const { md5 } = require('../utils/baseUtils')

/**
 * 匹配字符串模块
 * @param {*} code 
 */
const matchStringTpl = ({ code, options, messages, codeType, ext }) => {
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
    return `${sign}${value}${sign}`;
  })
  return code
}

/**
 * 设置替换
 * @param {*} code 
 */
const replaceStatement = ({ value, options, messages, ext, codeType, sign = '\'' }) => {
  // 生成key
  let key = md5(value)
  // 是否自定义key
  if (options.setMessageKey && typeof options.setMessageKey === 'function') {
    key = options.setMessageKey({ key, value })
  }
  messages[key] = value
  let i18nMethod = null
  // 类型为vue标签采用缩写国际化方法的形式
  if (codeType === 'vueTag') {
    i18nMethod = options.i18nMethod
  } else {
    // 其余情况使用对象的方法
    i18nMethod = options.i18nObjectMethod
  }
  // 如果是函数
  if (i18nMethod && typeof i18nMethod !== 'string') {
    return i18nMethod({ key, value, options, ext, sign })
  }
  return `${options[i18nIdent]}(${sign}${key}${sign})`
}

/**
 * 匹配普通字符串
 * @param {*} code 
 */
const matchString = ({ code, options, messages, ext, codeType }) => {
  // 替换所有包含中文的普通字符串
  code = code.replace(/(['"])(((?!\1).)*[\u4e00-\u9fa5]+((?!\1).)*)\1/gm, (match, sign, value) => {
    return replaceStatement({ value, options, messages, ext, codeType, sign })
  })
  return code
}

module.exports = {
  matchStringTpl,
  matchString,
  replaceStatement
}