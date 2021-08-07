/* *
*
*数据库链接
* */
const config = require('./index')
const mongoose = require('mongoose');
const log4js = require('./../utils/log4');
let ManageDB = mongoose.createConnection(config.ManageURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
let BlogDB = mongoose.createConnection(config.BlogURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

// const db = mongoose.connection;


ManageDB.on('error', () => {//数据库连接失败时
    log4js.error('**manage数据库连接失败**')
})
ManageDB.on('open', () => {//数据库连接成功时
    log4js.info('**manage数据库连接成功**')
})
BlogDB.on('error', () => {//数据库连接失败时
    log4js.error('**blog数据库连接失败**')
})
BlogDB.on('open', () => {//数据库连接成功时
    log4js.info('**blog数据库连接成功**')
})
exports.ManageDB = ManageDB;
exports.BlogDB = BlogDB;