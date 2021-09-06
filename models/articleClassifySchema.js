/* *
*数据库的实体对象
*
* */
const { BlogDB } = require('./../config/db');
const mongoose = require('mongoose');
const articleClassifySchema = mongoose.Schema({
    "articleClassName": String,//分类名称
    "desc": String,//描述
    "state": {
        type: Number,
        default: 1//1公开,2隐藏
    },//状态
    "articleClassId": Number,//分类id
    "createTime": {
        type: Date,
        default: Date.now
    },//创建时间
    "updateTime": {
        type: Date,
        default: Date.now
    },//更新时间
    remark: String//备用字段
})
// mongoose.model("数据库集合名称", 配置)
module.exports = BlogDB.model("articleClassify", articleClassifySchema);