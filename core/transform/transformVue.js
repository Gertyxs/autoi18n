const compiler = require('vue-template-compiler')
const baseUtils = require('../utils/baseUtils')
const transformJs = require('./transformJs')
const cacheCommentHtml = require('../utils/cacheCommentHtml')
const cacheI18nField = require('../utils/cacheI18nField')
// const ast = require('./ast')
const { matchStringTpl, matchString } = require('./transform')

/**
 * 处理标签属性拼接
 * @param {*} sfcBlock 
 * @returns 
 */
const openTag = (sfcBlock) => {
  const { type, lang, src, scoped, module, attrs } = sfcBlock
  let tag = `<${type}`
  if (lang) tag += ` lang="${lang}"`
  if (src) tag += ` src="${src}"`
  if (scoped) tag += ' scoped';
  if (module) {
    if (typeof module === 'string') tag += ` module="${module}"`
    else tag += ' module'
  }
  for (let k in attrs) {
    if (!['type', 'lang', 'src', 'scoped', 'module'].includes(k)) {
      tag += ` ${k}="${attrs[k]}"`
    }
  }
  tag += '>'
  return tag
}

/**
 * 拼接结束标签
 * @param {*} sfcBlock 
 * @returns 
 */
const closeTag = (sfcBlock) => {
  return '</' + sfcBlock.type + '>';
}

/**
 * 拼接vue模板
 * @param {*} template 
 * @param {*} script 
 * @param {*} styles 
 * @param {*} customBlocks 
 */
const combineVue = (template, script, styles, customBlocks) => {
  return [template, script, ...styles, ...customBlocks]
    .map(sfc => (sfc ? `${openTag(sfc)}\n${sfc.content.trim()}\n${closeTag(sfc)}\n` : ''))
    .join('\n');
}

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
const matchTagContent = ({ code, options, ext, codeType, messages }) => {
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
    value = value.replace(/({{)((?:(?!\1|}}).)+)(}})/gm, (match, beforeSign, value, afterSign) => {
      // value = ast({ code: value, options, messages, ext }) // 防止性能问题 改用正则匹配
      // 匹配字符串模板
      value = matchStringTpl({ code: value, options, messages, codeType, ext })
      // 进行字符串匹配替换
      value = matchString({ code: value, options, messages, codeType, ext })
      return `${beforeSign}${value}${afterSign}`
    })
    return `${beforeSign}${value}${afterSign}`
  })
  return code
}


/**
 * @param {*} options.code 源代码 
 * @param {*} options.file 文件对象 
 * @param {*} options.options 国际化配置对象 
 * @param {*} options.messages 国际化字段对象 
 * @param {*} options.ext 文件类型 
 * @returns 
 */
module.exports = function ({ code, file, options, ext = '.vue', messages }) {
  // 解析vue单文件组织
  const sfc = compiler.parseComponent(code, { pad: 'space', deindent: false })

  // 取出vue单文件组织的代码块
  const { template, script, styles, customBlocks } = sfc

  // 处理模板
  if (template) {
    // 暂存注释
    template.content = cacheCommentHtml.stash(template.content, options)
    // 暂存已经设置的国际化字段
    template.content = cacheI18nField.stash(template.content, options)
    // 匹配模板里面待中文的属性 匹配属性
    template.content = matchTagAttr({ code: template.content, options, ext, codeType: 'vueTag', messages })
    // 匹配模板里面标签包含中文的内容 匹配内容
    template.content = matchTagContent({ code: template.content, options, ext, codeType: 'vueTag', messages })
    // 恢复注释
    template.content = cacheCommentHtml.restore(template.content, options)
    // 恢复已经设置的国际化字段
    template.content = cacheI18nField.restore(template.content, options)
  }

  // 处理js
  if (script) {
    const code = transformJs({ code: script.content, options, ext, codeType: 'vueJs', messages })
    script.content = code
  }

  code = combineVue(template, script, styles, customBlocks)
  // 匹配vue模板
  return code
}