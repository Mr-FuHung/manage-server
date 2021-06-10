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

router.get('/list', async (ctx) => {
  const { userId, userName, state } = ctx.request.query;
  const { page, skipIndex } = util.pager(ctx.request.query);
  const params = {};
  userId && (params.userId = userId)
  userName && (params.userName = userId)
  state && (params.state = userId)
  try {
    //根据条件查询所有用户列表
    const query = User.find(params, { userPwd: 0 });//返回所有数据
    //skip(skipIndex)通过第几条开始查询，limit(pageSize)查询几条
    const list = await query.skip(skipIndex).limit(page.pageSize);
    // const total = await User.countDocuments(params);//总条数
    const total = (await query).length;//总条数
    ctx.body = util.success({
      data: {
        page: {
          ...page, total
        },
        list
      }
    })
  } catch (error) {
    ctx.body = util.fail({
      msg: `查询错误:${console.error.stack}`
    })
  }
})
module.exports = router
