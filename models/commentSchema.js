/* *
*数据库的实体对象
*
* */
const { BlogDB } = require('./../config/db');
const mongoose = require('mongoose');
const commentSchema = mongoose.Schema({
    "parentId": {
        type: mongoose.Types.ObjectId,
        default: null
    },//层级为1表示1级，其余为2级
    "replyId": {
        type: String,
        default: ''
    },//被回复人
    "replyName": {
        type: String,
        default: ''
    },//被回复人
    "articleId": {
        type: Number,
        default: 1//文章ID，1为留言
    },
    "state": {
        type: Number,
        default: 1//1公开,2隐藏
    },//状态
    "content": String,//留言内容
    "userInfo": {//作者信息
        userName: String,
        userId: String,
        email: String,
        webUrl: String
    },
    "createTime": {
        type: Date,
        default: Date.now
    },//创建时间
    remark: String//备用字段
})
// mongoose.model("数据库集合名称", 配置)
module.exports = BlogDB.model("comments", commentSchema);