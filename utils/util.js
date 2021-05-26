/* 
*通用工具函数
*@author baron
*
 */
const log4js = require('./log4');

const CODE = {
    SUCCESS: 200,
    PARAM_ERROR: 10001,//参数不正确
    USER_ACCOUNT_ERROR: 20001,//用户账号密码错误
    USER_LOGIN_ERROR: 20002,//用户未登录
    BUSINESS_ERROE: 9999,//业务请求失败
    AUTH_ERROR: 40001//认证失败或者THKEN过期
};

module.exports = {
    CODE,
    pager({ pageNum = 1, pageSize = 10 }) {
        pageNum -= 0;
        pageSize -= 0;
        const skipIndex = (pageNum - 1) * pageSize;
        return {
            page: {
                pageSize,
                pageNum
            },
            skipIndex
        }
    },
    success({ data = null, msg = '请求成功', code = CODE.SUCCESS }) {
        log4js.info(data)
        return {
            data, msg, code
        }
    },
    fail({ data = null, msg = '请求失败', code = CODE.BUSINESS_ERROE }) {
        log4js.debug(msg)
        return {
            data, msg, code
        }
    }
}