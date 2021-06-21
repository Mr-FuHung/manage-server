const router = require('koa-router')()
const User = require('./../models/userSchema')
const Counter = require('./../models/counterSchema')
const util = require('./../utils/util')
const config = require('./../config')
const jwt = require('jsonwebtoken')
const md5 = require('md5')
router.prefix('/users')//二级路由

router.post('/login', async function (ctx, next) {
  try {
    const { userName, userPwd } = ctx.request.body;//post=>body,get=>query;
    const dbData = await User.findOne({ userName, userPwd: md5(userPwd) }, ['userName', 'userId', 'userEmail', 'role', 'state', 'deptId', 'roleList', 'job'])
    if (dbData) {
      const data = dbData._doc;

      const token = jwt.sign({//生成token
        data: data//数据
      }, config.secret,//密钥
        {
          expiresIn: '1h'//过期时间
        })
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
  userName && (params.userName = userName)
  state != 0 && (params.state = state)
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

//用户删除
router.delete('/delete', async (ctx) => {
  const { userIds } = ctx.request.body;
  //状态改为离职
  const res = await User.updateMany({ userId: { $in: userIds } }, { state: 2 });
  if (res.nModified) {
    ctx.body = util.success({
      data: res,
      msg: `成功删除${res.nModified}条数据`
    })
    return;
  }
  ctx.body = util.fail({
    msg: `删除失败`
  })
})

//用户新增，修改
router.post('/operate', async (ctx) => {
  const { userId, userName, userEmail, job, state, roleList, deptId, action, mobile } = ctx.request.body;
  if (action === 'add') {
    if (!deptId || !userName || !userEmail) {
      ctx.body = util.fail({
        msg: `参数错误`,
        code: util.CODE.PARAM_ERROR
      })
      return;
    }
    const res = await User.findOne({ $or: [{ userName }, { userEmail }] }, ['_id', 'userName', 'userEmail']);
    if (res) {
      ctx.body = util.fail({
        msg: `用户名或邮箱重复： ${res.userName} --- ${res.userEmail}`,
        code: util.CODE.PARAM_ERROR
      })
    } else {
      const { sequence_value } = await Counter.findOneAndUpdate({ _id: 'userId' }, { $inc: { sequence_value: 1 } }, { new: true })//new代表返回更改后的数据，否则返回更改之前
      try {
        const user = new User({
          userId: sequence_value,
          userName, userEmail, job, state, roleList, deptId, mobile,
          userPwd: md5('666666')
        })
        user.save();
        ctx.body = util.success({
          data: true,
          msg: `用户创建成功`
        })
      } catch (error) {
        ctx.body = util.success({
          data: error.stack,
          msg: `用户创建失败`
        })
      }

    }
  } else {
    if (!deptId) {
      ctx.body = util.fail({
        msg: `参数错误，部门不能为空`,
        code: util.CODE.PARAM_ERROR
      })
      return;
    }
    const res = await User.findOneAndUpdate({ userId }, { userEmail, job, state, roleList, deptId, mobile });
    if (res) {
      ctx.body = util.success({
        data: true,
        msg: `修改成功`
      })
      return;
    }
    ctx.body = util.fail({
      msg: `修改失败`
    })
  }
})
module.exports = router
