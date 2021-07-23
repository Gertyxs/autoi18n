const loaderUtils = require('loader-utils')
const path = require('path')
const fs = require('fs')
const mergeIi8nConfig = require('../cli/utils/mergeIi8nConfig');
const { transform } = require('../core/index')
let messages = {}

module.exports = function (source) {
  const configOptions = mergeIi8nConfig()
  // const options = loaderUtils.getOptions(this);
  let targetFile = { ext: path.extname(this.resourcePath), filePath: this.resourcePath }
  source = transform({ code: source, targetFile, options: configOptions, messages })
  messages = {}
  return source
}