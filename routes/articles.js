const router = require('koa-router')();
const util = require('./../utils/util');
const Article = require('./../models/articleSchema');
const Counter = require('./../models/counterSchema')
const path = require('path')
const fs = require('fs'); // 引入文件系统模块
const config = require('./../config')
const { CODE } = util;
router.prefix('/article')//二级路由
//文章列表查询
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
    if (action === 'add') {
        const { sequence_value } = await Counter.findOneAndUpdate({ _id: 'articleId' }, { $inc: { sequence_value: 1 } }, { new: true })//new代表返回更改后的数据，否则返回更改之前
        params.articleId = sequence_value;
        try {
            res = await Article.create(params)
            ctx.body = util.success({
                data: true,
                msg: `文章创建成功`
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
        res = await Article.findByIdAndUpdate(_id, params);
        ctx.body = util.success({
            data: true,
            msg: `文章修改成功`
        })
    }
})

router.delete('/delete', async ctx => {
    const { _id } = ctx.request.body;
    try {
        await Article.findByIdAndRemove(_id);
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
router.post('/uploadFile', ctx => {
    const file = ctx.request.files.file.path
    let name = path.basename(file)
    ctx.body = util.success({
        data: {
            path: config.lineFilePath + name,
            name
        },
        msg: '上传成功'
    })
})
router.delete('/removeFile', ctx => {
    const { file } = ctx.request.body
    try {
        fs.unlinkSync(`${config.staticFilePath}/${file}`);
        ctx.body = util.success({
            data: true,
            msg: '文件删除成功'
        })
    } catch (err) {
        if (err) {
            ctx.body = util.success({
                data: false,
                msg: err.stack
            })
        };

    }
})
module.exports = router;
