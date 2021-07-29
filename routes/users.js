const router = require('koa-router')()
const User = require('./../models/userSchema')
const Menu = require('./../models/menuSchema')
const Role = require('./../models/roleSchema')
const Counter = require('./../models/counterSchema')
const util = require('./../utils/util')
const config = require('./../config')
const jwt = require('jsonwebtoken')
const md5 = require('md5')
router.prefix('/users')//二级路由

router.post('/login', async function (ctx, next) {
  try {
    const { userName, userPwd } = ctx.request.body;//post=>body,get=>query;
    const dbData = await User.findOne({ userName, userPwd: md5(userPwd) }, ['userName', 'userId', 'userEmail', 'systemRole', 'state', 'deptId', 'userRole', 'job'])
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

//全量用户列表
router.get('/all/list', async (ctx) => {
  try {
    const list = await User.find({}, ['userId', 'userName', 'userEmail']);//返回所有数据
    ctx.body = util.success({
      data: list
    })
  } catch (error) {
    ctx.body = util.fail({
      msg: `查询错误:${error.stack}`
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
  const { userId, userName, userEmail, job, state, userRole, deptId, action, mobile, systemRole } = ctx.request.body;
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
          userName, userEmail, job, state, userRole, deptId, mobile, systemRole,
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
    const res = await User.findOneAndUpdate({ userId }, { userEmail, job, state, userRole, deptId, mobile, systemRole });
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

router.post('/permissionList', async ctx => {
  let Authorization = ctx.request.headers.authorization;
  if (Authorization) {
    let Token = Authorization.split(' ')[1];
    let { data } = jwt.verify(Token, config.secret);
    let menuList = await getMenuList(data.systemRole, data.userRole);
    let buttonList = getButtonList(JSON.parse(JSON.stringify(menuList)), data.systemRole);
    if (data.systemRole != 0) {//超管不受停用功能限制
      menuList = removeDisableMenu(menuList, data.systemRole);//去除停用菜单
    }
    ctx.body = util.success({
      data: { menuList, buttonList }
    })
  }
})
async function getMenuList(systemRole, userRole) {//获取权限菜单
  let menuList;
  if (systemRole == 0) {//超级管理员查询所有菜单
    menuList = await Menu.find({}) || [];
  } else {
    let userRoleList = await Role.find({ _id: { $in: userRole } })//先查出用户所属的角色
    let permissionList = []
    userRoleList.forEach(role => {//取出该用户所属角色所拥有的所有菜单ID
      let { checkedKeys, halfCheckedKeys } = role.permissionList
      permissionList = permissionList.concat(checkedKeys, halfCheckedKeys)
    })
    permissionList = [...new Set(permissionList)]//去重
    menuList = await Menu.find({ _id: { $in: permissionList } })//根据菜单ID查出所有菜单信息
  }
  return util.getJoinTree(menuList, null);//合并为树型结构
}
function removeDisableMenu(list, systemRole) {//去除停用菜单
  list.forEach((item, index, arr) => {
    if (item.menuState == 2) {
      arr.splice(index, 1)
    }
    if (item.children && item.children.length) {
      removeDisableMenu(item.children)
    }
  })
  return list;
}
function getButtonList(list, systemRole) {//获取权限按钮
  let buttonList = [];
  list.forEach(item => {
    if (systemRole == 0 && item.menuType == 2) {//超管不受停用功能限制
      buttonList.push(item.menuCode)
    } else if (item.menuType == 2 && item.menuState == 1) {
      buttonList.push(item.menuCode)
    }
    if (item.children && item.children.length) {
      buttonList = buttonList.concat(getButtonList(item.children, systemRole))
    }
  })
  return buttonList;
}
module.exports = router
