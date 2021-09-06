const router = require('koa-router')();
const util = require('./../utils/util');
const articleClassify = require('./../models/articleClassifySchema');
const Counter = require('./../models/counterSchema')
const { CODE } = util;
router.prefix('/articleClassify')//二级路由
//文章列表查询
router.get('/list', async ctx => {
    const { articleClassName, articleClassId, state } = ctx.request.query;
    const { page, skipIndex } = util.pager(ctx.request.query);
    const params = {};
    articleClassName && (params.articleClassName = articleClassName)
    articleClassId && (params.articleClassId = articleClassId)
    state && (params.state = state)
    try {
        //根据条件查询所有用户列表
        const query = articleClassify.find(params).sort({ _id: -1 });//返回所有数据
        //skip(skipIndex)通过第几条开始查询，limit(pageSize)查询几条
        const list = await query.skip(skipIndex).limit(page.pageSize);
        const total = await articleClassify.countDocuments(params);//总条数
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
    if (action === 'add') {
        const { sequence_value } = await Counter.findOneAndUpdate({ _id: 'articleClassId' }, { $inc: { sequence_value: 1 } }, { new: true })//new代表返回更改后的数据，否则返回更改之前
        params.articleClassId = sequence_value;
        try {
            res = await articleClassify.create(params)
            ctx.body = util.success({
                data: true,
                msg: `文章分类创建成功`
            })
        } catch (error) {
            ctx.body = util.fail({
                code: CODE.PARAM_ERROR,
                msg: error.stack
            })
        }
    } else {
        params.updateTime = Date.now();
        delete params.createTime;
        delete params.articleClassId;
        delete params._id;
        res = await articleClassify.findByIdAndUpdate(_id, params);
        ctx.body = util.success({
            data: true,
            msg: `文章分类修改成功`
        })
    }
})
//全量分类查询
router.get('/all/list', async (ctx) => {
    try {
        const list = await articleClassify.find({}, ['articleClassName', 'state', 'articleClassId']);//返回所有数据
        ctx.body = util.success({
            data: list
        })
    } catch (error) {
        ctx.body = util.fail({
            msg: `查询错误:${error.stack}`
        })
    }
})
module.exports = router;
