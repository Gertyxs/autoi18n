const parser = require('@babel/parser')
const generate = require('@babel/generator').default
const traverse = require('@babel/traverse').default
const t = require('@babel/types')
const baseUtils = require('../utils/baseUtils')
const { replaceStatement } = require('./transform')
const log = require('../../cli/utils/log')

/**
 * 返回处理ast对象
 * @param {*} 
 * @returns 
 */
const makeVisitor = ({ options, messages, ext, codeType }) => {
  // 生成字符对象
  const StringLiteral = (value) => {
    return Object.assign(t.StringLiteral(value), { extra: { raw: `'${value}'`, rawValue: value } })
  }
  // 返回处理ast的对象
  return {
    /**
     * 处理模板字符串
     * @param {} path 
     */
    TemplateLiteral(path) {
      const { node } = path
      // 字符串模板内容
      node.quasis = (node.quasis || []).map((item) => {
        if (item.type === 'TemplateElement') {
          if (baseUtils.isChinese(item.value.raw)) {
            item.value.raw = `\${${replaceStatement({ value: item.value.raw, options, messages, ext, codeType })}}`
          }
        }
        return item
      })
      // 字符串模板占位符内容 占位符内容可以不用做处理
      node.expressions = (node.expressions || []).map((item) => {
        if (item.type === 'StringLiteral') {
          if (baseUtils.isChinese(item.value)) {
            // item.extra.raw = `${item.value}`
          }
        }
        return item
      })
    },
    /**
     * 处理字符串字面量
     * @param {*} path 
     */
    StringLiteral(path) {
      const { node } = path
      if (baseUtils.isChinese(node.value)) {
        switch (path.parent.type) {
          case 'JSXAttribute':
            // 过滤掉这些属性不处理
            if (!options.ignoreTagAttr.includes(node.parent.name.name)) {
              node.extra.raw = replaceStatement({ value: node.value, options, messages, ext, codeType })
            }
            break
          default:
            node.extra.raw = replaceStatement({ value: node.value, options, messages, ext, codeType })
            break
        }
      }
    },
    /**
    * 处理 指令字符串字面量 'asdf'
    * @param {*} path 
    */
    DirectiveLiteral(path) {
      const { node } = path
      if (baseUtils.isChinese(node.value)) {
        node.extra.raw = replaceStatement({ value: node.value, options, messages, ext, codeType })
      }
    },
    /**
     * jsx 静态文本
     * @param {*} path 
     */
    JSXText(path) {
      const { node } = path
      if (baseUtils.isChinese(node.value)) {
        path.replaceWith(t.JSXExpressionContainer(StringLiteral(node.value)))
      }
      // path.skip() // 跳过子节点
    },
    /**
     * jsx 属性
     * @param {*} path 
     */
    JSXAttribute(path) {
      const { node } = path
      // 如果属性是静态属性
      if (node.value && node.value.type === 'StringLiteral') {
        // 值是否包含中文
        if (baseUtils.isChinese(node.value.value)) {
          // 过滤特殊属性
          if (!options.ignoreTagAttr.includes(node.name.name)) {
            // 改为动态属性 
            node.value = t.JSXExpressionContainer(StringLiteral(node.value.value))
          }
        }
      }
      // path.skip() // 跳过子节点
    },
  }
}

module.exports = function ({ code, file, options, messages, ext, codeType }) {
  // 生成ast配置
  const transformOptions = {
    sourceType: 'module', // 是否使用模块解析文件
    ast: true, // 是否生成ast树
    configFile: false, // 是否应用babel配置文件配置
    plugins: [
      'jsx',
      'typescript',
    ]
  }
  // 生成ast树
  let ast = null
  try {
    ast = parser.parse(code, transformOptions)
  } catch (error) {
    log.error(`文件${file.filePath} babel ast解析失败`)
  }
  // 返回转换对象
  const visitor = makeVisitor({ code, options, messages, ext, codeType })
  // 开始转换
  traverse(ast, visitor)
  // 转换完成生成新的代码  retainLines：保留行 decoratorsBeforeExport：将true设置为在输出中导出之前打印装饰器 jsescOption: { minimal: true }: 防止转为Unicode
  const output = generate(ast, { retainLines: true, decoratorsBeforeExport: true, jsescOption: { minimal: true } }, code)
  code = output.code.replace(/;*$/, '') // 清空最后的分号
  return code
}