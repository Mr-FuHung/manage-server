/* *
*用户自增ID
*
* */

const mongoose = require('mongoose');
const counterSchema = mongoose.Schema({
    _id:String,
    sequence_value:Number
})
// mongoose.model("数据库集合名称", 配置)
module.exports = mongoose.model("counters", counterSchema);