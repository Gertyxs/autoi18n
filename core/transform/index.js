const transformVue = require('./transformVue')
const transformReact = require('./transformReact')
const transformJs = require('./transformJs')

/**
 * @param {*} options.code 源代码 
 * @param {*} options.targetFile 文件对象 
 * @param {*} options.options 国际化配置对象 
 * @param {*} options.messages 国际化字段对象 
 * @returns code 经过国际化的代码
 */
module.exports = function ({ code, targetFile, options, messages }) {
  let data = ''
  if (targetFile.ext === '.vue') {
    // 处理vue文件
    data = transformVue({ code, ext: targetFile.ext, options, messages })
  } else if (targetFile.ext === '.js' || targetFile.ext === '.ts') {
    // 处理js文件
    data = transformJs({ code, ext: targetFile.ext, options, messages })
  } else if (targetFile.ext === '.jsx' || targetFile.ext === '.tsx') {
    // 处理react文件
    data = transformReact({ code, ext: targetFile.ext, options, messages })
  }
  return data
}