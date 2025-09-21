import { pwyFetch } from '@piaozone.com/utils';
import { getAPI_PRE_PATH, getClientType, getLongLinkName, getFpdkType, getUUId } from './common';

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
    const fpdk_type = getFpdkType();
    const reqid = getUUId();
    const { isFpdkService = false, operationType, ...options } = opts;
    let newUrl;
    let newOptions;
    if (!isFpdkService) {
        const { taxNo, data } = options.data;
        const initUrl = `${API_PRE_PATH}/bill-websocket/v2/invoicewebsocket/push?name=${longLinkName}&taxNo=${taxNo}&reqid=${reqid}`;
        newUrl = operationType ? `${initUrl}&operationType=${operationType}` : initUrl;
        newOptions = {
            ...options,
            data: {
                data: {
                    request_path: url,
                    request_data: data
                },
                taxNo,
                clientType
            }
        };
    } else {
        newUrl = `${API_PRE_PATH}${url}?fpdk_type=${fpdk_type}&reqid=${reqid}`;
        newOptions = {
            ...options,
            data: {
                ...options.data,
                clientType
            }
        };
    }
    const res = await pwyFetch(
        newUrl,
        newOptions
    );
    return res;
}
