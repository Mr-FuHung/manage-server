/* *
*用户自增ID
*
* */

const { ManageDB } = require('./../config/db');
const mongoose = require('mongoose');
const counterSchema = mongoose.Schema({
    _id:String,
    sequence_value:Number
})
// mongoose.model("数据库集合名称", 配置)
module.exports = ManageDB.model("counters", counterSchema);