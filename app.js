const Koa = require('koa')
const app = new Koa()
const views = require('koa-views') //解析html中间件，类似ejs
const json = require('koa-json')//将数据转为json
const onerror = require('koa-onerror')//监听错误
const bodyparser = require('koa-bodyparser')//将前端的get,post...请求的参数转为统一格式
// const logger = require('koa-logger')//日志
const log4js = require('./utils/log4')//日志

const index = require('./routes/index')//路由
const users = require('./routes/users')

// error handler
onerror(app)

// middlewares
app.use(bodyparser({//可接收前端传来的哪些格式的数据
  enableTypes:['json', 'form', 'text']
}))
app.use(json())
// app.use(logger())
app.use(require('koa-static')(__dirname + '/public'))//静态资源目录

app.use(views(__dirname + '/views', {
  extension: 'pug' //类似ejs
}))

// logger
app.use(async (ctx, next) => {
  // const start = new Date()
  await next()
  log4js.error('11122')
  // const ms = new Date() - start
  // console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
})

// routes
app.use(index.routes(), index.allowedMethods())//允许的请求方式，允许所有
app.use(users.routes(), users.allowedMethods())

// error-handling
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx)
});

module.exports = app
