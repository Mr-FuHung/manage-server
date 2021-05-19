const router = require('koa-router')()
const User = require('./../models/userSchema')
const util = require('./../utils/util')
router.prefix('/users')//二级路由

router.post('/login', async function (ctx, next) {
  try {
    const { userName, userPwd } = ctx.request.body;//post=>body,get=>query;
    const res = await User.findOne({ userName, userPwd })
    console.log(res)
    if (res) {
      ctx.body = util.success(res, '登录成功')
    } else {
      ctx.body = util.fail('账号或密码不正确')
    }
  } catch (error) {
    ctx.body = util.fail(error.msg)
  }
})


module.exports = router
