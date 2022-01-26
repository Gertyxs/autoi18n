const fs = require('fs')
const path = require('path')
const log = require('./log')

const cwdPath = process.cwd()

/**
 * 同步创建多级文件夹
 * @param {*} dirname 文件名
 * @returns
 */
const mkdirMultipleSync = dirname => {
  if (fs.existsSync(dirname)) {
    return true
  } else {
    if (mkdirMultipleSync(path.dirname(dirname))) {
      fs.mkdirSync(dirname)
      return true
    }
  }
}

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
    const folder = this.localesDir.startsWith('/') ? this.localesDir : path.join(cwdPath, this.localesDir)
    try {
      fs.accessSync(folder)
    } catch (e) {
      mkdirMultipleSync(folder)
    }
    const localeFileExt = options.localeFileExt || '.json'
    const configFilePath = path.join(folder, `${locale}${localeFileExt}`)
    return new Promise((resolve, reject) => {
      let moduleIdent = options.modules === 'commonjs' ? 'module.exports = ' : 'export default '
      moduleIdent = localeFileExt === '.json' ? '' : moduleIdent
      fs.writeFile(configFilePath, moduleIdent + JSON.stringify(values, null, 2), err => {
        if (err) {
          reject(err)
        } else {
          resolve(configFilePath)
        }
      })
    })
  }

  /**
   * 获取配置值
   * @param {string} locale    key
   * @param {object} options   自动国际化配置对象
   * @param {object} fullPath  完整路劲
   */
  getConf(locale, options, fullPath) {
    const localeFileExt = options.localeFileExt || '.json'
    let configFilePath = this.localesDir.startsWith('/') ? `${this.localesDir.replace(/\/$/, '')}/${locale}${localeFileExt}` : path.join(cwdPath, this.localesDir, `${locale}${localeFileExt}`)
    if (fullPath) {
      configFilePath =  fullPath.startsWith('/') ? fullPath : path.join(cwdPath, fullPath)
    }
    let data = {}
    if (fs.existsSync(configFilePath)) {
      let content = fs.readFileSync(configFilePath, { encoding: 'utf-8' })
      // 去除导出标识符
      content = (content || '').replace(/module\.exports\s*=\s*/, '').replace(/export default\s*/, '')
      // eval主要是js的解析器封装函数
      data = eval(`(${content})`)
      data = data ? data : {}
    }
    return data
  }
}
