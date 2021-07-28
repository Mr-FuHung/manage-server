const router = require('koa-router')()
const Role = require('./../models/roleSchema')
const util = require('./../utils/util')
const { CODE } = util;
router.prefix('/roles')//二级路由
//角色查询
router.get('/allList', async (ctx) => {
    try {
        let list = await Role.find({}, ['_id', 'roleName']) || [];
        ctx.body = util.success({
            data: list,
            msg: '查询成功'
        })
    } catch (error) {
        ctx.body = util.fail({
            data: null,
            msg: `查询失败:${error.stack}`
        })
    }
})
//分页查询角色列表
router.get('/list', async (ctx) => {
    const { roleName } = ctx.request.query;
    const { page, skipIndex } = util.pager(ctx.request.query);
    const params = {};
    roleName && (params.roleName = roleName)
    try {
        //根据条件查询所有用户列表
        const query = Role.find(params, { userPwd: 0 });//返回所有数据
        //skip(skipIndex)通过第几条开始查询，limit(pageSize)查询几条
        const list = await query.skip(skipIndex).limit(page.pageSize);
        const total = await Role.countDocuments(params);//总条数
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

//角色新增，修改
router.post('/operate', async (ctx) => {
    const { _id, action, roleName, remark } = ctx.request.body;
    let res;
    let params = {
        roleName,
        remark
    }
    if (action === 'add') {
        try {
            res = await Role.create(params)
            ctx.body = util.success({
                data: true,
                msg: `角色创建成功`
            })
        } catch (error) {
            ctx.body = util.fail({
                code: CODE.PARAM_ERROR,
                msg: error.stack
            })
        }
    } else {
        params.updateTime = Date.now();
        try {
            res = await Role.findByIdAndUpdate(_id, params);
            ctx.body = util.success({
                data: true,
                msg: `修改成功`
            })
        } catch (error) {
            ctx.body = util.fail({
                code: CODE.PARAM_ERROR,
                msg: error.stack
            })
        }
    }
})

//角色删除
router.delete('/delete', async (ctx) => {
    const { _id } = ctx.request.body;
    try {
        const res = await Role.findByIdAndRemove(_id);//删除自己
        if (res) {
            ctx.body = util.success({
                data: true,
                msg: `删除成功`
            })
            return
        }
    } catch (error) {
        ctx.body = util.fail({
            code: CODE.PARAM_ERROR,
            msg: `删除失败:${error.stack}`
        })
    }

})
//角色权限配置
router.post('/update/permission', async (ctx) => {
    const { _id, permissionList } = ctx.request.body;
    let params = {
        permissionList,
        updateTime: Date.now()
    }
    try {
        await Role.findByIdAndUpdate(_id, params);
        ctx.body = util.success({
            data: true,
            msg: `权限配置成功`
        })
    } catch (error) {
        ctx.body = util.fail({
            code: CODE.PARAM_ERROR,
            msg: error.stack
        })
    }

})
module.exports = router
