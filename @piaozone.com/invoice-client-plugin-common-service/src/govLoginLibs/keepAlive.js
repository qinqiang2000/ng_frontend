export function checkIsLogin() {
    window.open = function(path) {
        location.href = path;
    }
    const url = window.location.href;
    if (/https:\/\/dppt\..+\.chinatax\.gov\.cn:8443/.test(url)) {
        return {
            errcode: '0000',
            description: 'success',
            data: {
                isLogin: true
            }
        };
    }
    return {
        errcode: '0000',
        description: 'success',
        data: {
            isLogin: false
        }
    };
}