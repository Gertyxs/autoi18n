const fs = require('fs')
const path = require('path')
const defaultConfig = require('./autoi18n.config')
const log = require('./log')

const cwdPath = process.cwd()

module.exports = function mergeOptions(programOption) {
  const options = defaultConfig;
  const configFileName = programOption && programOption.config || 'autoi18n.config.js'

  const configFilePath = path.join(cwdPath, configFileName)
  // 读取 autoi18n.config.js 中设置的参数，然后并入 options
  if (fs.existsSync(configFilePath)) {
    let configurationFile = {}
    try {
      configurationFile = require(configFilePath)
    } catch (err) {
      log.warning(`请检查 ${configFileName} 配置文件是否正确\n`)
    }

    Object.assign(options, configurationFile)
  } else {
    log.warning(`配置文件 ${configFileName} 不存在\n采用默认配置`)
  }

  return options;
};
