const fs = require('fs')
const glob = require('glob')
const path = require('path')
const cwdPath = process.cwd()

module.exports = {
  /**
   * 获取格式化配置
   * @param ext 格式化文件后缀
   * @param options 国际化配置
   * @returns 格式配置
   */
  getPrettierOptions(ext, options) {
    const filePath = path.join(cwdPath, '.prettierrc.js')
    let prettier = {}
    if (fs.existsSync(filePath)) {
      try {
        prettier = require(filePath)
        prettier = { ...prettier, ...options.prettier }
      } catch (err) {
        prettier = options.prettier
      }
    }
    let parser = 'babel'
    if (ext === '.vue') {
      parser = 'vue'
    }
    if (['.ts', '.tsx'].includes(ext)) {
      parser = 'typescript'
    }
    prettier.parser = parser
    return prettier
  },
  /**
   * 合并国际化文件数据 如果内容一致不以旧的数据为主
   * @param oldMessages 国际化配置文件目录
   * @param messages 排除的目录
   * @returns messages 新的国际化数据
   */
  mergeMessages(oldMessages, messages) {
    const newMessages = oldMessages || {}
    Object.keys(messages).forEach((key) => {
      const keys = Object.keys(oldMessages)
      const values = Object.values(oldMessages)
      // 如果key相同 不写入当条数据
      if (!keys.includes(key)) {
        newMessages[key] = messages[key]
      }
    })
    return newMessages
  },

  /**
   * 获取需要处理国际化的文件
   * @param options.entry 国际化配置文件目录
   * @param options.exclude 排除的目录
   * @param options.extensions 处理文件的后缀
   */
  getSourceFiles(options) {
    const localePath = path.resolve(__dirname, options.localePath) // 国际化存储路径
    const extensions = options.extensions && options.extensions.length ? options.extensions.join(',') : `js,ts,tsx,jsx,vue`
    const exclude = options.exclude ? [...options.exclude, `${localePath}/**/*.{js,ts,json}`] : [`${localePath}/**/*.{js,ts,json}`]
    let targetFiles = [].concat(options.entry).reduce((prev, curEntry, index) => {
      // 忽略国际化配置文件的目录
      const sourceFiles = glob.sync(`${curEntry}/**/*.{${extensions}}`, { ignore: exclude })
      const files = sourceFiles.map(file => ({
        filePath: file,
        curEntry: curEntry,
        ext: path.extname(file),
      }));
      return prev.concat(files);
    }, []);
    // 去掉 glob 文件重复
    targetFiles = this.duplicate(targetFiles, 'filePath')
    return targetFiles
  },
  /**
   * 数组去重
   * @param array 需要去重的数组
   * @param key 排除重复用都的key
   */
  duplicate(array, key) {
    const map = new Map();
    const result = array.filter((item) => !map.has(item[key]) && map.set(item[key], 1))
    return result
  }
}