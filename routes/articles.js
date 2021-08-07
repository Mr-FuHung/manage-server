const router = require('koa-router')();
const util = require('./../utils/util');
const Article = require('./../models/articleSchema');
router.prefix('/article')//三级路由
//部门列表查询
router.get('/list', async ctx => {
    const { title, userName, state } = ctx.request.query;
    const { page, skipIndex } = util.pager(ctx.request.query);
    const params = {};
    title && (params.title = title)
    userName && (params["author.userName"] = userName)
    state && (params.state = state)
    try {
        //根据条件查询所有用户列表
        const query = Article.find(params);//返回所有数据
        //skip(skipIndex)通过第几条开始查询，limit(pageSize)查询几条
        const list = await query.skip(skipIndex).limit(page.pageSize);
        const total = await Article.countDocuments(params);//总条数
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

router.post('/operate', async ctx => {
    const { _id, action, ...params } = ctx.request.body;
    let res;
    if (action === 'add') {
        try {
            res = await Article.create(params)
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
        res = await Article.findByIdAndUpdate(_id, params);
        ctx.body = util.success({
            data: true,
            msg: `修改成功`
        })
    }
})

router.delete('/delete', async ctx => {
    const { _id } = ctx.request.body;
    try {
        await Article.findByIdAndRemove(_id);
        await Article.deleteMany({ parentId: { $all: [_id] } });//删除包含_id的子项
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
