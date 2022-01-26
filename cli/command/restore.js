const fs = require('fs')
const mergeIi8nConfig = require('../utils/mergeIi8nConfig')
const prettier = require('prettier')
const log = require('../utils/log')
const baseUtils = require('../utils/baseUtils')
const { restore } = require('../../core/index')
const LocaleFile = require('../utils/localeFile')

/**
 * 恢复国际化字段为对应文案
 * @param {*} programOption 命令行参数
 */
module.exports = async function (programOption) {
  // 合并配置文件
  const options = mergeIi8nConfig(programOption)
  // 国际化配置文件路径
  const firstLocalePath = options.language && options.language[0] ? options.language[0] : 'zh-cn'
  
  // 没有指定国际化文件配置
  if (!firstLocalePath && !programOption.file) {
    log.error('Internationalization configuration file not found');
    process.exit(2);
  }

  // 创建生成国际化文件对象
  const localeFile = new LocaleFile(options.localePath)

  // 国际化配置数据
  let messages = {}
  if (programOption.file) {
    messages = localeFile.getConf(firstLocalePath, options, programOption.file)
  } else {
    messages = localeFile.getConf(firstLocalePath, options)
  }

  // 获取所有入口文件路劲
  let targetFiles = baseUtils.getSourceFiles(options)
  // 开始读取文件进行操作
  for (let i = 0; i < targetFiles.length; i++) {
    const sourceCode = fs.readFileSync(targetFiles[i].filePath, 'utf8');
    let code = restore({ code: sourceCode, targetFile: targetFiles[i], options, messages })
    code = prettier.format(code, baseUtils.getPrettierOptions(targetFiles[i].ext, options))
    fs.writeFileSync(targetFiles[i].filePath, code, { encoding: 'utf-8' })
    log.success(`done: ${targetFiles[i].filePath}`)
  }
}