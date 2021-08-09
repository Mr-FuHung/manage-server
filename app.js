const Koa = require('koa')
const app = new Koa()
const views = require('koa-views') //解析html中间件，类似ejs
const json = require('koa-json')//将数据转为json
const onerror = require('koa-onerror')//监听错误
// const bodyparser = require('koa-bodyparser')//将前端的get,post...请求的参数转为统一格式
const log4js = require('./utils/log4')//日志
const router = require('koa-router')()
const koajwt = require('koa-jwt')
const config = require('./config')
const utils = require('./utils/util')
//路由开始
const users = require('./routes/users')
const menus = require('./routes/menus')
const roles = require('./routes/roles')
const depts = require('./routes/depts')
const leaves = require('./routes/leaves')
const articles = require('./routes/articles')
const koaBody = require('koa-body');
//路由结束

require('./config/db')//开启链接数据库
// error handler
onerror(app)
// middlewares
// app.use(bodyparser({//可接收前端传来的哪些格式的数据
//   enableTypes: ['json', 'form', 'text']
// }))

app.use(koaBody({
  multipart: true, // 支持文件上传
  strict:false,
  jsonStrict:false,
  formidable: {
    uploadDir:config.staticFilePath, // 设置文件上传目录
    keepExtensions: true,    // 保持文件的后缀
    maxFieldsSize: 2 * 1024 * 1024, // 文件上传大小
    onFileBegin: (name, file) => { // 文件上传前的设置
      // console.log(`name: ${name}`);
      // console.log(file);
    },
  }
}));
app.use(json())

app.use(require('koa-static')(__dirname + '/public/dist'))//静态资源目录

app.use(views(__dirname + '/views', {
  extension: 'pug' //类似ejs
}))

app.use(async (ctx, next) => {
  log4js.info(`params:${JSON.stringify(ctx.request.body || ctx.request.query)}`);
  // next()//next执行下一个中间件，next返回下一个中间件执行后的promise函数，下一个中间件抛出错误被catch捕获并处理
  await next().catch(err => {
    if (err.status === 401) {
      err.status = 200;
      ctx.body = utils.fail({ msg: 'token认证失败', code: utils.CODE.AUTH_ERROR })
    } else {
      throw err;
    }
  });
})

app.use(koajwt({ secret: config.secret /* 密钥 */ }).unless({
  path: [/\/v1\/users\/login/]
}));

router.prefix('/v1')//一级路由

// routes
router.use(users.routes(), users.allowedMethods())//挂载二级路由，允许的请求方式，允许所有
router.use(menus.routes(), menus.allowedMethods())//挂载二级路由，允许的请求方式，允许所有
router.use(roles.routes(), roles.allowedMethods())//挂载二级路由，允许的请求方式，允许所有
router.use(depts.routes(), depts.allowedMethods())//挂载二级路由，允许的请求方式，允许所有
router.use(leaves.routes(), leaves.allowedMethods())//挂载二级路由，允许的请求方式，允许所有
router.use(articles.routes(), articles.allowedMethods())//挂载二级路由，允许的请求方式，允许所有

app.use(router.routes(), router.allowedMethods())//加载全局的router，允许的请求方式，允许所有

// error-handling
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx)
});

module.exports = app
