/* *
*数据库的实体对象
*
* */
const { ManageDB } = require('./../config/db');
const mongoose = require('mongoose');
const roleSchema = mongoose.Schema({
    permissionList: {
        checkedKeys: Array,
        halfCheckedKeys: Array
    },//权限列表
    roleName: String,//角色名称
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
module.exports = ManageDB.model("role", roleSchema);