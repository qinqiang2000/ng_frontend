/* eslint-disable */
// import errcodeInfo from '$client/errcodeInfo';

function getErrMsg(e, n) {
    var t = '服务出现异常';
    if (e && e.length > 0) {
        t += '，异常代码：' + e;
    }

    if (n && n.length > 0) {
        t += ', 异常信息：' + n.substr(0, 100);
    };
    return t;
}

export default function handleResult(e) {
    var n = e.key1;
    if (n === 'w4000000') {
        return errcodeInfo.govLogout;
    } else if (n === '999') {
        return errcodeInfo.gov888Err;
    } else {
        return { ...errcodeInfo.govErr, description: getErrMsg(n, e.key2) };
    }
}
