# autoi18n

[![](https://img.shields.io/badge/npm-v1.0.8-blue)](https://www.npmjs.com/package/autoi18n-tool)

## 介绍

1. 自动转换、基于`Command`或者`webpack loader`的前端国际化方案
2. 目的实现前端国际化自动化、自动提取项目中的中文字符生成资源文件
3. 实现项目侵入式与非侵入式自动国际化，大大提高国际化的开发效率
4. 目前该库支持[vue](https://cn.vuejs.org/)和[react](https://react.docschina.org/)

## 为什么要写该库

如果一个老项目迭代了多年，有上百个页面，如果忽然说要做国际化:fearful:，这时我估计你心里会万马奔腾。

1. 手动提取工作量大，还很容易遗漏
2. 手动做国际化，会改变源码，源码上连个中文标识都没有，这样我们想找到点击按钮都很困难

## 安装

```bash
npm i -D autoi18n-tool

yarn add -D autoi18n-tool
```

## 使用

> 使用方式有两种，第一种：使用`Command`的形式生成国际化资源和替换国际化的原文件，第二种：使用`Command`的形式生成国际化资源使用`webpack loader`的形式无侵入式自动国际化。

### 纯命令的形式

```shell
npx autoi18n init # 初始化自动国际化配置，生成国际化配置文件和生成国际化资源文件
npx autoi18n sync -r # 同步国际化资源和替换原文件国际化字段
```

执行命令会写入

```html
<div>{{$t('a018615b35588a01')}}</div>
```

资源文件

```js
// zh-cn.json
{
  "dbefd3ada018615b35588a01e216ae6e": "你好，世界" // key是根据中文生成16的MD5
}
// en-us.js
{
  "dbefd3ada018615b35588a01e216ae6e": "Hello, world" // key是根据中文生成16的MD5
}
```

### webpack loader的形式 不会改变源码

第一步：初始化自动国际化

```shell
npx autoi18n init # 初始化自动国际化配置，生成国际化配置文件和生成国际化资源文件
npx autoi18n sync # 同步国际化资源
```

第二步：配置webpack loader

```js
module.exports = {
  // ... 其他配置
  module:{
    rules:[
      {
          enforce: 'pre', // 此项一定要加上 优先执行的loader
          test: /\.(js|mjs|jsx|ts|tsx|vue)$/,
          use: [
            {
              loader: 'autoi18n',
              options: {}
            }
          ],
          exclude: /node_modules/
        }
    ]
  }
}
```

*HTML*

```html
<div>你好，世界</div>
```

*资源文件*

```js
// zh-cn.json
{
  "dbefd3ada018615b35588a01e216ae6e": "你好，世界" // key是根据中文生成16的MD5
}
// en-us.js
{
  "dbefd3ada018615b35588a01e216ae6e": "Hello, world" // key是根据中文生成16的MD5
}
```

**页面在中文下展示为**

你好世界

**在英文下展示为**

Hello, world

## 组成部分

> 该库分为两部分，一部分是cli，目的是通过命令生成资源文件和替换源文件的国际化字段，另一部分是webpack loader，目的是无侵入式的替换源文件的国际化字段，我们最好在打包测试/上线前执行以下cli命令，生成资源文件，然后拷贝一份资源文件给翻译组进行各国语言的翻译

### cli

```shell
npx autoi18n init # 初始化自动国际化配置，这个命令会生成国际化配置文件和生成国际化资源文件
npx autoi18n sync # 同步国际化资源文件
npx autoi18n sync -r # 同步国际化资源文件并且会写入源文件 注意：这个命令会修改源码 -r 其实就是 replace 是否替换国际化字段
npx autoi18n restore -f ./src/locales/zh-cn.ts # 根据指定的配置文件恢复代码中的国际化文案 如果存在多余的国际化文案数据，可以先恢复，重新执行 npx autoi18n sync -r 自动国际化操作，就不用手动去除多余的字段了
npx autoi18n -h # 查看使用帮助
npx autoi18n -V # 查看版本
```

执行`npx autoi18n init`会在项目根目录生成`autoi8n.config.js`配置文件

```js
module.exports = {
  /**
   * 需要国际化的语言种类
   */
  language: ['zh-cn', 'en-us'],
  /**
   * 国际化资源文件应用的 模块模式 根据这个模式 使用 module.exports 或者 export default
   * 如果localeFileExt 配置为json时 此配置不起效
   */
  modules: 'es6',
  /**
   * 需要国际化的目录
   */
  entry: ['./src'],
  /**
   * 国际化资源文件输出目录
   */
  localePath: './src/locales',
  /**
   * 国际化文件类型 默认 为 .json文件 支持.js和.json
   */
  localeFileExt: '.json',
  /**
   * 需要处理国际化的文件后缀
   */
  extensions: [],
  /**
   * 需要排除国际化的文件 glob模式数组
   */
  exclude: [],
  /**
   * 要忽略做国际化的方法
   */
  ignoreMethods: ['i18n.t', '$t'],
  /**
   * 要忽略做标签属性
   */
  ignoreTagAttr: ['class', 'style', 'src', 'href', 'width', 'height'],
  /**
   * 国际化对象方法，可以自定义使用方法返回 注意：如果改变国际化方法记得把该方法加到ignoreMethods忽略列表里面
   */
  i18nObjectMethod: 'i18n.t',
  /**
   * 国际化方法简写模式，可以自定使用方法返回 注意：如果改变国际化方法记得把该方法加到ignoreMethods忽略列表里面
   */
  i18nMethod: '$t',
  /**
   * 如果不喜欢又臭又长的key 可以自定义国际化配置文件的key 
   * 默认为 false 不自定义 
   */
  setMessageKey: false,
  /**
   * 生成md5的key长度 true: 32位字符 false: 16位字符
   */
  maxLenKey: false,
  /**
   * 国际化要注入到js里面的实例 会在js文件第一行注入
   */
  i18nInstance: "import i18n from '~/i18n'",
  /**
   * 格式化文件配置
   */
  prettier: {
    singleQuote: true,
    trailingComma: 'es5',
    endOfLine: 'lf',
  }
}
```

### webpack loader

在webpack配置文件加入loader配置

```js
module.exports = {
  // ... 其他配置
  module:{
    rules:[
      {
          enforce: 'pre', // 此项一定要加上 优先执行的loader
          test: /\.(js|mjs|jsx|ts|tsx|vue)$/,
          use: [
            {
              loader: 'autoi18n',
              options: {}
            }
          ],
          exclude: /node_modules/
        }
    ]
  }
}
```



> **注意**
>
> 1. 在vue模板上不支持模板字符串嵌套模板字符串使用，js正则没有平衡组的概念，目前没有很好的处理方案
> 2. 每次有新的中文字段加入需要使用`npx autoi8n sync`进行国际化资源同步，所以建议在打包项目前执行同步操作

项目还在完善中，欢迎大家pr，如果你觉得不错也欢迎给个start :smile::smile::smile:

# License

[MIT](https://opensource.org/licenses/MIT)