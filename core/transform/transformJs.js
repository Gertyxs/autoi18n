const { handleStatement } = require('./transform')
const cacheCommentJs = require('../utils/cacheCommentJs')
const cacheI18nField = require('../utils/cacheI18nField')
const baseUtils = require('../utils/baseUtils')

/**
 * 匹配JavaScript部分
 * @param {*} code 
 */
const matchJavascript = ({ code, options, messages, ext, i18nIdent }) => {
  // 暂存注释
  code = cacheCommentJs.stash(code, options)
  // 暂存已经设置的国际化字段
  code = cacheI18nField.stash(code, options)
  // 对包含中文的部分进行替换操作
  code = code.replace(/(['"`])(((?!\1).)*[\u4e00-\u9fa5]+((?!\1).)*)\1/gm, (value) => {
    value = handleStatement({ code: value, options, messages, ext: ext, i18nIdent: i18nIdent })
    return value;
  })
  // 恢复注释
  code = cacheCommentJs.restore(code, options)
  // 恢复已经设置的国际化字段
  code = cacheI18nField.restore(code, options)
  return code
}

module.exports = function ({ code, options, messages, ext, i18nIdent }) {
  // 复制一份国际化数据配置
  const oldMessages = JSON.stringify(messages)
  // 匹配script部分
  code = matchJavascript({ code, options, messages, ext: ext || '.js', i18nIdent: i18nIdent || 'jsIdent' })
  // 国际化数据发生变化才注入 证明该js有国际化字段
  if (oldMessages !== JSON.stringify(messages)) {
    // 注入实例
    code = baseUtils.injectInstance({ code, ext, options })
  }
  return code
}
