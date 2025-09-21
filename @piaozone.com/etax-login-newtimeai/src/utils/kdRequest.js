import { pwyFetch } from '@piaozone.com/utils';
import {
    getLongLinkName,
    getClientType,
    getAPI_PRE_PATH,
    getUUId,
    getTaxNo,
    getOperationType,
    shortEncryptByJSEncrypt
} from './common';

/**
 * 网络请求
 * @param {string} url 请求地址
 * @param {object} opts 请求配置
 * @returns 请求结果
 */
export async function kdRequest(url, opts) {
    const longLinkName = getLongLinkName();
    const clientType = getClientType();
    const API_PRE_PATH = getAPI_PRE_PATH();
    const taxNo = getTaxNo();
    const operationType = getOperationType();

    const res = await pwyFetch(
        `${API_PRE_PATH}/bill-websocket/v2/invoicewebsocket/push?name=${longLinkName}&taxNo=${taxNo}&operationType=${operationType}&reqid=${getUUId()}`,
        {
            ...opts,
            data: {
                data: {
                    request_path: url,
                    request_data: opts.data
                },
                taxNo,
                clientType
            }
        }
    );
    return res;
}

export async function encryptKdRequest(url, opts) {
    const longLinkName = getLongLinkName();
    const clientType = getClientType();
    const API_PRE_PATH = getAPI_PRE_PATH();
    const { operationType, ...options } = opts;
    const { taxNo } = options.data;
    const initUrl = `${API_PRE_PATH}/bill-websocket/v2/invoicewebsocket/push?name=${longLinkName}&taxNo=${taxNo}&reqid=${getUUId()}`;
    const newUrl = operationType ? `${initUrl}&operationType=${operationType}` : initUrl;

    let res;
    if (typeof opts.data?.password === 'undefined') {
        res = await pwyFetch(
            newUrl,
            {
                ...opts,
                data: {
                    data: {
                        request_path: url,
                        request_data: {
                            ...opts.data,
                            request_path: url,
                            clientType
                        }
                    },
                    taxNo,
                    clientType
                }
            }
        );
    } else {
        res = await pwyFetch(
            newUrl,
            {
                ...opts,
                data: {
                    data: {
                        request_path: url,
                        request_data: {
                            ...opts.data,
                            password: shortEncryptByJSEncrypt(encodeURIComponent(opts.data.password)),
                            request_path: url,
                            clientType
                        }
                    },
                    taxNo,
                    clientType
                }
            }
        );
    }

    return res;
}
