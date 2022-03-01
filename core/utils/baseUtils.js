const md5 = require('crypto-js/md5')

module.exports = {
  /**
   * 是否是中文
   * @param value 内容
   */
  isChinese(value) {
    return /[\u4e00-\u9fa5]/.test(value)
  },
  /**
   * md5加密
   * @param value 加密参数
   */
  md5(value) {
    return md5(value).toString()
  },
  /**
   * 匹配是否导入某个模块 es6 模式
   * @param moduleName 模块名称
   */
  // matchImportModule(moduleName) {
  //   return new RegExp(`(import\\s+(?:(?:\\w+|{(?:\\s*\\w\\s*,?\\s*)+})\\s+from)?\\s*['"\`](${moduleName}+?)['"\`])`, 'gm');
  // },
  /**
   * 匹配是否导入某个模块 commonjs 模式
   * @param moduleName 模块名称
   */
  // matchRequireModule(moduleName) {
  //   return new RegExp(`(?:var|let|const)\\s+(?:(?:\\w+|{(?:\\s*\\w\\s*,?\\s*)+}))\\s*=\\s*require\\s*\\(\\s*['"\`](${moduleName}+?)['"\`]\\s*\\)`, 'gm');
  // },
  /**
   * 字符串正则转义
   * @param value 加密参数
   */
  stringRegEscape(value) {
    return value.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
  },
  /**
   * 注入国际化实例
   * @param options 国际化配置对象
   */
  injectInstance({ code, ext, options }) {
    // 如果存在需要注入的文件 进行注入
    if (options.i18nInstance) {
      const matchInstance = code.match(new RegExp(this.stringRegEscape(options.i18nInstance), 'gm'))
      // 如果已经存在实例直接返回
      if (matchInstance) return code
      return `${options.i18nInstance}\n${code.trim()}`
    }
    return code
  },
  /**
   * 去掉首尾空白字符，中间的连续空白字符替换成一个空格
   */
  formatWhitespace(str) {
    return str.trim().replace(/\s+/g, ' ')
  },
  /**
   * 处理嵌套的html标签 可以 返回多段 主要处理vue3有多段script的问题
   * @param options.code 需要匹配html的字符串
   * @param options.tagName 需要匹配html 标签名称 如果传 默认匹配所有标签
   * @param cb 匹配成功的回调
   */
  handleNestedTags({ code, tagName }, cb) {
    tagName = tagName ? tagName : '\\w*'
    // 标签编号对象
    let tagsNo = {}
    // 开始标签编号
    code = code.replace(
      new RegExp(`(<(${tagName})((?:\\s+[^>]*)|)>)|(<\\/(${tagName})>)|(<(${tagName})((?:\\s+[^>]*)|)\\/>)`, 'gim'),
      (match, startTag, starTagName, startTagCon, endTag, endTagName, closeTag, closeTagName, closeTagCon) => {
        // 如果是闭合标签  <img /> 类似这种
        let value = ''
        if (closeTag) {
          value = `<${closeTagName + '%%_0'}${closeTagCon || ''}/>`
        }
        // 开始标签
        if (startTag) {
          if (tagsNo[starTagName] === undefined) {
            tagsNo[starTagName] = 0
          }
          value = `<${starTagName + '%%_' + tagsNo[starTagName]}${startTagCon || ''}>`
          if (tagsNo[starTagName] !== undefined) {
            tagsNo[starTagName] += 1 // 开始标签 进行 加一
          }
        }
        // 结束标签
        if (endTag) {
          if (tagsNo[endTagName] === undefined) {
            tagsNo[endTagName] = 0
          }
          if (tagsNo[endTagName] !== undefined) {
            tagsNo[endTagName] -= 1 // 结束标签存在 匹配对减一
          }
          value = `</${endTagName + '%%_' + tagsNo[endTagName]}>`
        }
        return value
      }
    )
    // 编号完成 进行匹配 这里获取顶级的标签 编号为0
    code = code.replace(new RegExp(`<(${tagName}%%_0)((?:\\s+[^>]*)|)>[\\s\\S]*?<\\/\\1>|<(${tagName}%%_0)((?:\\s+[^>]*)|)\\/*>`, 'gim'), match => {
      // 编号完成清除标签的编号
      match = match.replace(new RegExp(`(<(${tagName}%%_\\-?\\d+)((?:\\s+[^>]*)|)\\/?>)|(<\\/(${tagName}%%_\\-?\\d+)>)`, 'gim'), match => {
        return match.replace(/%%_\d+/, '')
      })
      return cb ? cb(match) : match
    })
    tagsNo = {}
    return code
  }
}
