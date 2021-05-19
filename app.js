const Koa = require('koa')
const app = new Koa()
const views = require('koa-views') //解析html中间件，类似ejs
const json = require('koa-json')//将数据转为json
const onerror = require('koa-onerror')//监听错误
const bodyparser = require('koa-bodyparser')//将前端的get,post...请求的参数转为统一格式
const log4js = require('./utils/log4')//日志
const router = require('koa-router')()

const users = require('./routes/users')//路由

require('./config/db')
// error handler
onerror(app)

// middlewares
app.use(bodyparser({//可接收前端传来的哪些格式的数据
  enableTypes: ['json', 'form', 'text']
}))
app.use(json())
app.use(require('koa-static')(__dirname + '/public'))//静态资源目录

app.use(views(__dirname + '/views', {
  extension: 'pug' //类似ejs
}))
app.use(async (ctx, next) => {
  log4js.info(`params:${JSON.stringify(ctx.request.body || ctx.request.query)}`);
  await next();
})
router.prefix('/v1')//一级路由
// routes
router.use(users.routes(), users.allowedMethods())//挂载二级路由，允许的请求方式，允许所有

app.use(router.routes(), router.allowedMethods())//加载全局的router，允许的请求方式，允许所有

// error-handling
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx)
});

module.exports = app
