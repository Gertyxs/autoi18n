const fs = require('fs');
const path = require('path');
const inquirer = require('inquirer');
const prettier = require('prettier');
const log = require('../utils/log');
const defaultOptions = require('../utils/autoi18n.config')
const LocaleFile = require('../utils/localeFile')
const baseUtils = require('../utils/baseUtils')
const { transform } = require('../../core/index')


async function doInquire() {
  // 1. 配置文件是否存在
  let configExist = true;
  try {
    fs.accessSync('./autoi18n.config.js');
  } catch (e) {
    configExist = false;
  }

  if (configExist) {
    const ans = await inquirer.prompt([
      {
        name: 'overwrite',
        type: 'confirm',
        message: '配置文件 autoi18n.config.js 已存在，是否覆盖？',
      },
    ]);

    if (!ans.overwrite) process.exit(0);
  }

  // 2. first i18n?
  let ans = await inquirer.prompt([
    {
      name: 'firstI18n',
      type: 'confirm',
      message: '是否初次国际化？'
    },
  ]);

  return ans;
}

module.exports = async function initFileConf(programOption) {
  const answers = await doInquire();
  const { firstI18n } = answers;

  // 如果命令传入会覆盖配置文件
  const options = defaultOptions

  // 配置信息写入文件
  fs.writeFileSync(
    './autoi18n.config.js',
    prettier.format(
      'module.exports = ' + JSON.stringify(options), {
      parser: 'babel',
      singleQuote: true,
      trailingComma: 'es5',
    }
    ),
    'utf8'
  );
  log.success('成功创建配置文件')

  // 创建生成国际化文件对象
  const localeFile = new LocaleFile(options.localePath)
  // 是否是第首次初始化国际化文件
  let createTasks = [];
  if (firstI18n) {
    // 首次国际化
  } else {
    // 非首次国际化，本地代码中已有国际化资源
  }

  // 国际化配置数据
  const messages = {}

  // 获取所有入口文件路劲
  let targetFiles = baseUtils.getSourceFiles(options)
  // 开始读取文件进行操作
  for (let i = 0; i < targetFiles.length; i++) {
    const sourceCode = fs.readFileSync(targetFiles[i].filePath, 'utf8');
    const code = transform({ code: sourceCode, targetFile: targetFiles[i], options, messages })
    log.success(`done: ${targetFiles[i].filePath}`)
  }

  // 生成配置文件
  createTasks = options.language.map(locale => {
    let data = localeFile.getConf(locale, options)
    data = baseUtils.mergeMessages(data, messages)
    return localeFile.createConf(data, locale, options);
  })
  log.success(firstI18n ? '生成国际化配置文件完成' : '更新国际化配置文件完成');
};
