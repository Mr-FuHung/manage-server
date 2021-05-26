const router = require('koa-router')()
const User = require('./../models/userSchema')
const util = require('./../utils/util')
const config = require('./../config')
const jwt = require('jsonwebtoken')
router.prefix('/users')//二级路由

router.post('/login', async function (ctx, next) {
  try {
    const { userName, userPwd } = ctx.request.body;//post=>body,get=>query;
    const dbData = await User.findOne({ userName, userPwd }, ['userName', 'userId', 'userEmail', 'role', 'state', 'deptId', 'roleList', 'job'])

    const data = dbData._doc;

    const token = jwt.sign({//生成token
      data: data//数据
    }, config.secret,//密钥
      {
        expiresIn: '1h'//过期时间
      })
    if (dbData) {
      data.token = token;
      ctx.body = util.success({ data, msg: '登录成功' })
    } else {
      ctx.body = util.fail({ msg: '账号或密码不正确' })
    }
  } catch (error) {
    ctx.body = util.fail({ msg: error.msg })
  }
})


module.exports = router
