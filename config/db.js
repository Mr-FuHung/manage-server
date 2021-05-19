/* *
*
*数据库链接
* */
const config = require('./index')
const mongoose = require('mongoose');
const log4js = require('./../utils/log4');
mongoose.connect(config.URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

const db = mongoose.connection;

db.on('error', () => {//数据库连接失败时
    log4js.error('**数据库连接失败**')
})
db.on('open', () => {//数据库连接成功时
    log4js.info('**数据库连接成功**')
})