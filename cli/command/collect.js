const fs = require('fs')
const mergeIi8nConfig = require('../utils/mergeIi8nConfig')
const prettier = require('prettier')
const log = require('../utils/log')
const baseUtils = require('../utils/baseUtils')
const { transform } = require('../../core/index')
const LocaleFile = require('../utils/localeFile')
/**
 * 
 * @param {*} programOption 命令行参数
 * @param {*} needReplace 是否需要替换国际化字段
 */

module.exports = async function (programOption) {
  // 合并配置文件
  const options = mergeIi8nConfig(programOption)

  // 指定目录类型错误
  if (!Array.isArray(options.entry) && typeof options.entry !== 'string') {
    log.error('entry must be a string or array');
    process.exit(2);
  }

  // 没有指定国际化目录
  if (!options.entry || Array.isArray(options.entry) && options.entry.length <= 0) {
    log.error('no entry is specified');
    process.exit(2);
  }

  // 国际化配置数据
  const messages = {}

  // 获取所有入口文件路劲
  let targetFiles = baseUtils.getSourceFiles(options)
  // 开始读取文件进行操作
  for (let i = 0; i < targetFiles.length; i++) {
    const sourceCode = fs.readFileSync(targetFiles[i].filePath, 'utf8');
    let code = transform({ code: sourceCode, targetFile: targetFiles[i], options, messages })
    if (programOption.replace) {
      code = prettier.format(code, baseUtils.getPrettierOptions(targetFiles[i].ext, options))
      fs.writeFileSync(targetFiles[i].filePath, code, { encoding: 'utf-8' })
    }
    log.success(`done: ${targetFiles[i].filePath}`)
  }

  // 创建生成国际化文件对象
  const localeFile = new LocaleFile(options.localePath)
  // 生成配置文件
  createTasks = options.language.map(locale => {
    let data = localeFile.getConf(locale, options)
    data = baseUtils.mergeMessages(data, messages)
    return localeFile.createConf(data, locale, options)
  })
  log.success('生成国际化配置文件完成')

}