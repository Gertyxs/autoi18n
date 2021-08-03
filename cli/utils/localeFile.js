const fs = require('fs')
const path = require('path')
const log = require('./log')

const cwdPath = process.cwd()

module.exports = class LocaleFile {
  constructor(folder) {
    this.localesDir = folder
  }

  /**
   * 创建一个配置
   * @param {object} values    KV值
   * @param {string} locale    locales标识
   * @param {object} options   自动国际化配置对象
   */
  createConf(values, locale, options) {
    const folder = (
      this.localesDir.startsWith('/')
        ? this.localesDir
        : path.join(cwdPath, this.localesDir)
    );

    try {
      fs.accessSync(folder);
    } catch (e) {
      fs.mkdirSync(folder);
    }
    const localeFileExt = options.localeFileExt || '.json'
    const configFilePath = path.join(folder, `${locale}${localeFileExt}`);
    return new Promise((resolve, reject) => {
      let moduleIdent = options.modules === 'commonjs' ? 'module.exports = ' : 'export default '
      moduleIdent = localeFileExt === '.json' ? '' : moduleIdent
      fs.writeFile(configFilePath, moduleIdent + JSON.stringify(values, null, 2), err => {
        if (err) {
          reject(err);
        } else {
          resolve(configFilePath);
        }
      });
    });
  }

  /**
   * 获取配置值
   * @param {string} locale  key
   * @param {object} options   自动国际化配置对象
   */
  getConf(locale, options) {
    const localeFileExt = options.localeFileExt || '.json'
    const configFilePath = path.join(cwdPath, this.localesDir, `${locale}${localeFileExt}`);
    let data = {}
    if (fs.existsSync(configFilePath)) {
      let content = fs.readFileSync(configFilePath, { encoding: 'utf-8' })
      // 匹配大括号里面的内容
      content = (content || '').match(/\{[\s\S]*\}/)
      content = content ? content[0] : {}
      // 将key value的单引号换成双引号 防止json格式化失败
      content = content.replace(/(['"]?)(\w+)\1\s*:\s*(['"]?)(((?!,|\3)(.|\n|\r))+)\3/gm, (match, keySign, key, valueSign, value) => {
        value = valueSign ? `"${value}"` : value
        return `"${key}": ${value}`
      })
      data = content.length > 0 ? JSON.parse(content) : {}
    }
    return data
  }
}
