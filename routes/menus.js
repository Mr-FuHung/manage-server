const router = require('koa-router')()
const Menu = require('./../models/menuSchema')
const util = require('./../utils/util')
const { CODE } = util;
router.prefix('/menu')//二级路由
//菜单查询
router.get('/list', async (ctx) => {
    let { menuName, menuState } = ctx.request.query;
    const params = {};
    menuName && (params.menuName = menuName)
    menuState && (params.menuState = menuState)
    let list = await Menu.find(params) || [];
    ctx.body = util.success({
        data: menuName ? list : getTreeMenu(list, null),
        msg: '查询成功'
    })
})
//递归菜单拼接树形结构
const getTreeMenu = (list, id) => {
    let arr = [];
    list.forEach(item => {
        if (String(item.parentId.slice().pop()) == String(id)) {
            arr.push(item._doc)
        }
    })
    arr.map(item => {
        item.children = getTreeMenu(list, item._id);
        if (!item.children.length) {
            delete item.children
        } 
    })
    return arr;
}
//菜单删除
router.delete('/delete', async (ctx) => {
    const { _id } = ctx.request.body;
    const res = await Menu.findByIdAndRemove(_id);//删除自己
    await Menu.deleteMany({ parentId: { $all: [_id] } })//删除parentId中包含_id的所有项
    if (res) {
        ctx.body = util.success({
            data: true,
            msg: `删除成功`
        })
        return
    }
    ctx.body = util.fail({
        msg: `删除失败`
    })

})

//菜单新增，修改
router.post('/operate', async (ctx) => {
    const { _id, action, ...params } = ctx.request.body;
    let res;
    if (action === 'add') {
        try {
            res = await Menu.create(params)
            ctx.body = util.success({
                data: true,
                msg: `用户创建成功`
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
        res = await Menu.findByIdAndUpdate(_id, params);
        ctx.body = util.success({
            data: true,
            msg: `修改成功`
        })
    }
})

module.exports = router
