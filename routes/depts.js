const router = require('koa-router')();
const util = require('./../utils/util');
const Dept = require('./../models/deptSchema');
router.prefix('/dept')//二级路由
//部门列表查询
router.get('/list', async ctx => {
    const { deptName } = ctx.request.query;
    const params = {};
    deptName && (params.deptName = deptName)
    try {
        //根据条件查询所有用户列表
        const list = await Dept.find(params) || [];//返回所有数据
        ctx.body = util.success({
            data: deptName ? list : util.getJoinTree(list, null),
            msg: '查询成功'
        })
    } catch (error) {
        ctx.body = util.fail({
            msg: `查询错误:${error.stack}`
        })
    }
})

router.post('/operate', async ctx => {
    const { _id, action, ...params } = ctx.request.body;
    let res;
    if (action === 'add') {
        try {
            res = await Dept.create(params)
            ctx.body = util.success({
                data: true,
                msg: `部门创建成功`
            })
        } catch (error) {
            ctx.body = util.success({
                code: CODE.PARAM_ERROR,
                msg: error.stack
            })
        }
    } else {
        params.updateTime = Date.now();
        delete params.createTime;
        res = await Dept.findByIdAndUpdate(_id, params);
        ctx.body = util.success({
            data: true,
            msg: `修改成功`
        })
    }
})

router.delete('/delete', async ctx => {
    const { _id } = ctx.request.body;
    try {
        await Dept.findByIdAndRemove(_id);
        await Dept.deleteMany({ parentId: { $all: [_id] } });//删除包含_id的子项
        ctx.body = util.success({
            data: true,
            msg: `删除成功`
        })
    } catch (error) {
        ctx.body = util.fail({
            data: false,
            msg: error.stack
        })
    }
})
module.exports = router;
