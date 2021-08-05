
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
    if (isProd) {
      // 压缩去除console等信息
      config.optimization.minimizer('terser').tap((args) => {
        Object.assign(args[0].terserOptions.compress, {
          // warnings: false , // 默认 false
          // drop_console:  false, // 默认
          // drop_debugger: true, // 去掉 debugger 默认也是true
          pure_funcs: ['console.log']
        })
        return args
      })
    }
    if (isTest) {
      config.optimization.minimizer('terser').tap((args) => {
        Object.assign(args[0].terserOptions.compress, {
          // warnings: false , // 默认 false
          // drop_console:  false, // 默认
          // drop_debugger: true, // 去掉 debugger 默认也是true
          // pure_funcs: ['console.log']
        })
        return args
      })
    }
  },
  devServer: {
    open: true, //是否自动弹出浏览器页面
    port: 8089, // 设置端口号
    https: false, //是否使用https协议
    hotOnly: false, //是否开启热更新
    proxy: {
      // 互金API代理
      '/cashier/api': {
        // '/cashier-uat/api/': {
        // target: 'http://172.16.1.204:9001', // 水平电脑
        // target: 'http://172.16.1.103:9001', // 曼婷电脑
        // target: 'http://172.16.1.63:9001', // 智文电脑
        target: 'https://kwgmb-test.kwgproperty.com', // 测试环境
        ws: true, // 代理websockets
        changeOrigin: true // 是否跨域，虚拟的站点需要更管origin
        // pathRewrite: {
        //   '/cashier/api': ''
        // }
      },
      // APP API 代理
      '/kwgdspappapi/v2': {
        target: 'https://kwgmb-test.kwgproperty.com', // 测试环境
        ws: true, // 代理websockets
        changeOrigin: true // 是否跨域，虚拟的站点需要更管origin
      }
    }
  }
}
