const fpyPre = '1';

module.exports = {
    success: {
        errcode: '0000',
        description: 'success'
    },    
    fpyInnerErr: {
        errcode: fpyPre + '500',
        description: '服务端异常，请稍后再试'
    },
    fpyLogout: {
        errcode: fpyPre + '300',
        description: '用户登录信息失效，请重新登录'
    }   
};