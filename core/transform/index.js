const transformVue = require('./transformVue')
const transformReact = require('./transformReact')
const transformJs = require('./transformJs')

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