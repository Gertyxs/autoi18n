const { handleStatement } = require('./transform')
const transformJs = require('./transformJs')
const cacheCommentHtml = require('../utils/cacheCommentHtml')
const cacheI18nField = require('../utils/cacheI18nField')
const baseUtils = require('../utils/baseUtils')

/**
 * 匹配vue模板部分
 * @param {*} code 
 */
const matchVueTemplate = ({ code, options, ext, messages }) => {
  // 暂存注释
  code = cacheCommentHtml.stash(code, options)
  // 暂存已经设置的国际化字段
  code = cacheI18nField.stash(code, options)
  // 获取vue文件里面的template模板
  const templateMatch = baseUtils.getNestedTags({ code, tagName: 'template' })
  for (let i = 0; i < templateMatch.length; i++) {
    code = code.replace(templateMatch[i], (match) => {
      // 开始匹配
      code = match.replace(/(<template[^>]*>)([\s\S]*)(<\/template>)/gim, (match, startTag, content, endTag) => {
        // 匹配模板里面待中文的属性 匹配属性
        match = matchTagAttr({ code: match, options, ext, messages })
        // 匹配模板里面标签包含中文的内容 匹配内容
        match = matchTagContent({ code: match, options, ext, messages })
        return match
      })
      return code
    })
  }
  // 恢复注释
  code = cacheCommentHtml.restore(code, options)
  // 恢复已经设置的国际化字段
  code = cacheI18nField.restore(code, options)
  return code
}

/**
 * 匹配vue标签中的属性
 * @param {*} code 
 */
const matchTagAttr = ({ code, options, ext, messages }) => {
  code = code.replace(/(<[^\/\s]+)([^<>]+)(\/?>)/gm, (match, startTag, attrs, endTag) => {
    // 属性设置成vue的动态绑定
    attrs = attrs.replace(/([^\s]+)=(["'])(((?!\2).)*[\u4e00-\u9fa5]+((?!\2).)*)\2/gim, (match, attr, sign, value) => {
      if (attr.match(/^(v-|@)/) || ['class', 'style', 'src', 'href', 'width', 'height'].includes(attr.trim())) {
        // 对于已经是v-开头的以及白名单内的属性，不进行替换
        return match;
      }
      if (attr.indexOf(':') === 0) {
        // 对所有:开头的属性替换为v-bind: 模式
        return `v-bind${attr}=${sign}${value}${sign}`
      } else {
        // 对所有的字符串属性替换为v-bind:模式
        if (!['true', 'false'].includes(value) && isNaN(value)) {
          value = sign === '"' ? `'${value}'` : `"${value}"`
        }
        return `v-bind:${attr}=${sign}${value}${sign}`
      }
    })
    // 通过对v-bind属性中包含有中文的部分进行国际化替换
    attrs = attrs.replace(/(v-bind:[^=]+=)(['"])(((?!\2).)+[\u4e00-\u9fa5]+((?!\2).)+)\2/gim, (match, attr, sign, value) => {
      value = handleStatement({ code: value, options, messages, ext, i18nIdent: 'vueTagIdent' })
      return `${attr}${sign}${value}${sign}`;
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
    // 将所有不在 {{}} 内的内容，用 {{}} 包裹起来
    const outValues = value.replace(/({{)(((?!\1|}}).)+)(}})/gm, ',,').split(',,').filter((item) => item)
    outValues.forEach(item => {
      value = value.replace(item, (value) => {
        // 是否是中文
        if (/[\u4e00-\u9fa5]+/g.test(value)) {
          value = `{{${JSON.stringify(value)}}}`
        }
        return value
      })
    })
    // 对所有的{{}}内的内容进行国际化替换
    value = value.replace(/({{)(((?!\1|}}).)+)(}})/gm, (match, beforeSign, value, $3, afterSign) => {
      value = handleStatement({ code: value, options, messages, ext, i18nIdent: 'vueTagIdent' })
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
const matchVueJs = ({ code, options, ext, messages }) => {
  // 获取vue文件里面的script模板
  const scriptMatch = baseUtils.getNestedTags({ code, tagName: 'script' })
  for (let i = 0; i < scriptMatch.length; i++) {
    code = code.replace(scriptMatch[i], (match) => {
      // 对包含中文的部分进行替换操作
      code = match.replace(/(<script[^>]*>)([\s\S]*)(<\/script>)/gim, (match, startTag, content, endTag) => {
        content = transformJs({ code: content, options, messages, ext, i18nIdent: 'vueJsIdent' })
        return `${startTag}${content}${endTag}`;
      })
      return code
    })
  }
  return code
}

module.exports = function ({ code, options, ext, messages }) {
  // 匹配vue模板
  code = matchVueTemplate({ code, options, ext, messages })
  // 匹配script部分
  code = matchVueJs({ code, options, ext, messages })
  return code
}