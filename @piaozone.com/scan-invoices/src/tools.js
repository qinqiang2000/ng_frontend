import { Modal } from 'antd';

export const changeKingdeeUrl = function(url = '', opt = {}) {
    const { httpsPort = '', env } = opt;
    if (env !== 'prod' && env !== 'test') {
        return url;
    }
    const prefix = 'https://api.kingdee.com/kdrive/';
    const privateBaseUrl = opt.privateBaseUrl || '';
    // 云盘地址
    if (url && url.indexOf(prefix) !== -1) {
        if (privateBaseUrl) {
            const pathStr = url.replace(prefix, '');
            if (env === 'test') {
                return privateBaseUrl + 'kdrive/' + pathStr;
            } else if (env === 'prod') {
                return privateBaseUrl + 'kdrive/' + pathStr;
            } else {
                return url;
            }
        } else if (httpsPort) {
            const httpsPortStr = ':' + httpsPort;
            const pathStr = url.replace(prefix, '');
            if (env === 'test') {
                return 'https://imgshow-master.piaozone.com' + httpsPortStr + '/kdrive/' + pathStr;
            } else if (env === 'prod') {
                return 'https://img-expense.piaozone.com' + httpsPortStr + '/kdrive/' + pathStr;
            }
        }
    }
    return url;
};

export const confirmDialog = function(content, showDialog, cback) {
    if (showDialog) {
        Modal.confirm({
            content,
            onOk: () => {
                typeof cback === 'function' && cback();
            }
        });
    } else {
        typeof cback === 'function' && cback();
    }
};