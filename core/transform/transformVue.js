const transformJs = require('./transformJs')
const cacheCommentHtml = require('../utils/cacheCommentHtml')
const cacheI18nField = require('../utils/cacheI18nField')
const { matchStringTpl, matchString } = require('./transform')

/**
 * 匹配vue标签中的属性
 * @param {*} code
 */
const matchTagAttr = ({ code, options, ext, codeType, messages }) => {
  code = code.replace(/(<[^\/\s]+)([^<>]+)(\/?>)/gm, (match, startTag, attrs, endTag) => {
    // 属性设置成vue的动态绑定
    attrs = attrs.replace(/([^\s]+)=(["'])(((?!\2).)*[\u4e00-\u9fa5]+((?!\2).)*)\2/gim, (match, attr, sign, value) => {
      if (attr.match(/^(v-|@)/) || options.ignoreTagAttr.includes(attr.trim())) {
        // 对于已经是v-开头的以及白名单内的属性，不进行替换
        return match
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
      // value = ast({ code: value, options, messages, ext }) // 防止性能问题 改用正则匹配
      // 匹配字符串模板
      value = matchStringTpl({ code: value, options, messages, codeType, ext })
      // 进行字符串匹配替换
      value = matchString({ code: value, options, messages, codeType, ext })
      // 替换属性为简写模式
      attr = attr.replace('v-bind:', ':')
      return `${attr}${sign}${value}${sign}`
    })
    return `${startTag}${attrs}${endTag}`
  })
  return code
}

/**
 * 匹配查找标签内容（包含中文的内容）
 * @param {*} code
 */
const matchTagContent = ({ code, options, ext, codeType, messages }) => {
  code = code.replace(/(>)([^><]*[\u4e00-\u9fa5]+[^><]*)(<)/gm, (match, beforeSign, value, afterSign) => {
    // 将所有不在 {{}} 内的内容，用 {{}} 包裹起来
    const outValues = value
      .replace(/({{)(((?!\1|}}).)+)(}})/gm, ',,')
      .split(',,')
      .filter(item => item)
    outValues.forEach(item => {
      value = value.replace(item, value => {
        // 是否是中文
        if (/[\u4e00-\u9fa5]+/g.test(value)) {
          value = `{{'${value.trim()}'}}`
        }
        return value
      })
    })
    // 对所有的{{}}内的内容进行国际化替换
    value = value.replace(/({{)((?:(?!\1|}}).)+)(}})/gm, (match, beforeSign, value, afterSign) => {
      // value = ast({ code: value, options, messages, ext }) // 防止性能问题 改用正则匹配
      // 匹配字符串模板
      value = matchStringTpl({ code: value, options, messages, codeType, ext })
      // 进行字符串匹配替换
      value = matchString({ code: value, options, messages, codeType, ext })
      return `${beforeSign}${value.trim()}${afterSign}`
    })
    return `${beforeSign}${value.trim()}${afterSign}`
  })
  return code
}

/**
 * 匹配vue模板部分
 * @param {*} code
 */
const matchVueTemplate = ({ code, options, ext, messages }) => {
  // 暂存注释
  code = cacheCommentHtml.stash(code, options)
  // 暂存已经设置的国际化字段
  code = cacheI18nField.stash(code, options)
  // 开始匹配
  code = code.replace(/(<template[^>]*>)([\s\S]*)(<\/template>)/gim, (match, startTag, content, endTag) => {
    // 匹配模板里面待中文的属性 匹配属性
    content = matchTagAttr({ code: content, options, ext, codeType: 'vueTag', messages })
    // 匹配模板里面标签包含中文的内容 匹配内容
    content = matchTagContent({ code: content, options, ext, codeType: 'vueTag', messages })
    return `${startTag}${content.trim()}${endTag}`
  })

  // 恢复注释
  code = cacheCommentHtml.restore(code, options)
  // 恢复已经设置的国际化字段
  code = cacheI18nField.restore(code, options)
  return code
}

/**
 * 匹配vue JavaScript部分
 * @param {*} code
 */
const matchVueJs = ({ code, options, file, ext, messages }) => {
  // 获取vue文件里面的script模板
  code = code.replace(/(<script[^>]*>)([\s\S]*)(<\/script>)/gim, (match, startTag, content, endTag) => {
    let lang = startTag.match(/lang="(.+)"/)
    lang = lang && lang[1] ? lang[1] : 'js'
    content = transformJs({ code: content, file, options, ext, codeType: 'vueJs', messages, lang })
    return `${startTag}${content.trim()}${endTag}`
  })
  return code
}

/**
 * 转换vue
 * @param {*} options.code 源代码
 * @param {*} options.file 文件对象
 * @param {*} options.options 国际化配置对象
 * @param {*} options.messages 国际化字段对象
 * @param {*} options.ext 文件类型
 * @returns
 */
module.exports = function ({ code, file, options, ext = '.vue', messages }) {
  // 处理模板
  code = matchVueTemplate({ code, options, ext, messages })
  // 处理js
  code = matchVueJs({ code, file, options, ext, messages })
  return code
}
