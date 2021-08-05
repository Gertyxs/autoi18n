module.exports = {
  // prettier配置
  printWidth: 180, // 超过最大值换行
  tabWidth: 2, // 缩进字节数
  useTabs: false, // 缩进不使用tab，使用空格
  semi: false, // 句尾添加分号
  singleQuote: true, // 使用单引号代替双引号
  proseWrap: 'preserve', // 默认值。因为使用了一些折行敏感型的渲染器 而按照markdown文本样式进行折行
  arrowParens: 'always', //  (x) => {} 箭头函数参数只有一个时是否要有小括号。always：不省略括号
  jsxBracketSameLine: false, // 在jsx中把'>' 是否单独放一行
  jsxSingleQuote: false, // 在jsx中使用单引号代替双引号
  htmlWhitespaceSensitivity: 'ignore', // 指定HTML文件的全局空格敏感度
  endOfLine: 'auto', // 行结束
  // trailingComma: 'none' // 无尾随逗号
};
