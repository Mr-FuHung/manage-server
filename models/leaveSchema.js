/* *
*数据库的实体对象
*
* */
const { ManageDB } = require('./../config/db');
const mongoose = require('mongoose');
const leaveSchema = mongoose.Schema({
    "orderNo": String,//单号
    "leaveType": Number,//休假类型
    "startTime": Date,//开始时间
    "endTime": Date,//结束时间
    "applyUser": {//申请人信息
        "userId": String,
        "userName": String,
        "userEmail": String
    },//申请人
    "leaveTime": String,//休假时长
    "reasons": String,//休假原因
    "auditUsers": String,//所有审批人
    "currentAuditUser": String,//当前审批人
    "auditFlows": [//审批流程
        {
            "userId": String,
            "userName": String,
            "userEmail": String
        }
    ],
    "auditLogs": [//授权日志
        {
            "userId": String,
            "userName": String,
            "createTime": Date,
            "remark": String,
            "action": String
        }
    ],
    "auditState": {
        type: Number,
        default: 1
    },//申请状态
    "createTime": {
        type: Date,
        default: Date.now()
    },//创建时间
    "updateTime": {
        type: Date,
        default: Date.now()
    },//更新时间
    remark: String//备用字段
})
// mongoose.model("数据库集合名称", 配置)
module.exports = ManageDB.model("leave", leaveSchema);