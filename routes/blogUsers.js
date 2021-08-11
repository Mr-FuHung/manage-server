const router = require('koa-router')()
const User = require('./../models/userBlogSchema')
const util = require('./../utils/util')
router.prefix('/blogUsers')//二级路由

router.get('/list', async (ctx) => {
  const { userId, userName } = ctx.request.query;
  const { page, skipIndex } = util.pager(ctx.request.query);
  const params = {};
  userId && (params.userId = userId)
  userName && (params.userName = userName)
  try {
    //根据条件查询所有用户列表
    const query = User.find(params);//返回所有数据
    //skip(skipIndex)通过第几条开始查询，limit(pageSize)查询几条
    const list = await query.skip(skipIndex).limit(page.pageSize);
    const total = await User.countDocuments(params);//总条数
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
      msg: `查询错误:${error.stack}`
    })
  }
})



module.exports = router
