/* *
*数据库的实体对象
*
* */
const mongoose = require('mongoose');
const userSchema = mongoose.Schema({
    "userId": Number,//用户ID，自增长
    "userName": String,//用户名称
    "userPwd": String,//用户密码，md5加密
    "userEmail": String,//用户邮箱
    "mobile": String,//手机号
    "sex": Number,//性别 0:男   1:女
    "deptId": [],//部门
    "job": String,//岗位
    "state": {
        type: Number,
        default: 1
    },//1:在职  2:离职  3:试用期
    "role": {
        type: Number,
        default: 2
    },//用户角色    0:超级管理员  1:管理员   2:普通用户
    "roleList": [],//系统角色
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
module.exports = mongoose.model("users", userSchema);