/* 
* 日志存储
*@author baron
* */
const log4js = require('log4js')//日志

const levels = {
    'trace': log4js.levels.TRACE,
    'debug': log4js.levels.DEBUG,
    'info': log4js.levels.INFO,
    'warn': log4js.levels.WARN,
    'error': log4js.levels.ERROR,
    'trace': log4js.levels.TRACE,
    'fatal': log4js.levels.FATAL,
}
log4js.configure({
    appenders: {//设置配置项
        console: { type: 'console' },
        info: {
            type: 'file',
            filename: 'logs/info-log.log'
        },
        error: {
            type: 'datefile',
            filename: 'logs/error',
            pattern: 'yyyy-MM-dd.log',
            alwaysIncludePattern: true//设置文件名称为filename+pattern的组合体
        }
    },
    categories: {//使用配置项，设置级别
        default: { appenders: ['console'], level: 'debug' },
        info: { appenders: ['info', 'console'], level: 'info' },//上线可以不使用console
        error: { appenders: ['error', 'console'], level: 'error' },//上线可以不使用console
    }
})
/* 
* 日志输出
*@param { string } content
 */
exports.debug = (content) => {
    let logger = log4js.getLogger();
    logger.level = levels.debug;
    logger.debug(content)
}
exports.error = (content) => {
    let logger = log4js.getLogger('error');
    logger.level = levels.debug;
    logger.error(content)
}
exports.info = (content) => {
    let logger = log4js.getLogger('info');
    logger.level = levels.debug;
    logger.info(content)
}