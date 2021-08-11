/* *
*数据库的实体对象
*
* */
const { BlogDB } = require('./../config/db');
const mongoose = require('mongoose');
const userSchema = mongoose.Schema({
    "userId": Number,//用户ID，自增长
    "userName": String,//用户名称
    // "userPwd": String,//用户密码，md5加密
    "email": String,//用户邮箱
    "webUrl": String,//网址
    "city": String,//城市
    "ip": String,//ip
    "state": {
        type: Number,
        default: 1
    },//1:正常  2:禁用
    "createTime": {
        type: Date,
        default: Date.now
    },//创建时间
    "lastLoginTime": {
        type: Date,
        default: Date.now
    },//最后登录时间
    remark: String//备用字段
})
// mongoose.model("数据库集合名称", 配置)
module.exports = BlogDB.model("users", userSchema);