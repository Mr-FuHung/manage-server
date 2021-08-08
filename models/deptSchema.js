/* *
*数据库的实体对象
*
* */
const { ManageDB } = require('./../config/db');
const mongoose = require('mongoose');
const deptSchema = mongoose.Schema({
    deptName: String,//部门名称
    userId: String,//部门负责人ID
    userName: String,//部门负责人名称
    userEmail: String,//部门负责人邮箱
    parentId:[mongoose.Types.ObjectId],
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
module.exports = ManageDB.model("dept", deptSchema);