const router = require('koa-router')();
const util = require('./../utils/util');
const Comment = require('./../models/commentSchema');
router.prefix('/comment')//二级路由
//评论列表查询
router.get('/list', async ctx => {
    const { articleId, userId, userName, state } = ctx.request.query
    const { page, skipIndex } = util.pager(ctx.request.query);
    const params = {};
    state && (params.state = state);
    articleId && (params.articleId = articleId);
    userId && (params["userInfo.userId"] = userId);
    userName && (params["userInfo.userName"] = userName);
    try {
        const query = Comment.find(params).sort({ _id: -1 });//返回所有数据
        //skip(skipIndex)通过第几条开始查询，limit(pageSize)查询几条
        const list = await query.skip(skipIndex).limit(page.pageSize);
        const total = await Comment.countDocuments(params);//总条数
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

//新增评论
router.post('/operate', async ctx => {
    const { _id, state } = ctx.request.body;
    const params = { state };
    try {
        res = await Comment.findByIdAndUpdate(_id, params);
        ctx.body = util.success({
            data: true,
            msg: '修改成功'
        })
    } catch (error) {
        ctx.body = util.fail({
            msg: `修改错误:${error.stack}`
        })
    }
})

module.exports = router;
