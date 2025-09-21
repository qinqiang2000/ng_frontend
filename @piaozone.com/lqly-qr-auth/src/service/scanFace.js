import { pwyFetch } from '@piaozone.com/utils';

export function getUUId() {
    let d = new Date().getTime();
    const uuid = 'xxxxxxxxxyxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
    return uuid;
}

export async function queryQrInfo(API_PRE_PATH, data) {
    const res = await pwyFetch(`${API_PRE_PATH}/etax-bill/bill/invoice/scanFace/check/qr/info?taxNo=${data.taxNo}&reqid=${getUUId()}`, {
        data,
        method: 'post'
    });
    return res;
}


export async function queryCheckResult(API_PRE_PATH, data) {
    const res = await pwyFetch(`${API_PRE_PATH}/etax-bill/bill/invoice/scanFace/check/result/query?taxNo=${data.taxNo}&reqid=${getUUId()}`, {
        data,
        method: 'post'
    });
    return res;
}