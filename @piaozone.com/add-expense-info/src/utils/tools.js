import { Modal } from 'antd';
export const confirmDialog = function(content, showDialog, cback) {
    if (showDialog) {
        Modal.confirm({
            content,
            okText: '确定',
            cancelText: '取消',
            onOk: () => {
                typeof cback === 'function' && cback();
            }
        });
    } else {
        typeof cback === 'function' && cback();
    }
};

export const changeKingdeeUrl = function(url = '') {
    const { httpsPort = '', env } = window.pageData || {};
    if (env !== 'prod' && env !== 'test') {
        return url;
    }
    const prefix = 'https://api.kingdee.com/kdrive/';
    const privateBaseUrl = window.pageData.privateBaseUrl || '';
    const s3testFilePath = 'https://api-dev.piaozone.com/';
    const s3ProdFilePath = 'https://api.piaozone.com/';
    if (url && ((url.indexOf(s3testFilePath) !== -1) || url.indexOf(s3ProdFilePath) !== -1)) { // 兼容s3
        if (privateBaseUrl) {
            if (env === 'test') {
                const pathStr = url.replace(s3testFilePath, '');
                return privateBaseUrl + pathStr;
            } else if (env === 'prod') {
                const pathStr = url.replace(s3ProdFilePath, '');
                return privateBaseUrl + pathStr;
            }
        }
        return url;
    } else {
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
    }
    return url;
};