const transformJs = require('./transformJs')
const { matchStringTpl, matchString } = require('./transform')
const parse = require('htmlparser2')
const render = require('dom-serializer').default

/**
 * 匹配vue标签中的属性
 */
const matchTagAttr = ({ options, ext, codeType, messages, node }) => {
  const attribs = {}
  for (const attr in node.attribs) {
    let value = node.attribs[attr]
    // 如果内容存在中文才进行处理
    if (/[\s\S]*([\u4e00-\u9fa5]+)[\s\S]*/gim.test(value)) {
      // 对于已经是v-开头的以及白名单内的属性，不进行替换
      if (attr.match(/^(v-|@)/) || options.ignoreTagAttr.includes(attr.trim())) {
        attribs[attr] = value
      }
      // 如果不是动态属性设置为动态属性
      if (attr.indexOf(':') !== 0 && attr.indexOf('v-bind:') !== 0 && attr.indexOf('#') !== 0) {
        attribs[`:${attr}`] = `'${value}'`
      }
      // 处理值中存在中文的字符
      value = value.replace(/[\s\S]*([\u4e00-\u9fa5]+)[\s\S]*/gim, match => {
        // 匹配字符串模板
        match = matchStringTpl({ code: match, options, messages, codeType, ext })
        // 进行字符串匹配替换
        match = matchString({ code: match, options, messages, codeType, ext })
        return match
      })
    }
    attribs[attr] = value
  }
  node.attribs = attribs
}

/**
 * 匹配查找标签内容（包含中文的内容）
 */
const matchTagContent = ({ options, ext, codeType, messages, node }) => {
  let value = node.data
  // 存在中文才处理
  if (/[\s\S]*([\u4e00-\u9fa5]+)[\s\S]*/gim.test(value)) {
    // 将所有不在 {{}} 内的内容，用 {{}} 包裹起来
    let outValues = value
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
      // 匹配字符串模板
      value = matchStringTpl({ code: value, options, messages, codeType, ext })
      // 进行字符串匹配替换
      value = matchString({ code: value, options, messages, codeType, ext })
      return `${beforeSign}${value.trim()}${afterSign}`
    })
  }
  node.data = value
}

/**
 * 递归转换ast
 * @param {*} nodes ast 节点数据
 * @param {*} isRoot 是否是顶层遍历
 * @returns
 */
const transformAst = ({ file, options, ext, messages }, nodes, isRoot) => {
  nodes.forEach(node => {
    // 转换js
    if (isRoot && node.type === 'script') {
      const lang = node.attribs.lang || 'js'
      if (node.children && node.children.length > 0) {
        let textNode = node.children[0]
        const content = transformJs({ code: textNode.data, file, options, ext, codeType: 'vueJs', messages, lang })
        textNode.data = content
      }
    }
    // 递归节点
    if (!['script', 'style'].includes(node.type) && node.name !== 'textarea' && node.children && node.children.length > 0) {
      transformAst({ file, options, ext, messages }, node.children, false)
    }
    if (node.type === 'tag') {
      // 匹配模板里面待中文的属性 匹配属性
      matchTagAttr({ node, options, ext, codeType: 'vueTag', messages })
    }
    if (node.type === 'text') {
      // 匹配模板里面标签包含中文的内容 匹配内容
      matchTagContent({ node, options, ext, codeType: 'vueTag', messages })
    }
  })
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
  const ast = parse.parseDocument(code, { xmlMode: false, recognizeCDATA: false, recognizeSelfClosing: false, lowerCaseTags: false, lowerCaseAttributeNames: false, recognizeSelfClosing: true })
  // 转换ast节点
  transformAst({ file, options, ext, messages }, ast.children, true)
  // 将转换完成的节点渲染成html返回
  code = render(ast, { xmlMode: false, decodeEntities: false })
  return code
}
