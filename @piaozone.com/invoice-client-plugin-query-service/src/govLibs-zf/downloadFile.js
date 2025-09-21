/* eslint-disable */
export async function downloadFile(innerOpt = {}) {
    const errcodeInfo = window.pwyNightmare.errcodeInfo;
    // arraybuffer转换为base64
    const translateArrayBufferToBase64 = (buffer) => {
        let binaryStr = '';
        const bytes = new Uint8Array(buffer);
        const len = bytes.byteLength;
        for(let i=0; i<len; i++){
            binaryStr +=String.fromCharCode(bytes [i]);
        }
        return window.btoa(binaryStr);
    };

    // arraybuffer转换为str
    const abToString = (buffer) => {
        var uint8array = new Uint8Array(buffer);
        const str = new TextDecoder().decode(uint8array);
        return str;
    };

    const downloadUrl = (innerOpt.IPXZ ? IPXZ : IP) + innerOpt.url + '?' + innerOpt.searchStr + '&token=' + getCookie('token') + '&ymbb=' + ymbb;
    const infoRes = await fetch(downloadUrl, {
        type: 'post',
        timeout: TIMEOUT,
        dataType: 'arrayBuffer'
    });
    const bf = await infoRes.arrayBuffer();
    const contentType = infoRes.headers.get('Content-Type') || '';
    // 返回了错误信息
    if (contentType.indexOf('text/javascript') !== -1) {
        const str = abToString(bf);
        let jsonData = {};
        try {
            jsonData = JSON.parse(str);
        } catch (error) {
            return errcodeInfo.govErr;
        }
        return window.pwyNightmare.handleResult(jsonData);
    }
    const base64Str = translateArrayBufferToBase64(bf);
    return {
        errcode: '0000',
        data: base64Str
    };
}