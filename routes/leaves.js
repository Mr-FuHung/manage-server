const router = require('koa-router')()
const Leave = require('./../models/leaveSchema')
const Dept = require('./../models/deptSchema')
const util = require('./../utils/util')
const config = require('./../config')
const jwt = require('jsonwebtoken')
const { CODE } = util;
router.prefix('/leave')//二级路由
//分页查询申请列表
router.get('/list', async (ctx) => {
    const { auditState, type } = ctx.request.query;
    let Authorization = ctx.request.headers.authorization;//token
    let Token = Authorization.split(' ')[1];
    let { data } = jwt.verify(Token, config.secret);
    const { page, skipIndex } = util.pager(ctx.request.query);
    const params = {};
    if (auditState == 1 || auditState == 2) {
        params.$or = [{ auditState: 1 }, { auditState: 2 }]
    } else {
        auditState && (params.auditState = auditState)
    }
    if (data.systemRole != 0) {//超管可查询所有申请，非超管只可查询自己
        if (type == 'approve') {
            // if (auditState == 1) {
            //     params.currentAuditUser = data.userName
            // } else {
            params['auditFlows.userId'] = data.userId
            // }
        } else {
            params["applyUser.userId"] = data.userId
        }
    }

    try {
        const query = Leave.find(params, { userPwd: 0 });//返回所有数据
        const list = await query.skip(skipIndex).limit(page.pageSize);
        const total = await Leave.countDocuments(params);//总条数
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

//休假新增
router.post('/operate', async (ctx) => {
    const { ...params } = ctx.request.body;
    let res;
    let Authorization = ctx.request.headers.authorization;//token
    let Token = Authorization.split(' ')[1];
    let { data } = jwt.verify(Token, config.secret);
    //生成申请单号
    let orderNo = "XJ";
    orderNo += util.formateDate(new Date(), 'YYYYMMDD');//申请的日期
    orderNo += await Leave.countDocuments();//拼接文档的总条数
    params.orderNo = orderNo;
    //查找用户当前部门负责人信息
    let dept = await Dept.findById(data.deptId.pop());
    //获取人事部门和财务部门负责人的信息
    let responsibleList = await Dept.find({ deptName: { $in: ['人事部', '财务部'] } })
    //当前审批人
    params.currentAuditUser = dept.userName;
    //所有审批人
    params.auditUsers = dept.userName;
    //审批流
    params.auditFlows = [
        {
            userId: dept.userId,
            userName: dept.userName,
            userEmail: dept.userEmail
        },
        ...(function () {
            return responsibleList.map(item => {
                params.auditUsers += `,${item.userName}`;
                return {
                    userId: item.userId,
                    userName: item.userName,
                    userEmail: item.userEmail
                }
            })
        }())
    ]
    params.auditLogs = [];//审批日志
    params.applyUser = {//申请人信息
        userId: data.userId,
        userName: data.userName,
        userEmail: data.userEmail
    }
    try {
        res = await Leave.create(params)
        ctx.body = util.success({
            data: true,
            msg: `休假单创建成功`
        })
    } catch (error) {
        ctx.body = util.fail({
            code: CODE.PARAM_ERROR,
            msg: error.stack
        })
    }

})

//休假作废
router.delete('/delete', async (ctx) => {
    const { id } = ctx.request.body;
    try {
        const res = await Leave.findByIdAndUpdate(id, { auditState: 5, updateTime: Date.now() });//假删除
        if (res) {
            ctx.body = util.success({
                data: true,
                msg: `作废成功`
            })
            return
        }
    } catch (error) {
        ctx.body = util.fail({
            code: CODE.PARAM_ERROR,
            msg: `作废失败:${error.stack}`
        })
    }

})
//审核操作
router.post('/approve', async ctx => {
    const { action, remark, _id } = ctx.request.body;
    let Authorization = ctx.request.headers.authorization;//token
    let Token = Authorization.split(' ')[1];
    let { data } = jwt.verify(Token, config.secret);
    let doc = await Leave.findById(_id);
    let auditLogs = doc.auditLogs || [];
    let params = {};
    try {
        if (action === 'refuse') {
            params.auditState = 3;//拒绝
        } else if (action === 'pass') {
            //通过
            if (doc.auditFlows.length === doc.auditLogs.length) {//申请已经流程走完，及其它异常处理
                ctx.body = util.success({
                    data: true,
                    msg: `当前申请单已处理，请勿重复提交`
                })
                return;
            } else if (doc.auditFlows.length === (doc.auditLogs.length + 1)) {
                params.auditState = 4;//审批通过
            } else {
                params.auditState = 2;//审批中
                params.currentAuditUser = doc.auditFlows[doc.auditLogs.length + 1].userName;
            }
        }
        auditLogs.push({
            userId: data.userId,
            userName: data.userName,
            createTime: new Date(),
            remark,
            action: action == 'refuse' ? '审核拒绝' : '审核通过'
        })
        params.auditLogs = auditLogs;
        await Leave.findByIdAndUpdate(_id, params);
        ctx.body = util.success({
            data: true,
            msg: `审核操作成功`
        })
    } catch (error) {
        ctx.body = util.fail({
            code: CODE.PARAM_ERROR,
            msg: `审核操作异常:${error.stack}`
        })
    }
})
//待审核数量
router.get('/count', async ctx => {
    let Authorization = ctx.request.headers.authorization;//token
    let Token = Authorization.split(' ')[1];
    let { data } = jwt.verify(Token, config.secret);
    let params = {};
    try {
        params.currentAuditUser = data.userName;
        params.$or = [{ auditState: 1 }, { auditState: 2 }];
        const total = await Leave.countDocuments(params);
        ctx.body = util.success({
            msg: '查询成功',
            data: total
        })
    } catch (error) {
        ctx.body = util.fail({
            code: CODE.PARAM_ERROR,
            msg: `查询异常:${error.message}`
        })
    }
})
module.exports = router
