
import { pwyFetch } from '@piaozone.com/utils';
import { getUUId } from './common';

/**
 * 网络请求
 * @param {string} url 请求地址
 * @param {object} opts 请求配置
 * @returns 请求结果
 */
export async function kdRequest(url, opts) {
    const TAX_NO = window.__INITIAL_STATE__.TAX_NO;
    const API_PRE_PATH = window.__INITIAL_STATE__.API_PRE_PATH;
    const longLinkName = window.__INITIAL_STATE__.longLinkName;
    const clientType = window.__INITIAL_STATE__.client_type;
    const fpdk_type = window.__INITIAL_STATE__.fpdk_type;
    const reqid = getUUId();
    const { isFpdkService = false, ...options } = opts;

    let newUrl;
    let newOptions;
    if (!isFpdkService) {
        newUrl = `${API_PRE_PATH}/bill-websocket/v2/invoicewebsocket/push?name=${longLinkName}&taxNo=${TAX_NO}&reqid=${reqid}`;
        newOptions = {
            ...options,
            data: {
                data: {
                    request_path: url,
                    request_data: options.data
                },
                taxNo: TAX_NO,
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
