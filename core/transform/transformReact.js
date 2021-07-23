const { handleStatement } = require('./transform')
const transformJs = require('./transformJs')
const cacheI18nField = require('../utils/cacheI18nField')
const cacheCommentJs = require('../utils/cacheCommentJs')
const cacheHtml = require('../utils/cacheHtml')
const baseUtils = require('../utils/baseUtils')

/**
 * 匹配react模板部分
 * @param {*} code 
 */
const matchReactTemplate = ({ code, options, ext, messages }) => {
  // 暂存react模板注释 react jsx 注释 其实就是 js注释 只不过多了一对大括号
  code = cacheCommentJs.stash(code, options)
  // 暂存已经设置的国际化字段
  code = cacheI18nField.stash(code, options)
  // 获取react jsx文件里面的模板
  const htmlTemplateMatch = baseUtils.getNestedTags({ code })
  for (let i = 0; i < htmlTemplateMatch.length; i++) {
    code = code.replace(htmlTemplateMatch[i], (match) => {
      // 匹配模板里面待中文的属性 匹配属性
      match = matchTagAttr({ code: match, options, ext, messages })
      // 匹配模板里面标签包含中文的内容 匹配内容
      match = matchTagContent({ code: match, options, ext, messages })
      return match
    })
  }
  // 恢复注释
  code = cacheCommentJs.restore(code, options)
  // 恢复已经设置的国际化字段
  code = cacheI18nField.restore(code, options)
  return code
}

/**
 * 匹配react标签中的静态属性
 * @param {*} code 
 */
const matchTagAttr = ({ code, options, ext, messages }) => {
  code = code.replace(/(<[^\/\s]+)([^<>]+)(\/?>)/gm, (match, startTag, attrs, endTag) => {
    // 属性设置成动态绑定
    attrs = attrs.replace(/([^\s]+)=(["'])(((?!\2).)*[\u4e00-\u9fa5]+((?!\2).)*)\2/gim, (match, attr, sign, value) => {
      if (['class', 'style', 'src', 'href', 'width', 'height'].includes(attr.trim())) {
        // 白名单内的属性，不进行替换
        return match;
      }
      // 对所有的字符串属性替换为{}模式
      if (!['true', 'false'].includes(value) && isNaN(value)) {
        value = `'${value}'`
      }
      return `${attr}={${value}}`
    })
    // 通过对{}属性中包含有中文的部分进行国际化替换
    attrs = attrs.replace(/([^=]+=)(?:\{)(((?!\{).)+[\u4e00-\u9fa5]+((?!\}).)+)\}/gim, (match, attr, value) => {
      value = handleStatement({ code: value, options, messages, ext, i18nIdent: 'reactTagIdent' })
      return `${attr}{${value}}`
    });
    return `${startTag}${attrs}${endTag}`
  })
  return code
}
/**
 * 匹配查找标签内容（包含中文的内容）
 * @param {*} code 
 */
const matchTagContent = ({ code, options, ext, messages }) => {
  code = code.replace(/(>)([^><]*[\u4e00-\u9fa5]+[^><]*)(<)/gm, (match, beforeSign, value, afterSign) => {
    // 将所有不在 {} 内的内容，用 {} 包裹起来
    const outValues = value.replace(/({)(((?!\1|}).)+)(})/gm, ',,').split(',,').filter((item) => item)
    outValues.forEach(item => {
      value = value.replace(item, (value) => {
        // 是否是中文
        if (/[\u4e00-\u9fa5]+/g.test(value)) {
          value = `{${JSON.stringify(value)}}`
        }
        return value
      })
    })
    // 对所有的{}内的内容进行国际化替换
    value = value.replace(/({)((?:(?!\1|}).)+)(})/gm, (match, beforeSign, value, afterSign) => {
      value = handleStatement({ code: value, options, messages, ext, i18nIdent: 'reactTagIdent' })
      return `${beforeSign}${value}${afterSign}`;
    })
    return `${beforeSign}${value}${afterSign}`;
  })
  return code
}

/**
 * 匹配vue JavaScript部分
 * @param {*} code 
 */
const matchReactJs = ({ code, options, ext, messages }) => {
  // 先对jsx html模板缓存
  code = cacheHtml.stash(code, options)
  // 对包含中文的部分进行替换操作
  code = transformJs({ code: code, options, messages, ext, i18nIdent: 'reactJsIdent' })
  // 恢复模板
  code = cacheHtml.restore(code, options)
  return code
}

module.exports = function ({ code, options, ext, messages }) {
  // 匹配vue模板
  code = matchReactTemplate({ code, options, ext, messages })
  // 匹配script部分
  code = matchReactJs({ code, options, ext, messages })
  return code
}