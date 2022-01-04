# 自动国际化方案探究

> [叶兴胜](https://github.com/Gertyxs)/ 2021-8-30

## 前言

1. 为什么要做国际化自动化？
2. 国际化自动化有什么好处，解决了什么问题？
3. 怎么做国际化自动化？

让我们带着这些问题进入本文的探索。

## 一、为什么要做国际化自动化？

**场景1：**

假如说你公司有一个项目，该项目已经迭代了五六年，页面有一两百个，有一天，你领导说要做国际化，让你评估一下开发时间。此时我猜你的心情是这样的：

![](http://img.doutula.com/production/uploads/image/2017/10/15/20171015037242_gNfleB.jpg)

内心旁白：

不干了？

辞职？

想想贫穷的自己，还是稳稳的加班吧！

问题暴露出：手动国际化枯燥无味，工作量大，容易漏掉国际化字段，开发效率低下。

**场景2**

如果手动做国际化基本上都要修改源码，被改过的源码基本上连一个中文标识符都找不到，有时候找一个按钮都得先到国际化资源文件找到对应的key，这种侵入式的手动国际化导致加大了维护成本。

基于以上两个场景：

**我们要做国际化自动化！！！**

## 二、国际化自动化有什么好处，解决了什么问题？

1. 高效的提高了开发效率
2. 自动提取国际化字段不易遗漏
3. 可以通过无侵入式国际化自动化使项目易于维护

## 三、该怎么做国际化自动化

### 1、我们来分析一下怎么做国际化自动化

1. 自动提取代码中的国际化字段
2. 自动翻译代码中的国际化字段（由于谷歌和百度翻译api调用有次数和字数限制，而且翻译不理想）我们采用手动翻译
3. 自动替换代码中的国际化字段

> 国际化处理的是代码中的中文字符，中文字符在代码中其实就是字符串，所以我们归根结底就是要处理代码中的字符串。

### 2、获取项目的代码

可以通过[glob](https://github.com/isaacs/node-glob#readme)获取所以代码文件然后通过`fs.readFileSync`模块来读取源码

```js
const getSourceFiles = () => {
  const sourceFiles = glob.sync(`${curEntry}/**/*.{js,ts,vue,jsx,tsx}`, { ignore: [] })
  return targetFiles
}
// 获取所有入口文件路劲
let targetFiles = getSourceFiles()
// 开始读取文件进行操作
for (let i = 0; i < targetFiles.length; i++) {
  const sourceCode = fs.readFileSync(targetFiles[i].filePath, 'utf8')
  const code = transform({ code: sourceCode, targetFile: targetFiles[i], options, messages })
}
```

读取到源码后我们就可以对其进行操作了

### 3、代码中的字符该怎么处理

#### 3.1 JavaScript中的字符

```js
let str1 = '我是字符串1'
let str2 = "我是字符串2"
let str3 = `我是字符串3`
```

对于`JavaScript`，只要处理带有中文的字符串就行了，处理这些字符我们可以使用`RegExp`匹配或者[bable ast](https://astexplorer.net/)树解析`JavaScript`,在[autoi8n](https://github.com/Gertyxs/autoi18n)中我使用`ast`解析进行处理。

```js
const babel = require('@babel/core')
const generate = require('@babel/generator').default
const traverse = require('@babel/traverse').default

const  ast = babel.parseSync(code, transformOptions)
const makeVisitor = () => {
  return {
    TemplateLiteral(path) {
      // ...
    },
    StringLiteral(path) {
      // ...
    },
    DirectiveLiteral(path) {
     // ...
    },
    JSXText(path) {
      // ...
    },
    JSXAttribute(path) {
      // ...
    }
  }
}
const visitor = makeVisitor({ code, options, messages, ext, codeType })
traverse(ast, visitor)
const output = generate(ast, code)
```

#### 3.2 vue文件中的字符

```vue
<template>
	<div attr1="我是静态属性" :attr2="我是动态属性">
    {{'我是vue内容'}}
    我是标签静态内容
  </div>
</template>
<script>
	let str1 = '我是字符串1'
  let str2 = "我是字符串2"
  let str3 = `我是字符串3`
</script>
```

在`vue`单文件组织中可以看出我们只要处理`template`以及`script`里面的代码即可

对于`vue`单文件组件我们可以使用官方提供的解析库[vue-template-compiler](https://github.com/vuejs/vue/tree/dev/packages/vue-template-compiler#readme)提取`template`和`JavaScript`

```js
const compiler = require('vue-template-compiler')
const sfc = compiler.parseComponent(code, { pad: 'space', deindent: false })
const { template, script, styles, customBlocks } = sfc
```

上面就把`vue`单文件组织分成了`template`和`JavaScript`了。

**template**

对于`template`我们只需要处理标签的静态属性、动态属性和标签内容即可,处理这些字符我们可以使用[parse5](https://www.npmjs.com/package/parse5)去解析标签或者用`RegExp`匹配，在[autoi8n](https://github.com/Gertyxs/autoi18n)中我使用`RegExp`匹配，如有需要后期会采用标签解析器处理。

```js
const matchTagAttr = ({ code }) => {
  code = code.replace(/(<[^\/\s]+)([^<>]+)(\/?>)/gm, (match, startTag, attrs, endTag) => {
  	return code
  })
  return code
}
const matchTagContent = ({ code, options, ext, codeType, messages }) => {
  code = code.replace(/(>)([^><]*[\u4e00-\u9fa5]+[^><]*)(<)/gm, (match, beforeSign, value, afterSign) => {
  	return code
  })
  return code
}
```

**JavaScript**

在上面我们已经讲解过`JavaScript`的处理了，在这里不再敖述。

#### 3.3 React jsx中的字符

```jsx
const render = () => {
  return (
    <div>
      <div attr="我是静态属性" attr2={'我是动态属性'}>
        {'我是react内容'}
        我是标签静态内容
      </div>
    </div>
  )
}
```

在`react`中，我们同样处理`JavaScript`字符串，`jsx`标签属性和标签内容，由于`jsx`本身支持[bable ast](https://astexplorer.net/)解析所以我们直接使用`ast`进行解析。

**代码分析完成**

通过上面对js、vue、JavaScript、的代码分析，我们已经匹配到所有需要做国际化的字符，我们再把对应的字符抽出生成一个messages对象写进文件就完成了资源文件的生成了。然后把对应的字符替换成我们国际化设置的方法就大功告成了。

#### 3.4 webpack loader 实现无侵入式的自动国国际化

实现了对代码处理之后，还可以在webpack loader里面把源码传进来进行无侵入式处理

```js
const path = require('path')
const fs = require('fs')
const mergeIi8nConfig = require('../cli/utils/mergeIi8nConfig');
const { transform } = require('../core/index')
let messages = {}

module.exports = function (source) {
  const configOptions = mergeIi8nConfig()
  let targetFile = { ext: path.extname(this.resourcePath), filePath: this.resourcePath }
  source = transform({ code: source, targetFile, options: configOptions, messages })
  messages = {}
  return source
}
```

webpack loader 配置 

```js
{
  enforce: 'pre', // 此项一定要加上 优先执行的loader
  test: /\.(js|mjs|jsx|ts|tsx)$/,
  use: [
  {
      loader: 'autoi18n',
      options: {}
  }],
  exclude: /node_modules/
}
```



## 总结

整篇文章主要围绕怎么实现项目国际化自动化，希望本文可以给你带来国际化自动化的思路，总的来说国际化自动化就是处理代码中的字符串，可以通过代码解析器或者正则去匹配对应的字符，然后抽取出来替换成对应的国际化key，感谢你的阅读。



分享一个国际化自动化的库[autoi18n](https://github.com/Gertyxs/autoi18n)

项目还在完善中，欢迎大家pr，如果你觉得不错也欢迎给个start 😄😄😄