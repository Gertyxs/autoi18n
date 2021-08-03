
const isDev = process.env.DEPLOY_ENV === 'development' // 开发环境
const isProd = process.env.DEPLOY_ENV === 'production' // 生产环境
const isTest = process.env.DEPLOY_ENV === 'test' // 测试环境
const isDeploy = isProd || isTest // 是否是部署环境

module.exports = {
  parallel: false,
  productionSourceMap: isDev,
  lintOnSave: true,
  publicPath: isDeploy ? '' : '',
  assetsDir: 'static',
  css: {
    // 是否使用css分离插件 ExtractTextPlugin
    extract: isDeploy,
    // 开启 CSS source maps?
    sourceMap: false
  },
  chainWebpack: (config) => {
    // 配置自动国际化loader 无侵入式
    config.module
      .rule('autoi18n')
      .test(/\.(vue|(j|t)sx?)$/)
      .pre() // 这个必须加上 优先执行的loader 顺序一定要在use方法前面 否则会报找不到pre方法
      .use('autoi18n')
      .loader('autoi18n')
      .end()
  },
  devServer: {
    open: true, //是否自动弹出浏览器页面
    port: 8089, // 设置端口号
    https: false, //是否使用https协议
    hotOnly: false, //是否开启热更新
  }
}
