import { param as paramJson } from './kdRequest';
import { getCookie, setCookie, clearCookie } from './cookie_helps';

import { invoiceTypes } from '@piaozone.com/pwyConstants';

const INPUT_INVOICE_TYPES_DICT = invoiceTypes.INPUT_INVOICE_TYPES_DICT;
/**
 * @description 根据发票类型获取发票的中文名称
 * @param {int} i 发票类型
 * @returns {string} 如果未匹配到任何发票，返回'--'
 */
export const getInvoiceTypeName = function(i){
	const dict = {
		'k1': '普通电子发票',
		'k2': '电子发票专票',
		'k3': '普通纸质发票',
		'k4': '专用纸质发票',
		'k5': '普通纸质卷式发票',
		'k7': '通用机打票',
		'k8': '的士票',
		'k9': '火车票',
		'k10': '飞机票',
		'k11': '其他票',
		'k12': '机动车发票',
		'k13': '二手车发票',
		'k14': '定额发票',
		'k15': '通行费电子发票',
		'k16': '客运发票',
    	'k17': '过路过桥费',
    	'k19': '完税证明',
    	'k20': '轮船票',
    	'k21': '海关缴款书',
    	'k23': '通用机打电子发票',
    	'k24': '火车票退票凭证',
    	'k25': '财政电子票据',
    	'k26': '数电票（普通发票）',
    	'k27': '数电票（增值税专用发票）',
    	'k28': '数电票（航空运输电子客票行程单）',
    	'k29': '数电票（铁路电子客票）',
    	'k83': '数电发票（机动车销售统一发票）',
    	'k84': '数电发票（二手车销售统一发票）'
	}

	return dict['k'+i] || '--';
}


/**
 * @description	检测采集的发票抬头和企业名称是否一致
 * @param {int} fplx 发票类型，int类型
 * @param {string} invoiceGhf_mc 发票的购方名称
 * @param {string} ghf_mc 购方企业名称
 * @param {string} checkMode 校验模式，严格或简单模式：strict, simple（少于6个字符的发票抬头默认抬头一致）
 * @returns {int} 1、发票抬头和企业抬头一致, 2、发票抬头和企业抬头不一致 3、该票种不需要校验发票抬头
 *
 */
export const checkInvoiceTitle = function(fplx, invoiceGhf_mc='', ghf_mc='', checkMode='simple'){

	//需要校验发票抬头的发票类型
	const checkInvoiceTypes = [
		1, //普通电子发票
		3, //普通纸质发票
		4, //专用纸质发票
		5, //普通纸质卷票
		15 //通行费
	];

	const filterReg = /[^A-Za-z0-9\u4e00-\u9fa5]/g;

	if(checkInvoiceTypes.indexOf(parseInt(fplx)) !== -1){
		invoiceGhf_mc = invoiceGhf_mc.replace(filterReg, '').trim();
		ghf_mc = ghf_mc.replace(filterReg, '').trim();

		if(checkMode === 'strict'){
			if(invoiceGhf_mc === ghf_mc){
				return 1; //发票抬头和企业抬头一致
			}else{
				return 2; //发票抬头和企业抬头不一致
			}
		}else if(checkMode === 'simple'){
			if(invoiceGhf_mc.length <6 || invoiceGhf_mc === ghf_mc){
				return 1;
			}else{
				return 2;
			}
		}
	}else{
		return 3; //该票种不需要校验发票抬头
	}

}

/**
 * @description	检测企业采集的发票是否和企业税号一致
 * @param {int} fplx 发票类型
 * @param {string} invoiceGhf_tin 发票的购货方税号
 * @param {string} ghf_tin 企业税号
 * @param {string} checkMode 校验模式，严格或简单模式：strict, simple（少于6个字符的发票抬头不做税号校验）
 * @returns {int} 1、发票购方税号和企业税号一致，2、发票购方税号和企业税号不一致，3、该票种不需要校验发票购方税号
 */
export const checkInvoiceTin = function(fplx, invoiceGhf_tin='', ghf_tin='', invoiceGhf_mc='', checkMode='simple'){
	//需要校验发票税号的发票类型
	const checkInvoiceTypes = [
		1, //普通电子发票
		3, //普通纸质发票
		4, //专用纸质发票
		5, //普通纸质卷票
		15 //通行费
	];

	const filterReg = /[^A-Za-z0-9\u4e00-\u9fa5]/g;

	if(checkInvoiceTypes.indexOf(parseInt(fplx)) !== -1){
		if(checkMode === 'strict'){
			if(invoiceGhf_tin === ghf_tin){
				return 1; //发票购方税号和企业税号一致
			}else{
				return 2; //发票购方税号和企业税号不一致
			}
		}else if(checkMode === 'simple'){
			invoiceGhf_mc = invoiceGhf_mc.replace(filterReg, '').trim();
			if(invoiceGhf_mc.length <6 || invoiceGhf_tin === ghf_tin){
				return 1;
			}else{
				return 2; //发票购方税号和企业税号不一致
			}
		}

	}else{
		return 3; //该票种不需要校验发票购方税号
	}
}

/**
 * @description 解析发票二维码中的关键字段
 * @param {string} qrStr 扫描发票二维码获取到的字符串
 * @returns {object|false} 如果能够正常界面二维码中发票数据，返回object, 否则返回false
 */
export const getInvoiceQrInfo = function(qrStr){
	var fpInfo = qrStr.replace(/[，]/g, ',').split(',');
	try{
		var fpdm = fpInfo[2];
		var fphm = fpInfo[3];
		var kprq = fpInfo[5];
		var amount = fpInfo[4];
		var jym = fpInfo[6].substr(-6);
		if(!fphm || !kprq){ //二维码数据格式有误
			return false;
		}else{
			return fpInfo = {
				fpdm: fpdm,
				fphm: fphm,
				kprq: kprq,
				amount: amount,
				jym: jym
			};
		}
	}catch(e){
	   return false;
	}
}

/**
 *获取地址后的参数
 */
function urlSearch(search = '') {
    search = search.replace('?', '&');
    if (typeof search !== "string" || !search) return search;
    return search.split("&").reduce((res, cur) => {
        const arr = cur.split("=");
        return Object.assign({ [arr[0]]: arr[1] }, res);
    }, {})
}

//根据发票代码判断专票或普票
function checkInvoiceType(fpdm) {
    const last3Str = fpdm.substr(fpdm.length - 3);
    const last2Str = fpdm.substr(fpdm.length - 2);
    const firstStr = fpdm.substr(0, 1);
    const eighthStr = fpdm.substr(7, 1);
    const sixthStr = fpdm.substr(5, 1);
    if (fpdm.length == '10') {
        if (last3Str === '130' || last3Str === '140' || last3Str === '160' || last3Str === '170') {
            return 4; //专票
        } else {
            return 3
        }
    } else {
        if (fpdm.length == 12) {
            if (firstStr == '0' && last2Str == '12') {
                return 15; //通行费
            }
            if (firstStr == '0' && last2Str == '11') {
                return 1; //电普票
            }
            if (firstStr == '0' && last2Str == '06') {
                return 5; //卷式
            }
            if (firstStr == '0' && last2Str == '07') {
                return 5; //卷式
            }
            if (firstStr == '0' && last2Str == '17') { //二手车发票
                return 13;
            }
            if (sixthStr == '1' || sixthStr == '2') {
                if (eighthStr == '2') { //机动车销售票
                    return 12;
                }
            }
            if (firstStr == '0' && last2Str == '13') {
                return 2; //电专票
            }
        }
    }
    return 3;
}

export const getInvoiceQrInfoNew = function(qrStr) { //最新处理扫码抢扫二维码
    if (qrStr.indexOf('https' || 'http') > -1 && qrStr.indexOf('?')) {
        const { bill_num = '', total_amount = '', hash = '' } = urlSearch(qrStr);
        if (bill_num != '' && total_amount != '' && hash != '') {//新型区块链电子票
            return { errcode: '0000', qrcodeType: 'web', data: { bill_num, total_amount, hash }, description: '成功' };
        } else {
            return { errcode: 'fail', qrcodeType: 'web', description: '请扫描发票（电，普，专）' };
        }
    } else {
        var fpInfo = qrStr.replace(/[，]/g, ',').split(',');
        const data = fpInfo[5]; //日期格式不统一，有的带-
        if(data.length !== 8 && data.length !== 10 && (fpInfo[3] && fpInfo[3].length !== 8)) {
            return { errcode: 'fail', description:'请切换英文输入法再进行扫描' }
        } else {
            try {
                const fpdm = fpInfo[2];
                const fphm = fpInfo[3];
                if (fphm.length == 20) { // 全电发票
                    const kprq = fpInfo[5];
                    const amount = fpInfo[4];
                    let fplx = '';
                    if (fpInfo[1] == '31') {
                        fplx = '27';
                    } else if (fpInfo[1] == '32') {
                        fplx = '26';
                    }
                    return { errcode: '0000', qrcodeType: 'string', data: { fpdm: '', fphm, kprq, amount, jym: '', invoiceType: fplx }, description:'成功' }
                }
                const index = fpInfo[6].indexOf('20');
                if (fpInfo[6].length == 8 && index == 0) {//区块链电子发票
                    const kprq = fpInfo[6];
                    const amount = fpInfo[5];
                    const jym = fpInfo[7].substr(-5);
                    return { errcode: '0000', qrcodeType: 'string', data: { fpdm, fphm, kprq, amount, jym }, description:'成功' }
                } else {
                    const kprq = fpInfo[5];
                    const amount = fpInfo[4];
                    const jym = fpInfo[6].substr(-6);
                    if (!fpdm || !fphm || !kprq) { //二维码数据格式有误
                        return { errcode: 'fail', qrcodeType: 'string', description: '请扫描发票（电，普，专）' };
                    } else {
                        if (amount == '' && jym == '') {
                            return { errcode: 'fail', description: '请扫描发票（电，普，专）' };
                        }else{
                            const fplxArr = [1, 2, 3, 4, 15];
                            const fplx = checkInvoiceType(fpdm);
                            if (fplxArr.indexOf(fplx) == '-1') {
                                return { errcode: 'fail', description: '请扫描发票（电，普，专）' };
                            } else {
                                return { errcode: '0000', qrcodeType: 'string', data: { fpdm, fphm, kprq, amount, jym, invoiceType: fplx }, description:'成功' }
                            }
                        }
                    }
                }
            } catch (e) {
                return { errcode: 'fail', description: '请扫描发票（电，普，专）' };
            }
        }
    }
};

/**
 * @description 将blob数据转换为file对象
 * @param {blob} blobData 需要转换的blob数据
 * @param {string}} filename 转换后的文件名称
 */
export const blobToFile = function(blobData, filename) {
    const nameArr = filename.split('.');
    const ext = nameArr[nameArr.length - 1];
    let type = 'image/jpeg';
    if (ext === 'png') {
        type = 'image/png';
    } else if (ext === 'bmp') {
        type = 'image/bmp';
    } else if (ext === 'jpg') {
        type = 'image/jpeg';
    } else if(ext === 'pdf') {
        type = 'application/pdf';
    } else {
        type = 'application/octet-stream';
    }

    if (window.File && typeof window.File === 'function') {
        const targetFile = new window.File([blobData], filename, { type: type });
        return targetFile;
    } else {
        return false;
    }
}


/**
 * @description 通过XMLHttpRequest方式处理下载，要求支持XMLHttpRequest、blob、FileReader
 * @param { string } url 请求的路径
 * @param { string } key 请求的数据key
 * @param { string|object } data 请求的数据, 支持string和object
 * @param { string } method 请求的方法，默认post
 * @param { function } startCallback 开始下载前的回调
 * @param { function } endCallback 请求完成结束后的回调，如果有失败可以根据返回的json提示
 */
const downloadFileXhr = function({ url, key = 'downloadParams', data = {}, method = 'POST', startCallback, endCallback, timeout = 60000 }) {
    method = method.toLocaleLowerCase();
    startCallback();

    const myEndCallback = (res) => {
        clearCookie('downloadResult');
        typeof endCallback === 'function' && endCallback(res);
    };

    const xhr = new window.XMLHttpRequest();

    let csrfToken = getCookie('csrfToken');
    if (!csrfToken) csrfToken = window.__INITIAL_STATE__ && window.__INITIAL_STATE__.csrfToken;

    if(url.indexOf('?') === -1){
    	url = url + '?_csrf=' + csrfToken;
    }else{
    	url = url + '&_csrf=' + csrfToken;
    }

    if (method === 'get') url += '&' + paramJson(data);

    xhr.open(method, url, true);
    xhr.responseType = 'blob'; // 返回类型blob
    xhr.setRequestHeader('Content-Type', 'application/json');
    if (csrfToken) {
        try {
            xhr.setRequestHeader('x-csrf-token', csrfToken);
            setCookie('csrfToken', csrfToken, 30 * 60);
        } catch (e) {
            //TODO handle the exception
            setCookie('csrfToken', csrfToken, 30 * 60);
        }
    }
    xhr.timeout = timeout; // 超时时间，单位是毫秒
    xhr.onerror = () => {
        myEndCallback({ errcode: '5000', description: '服务端异常，请稍后再试' });
    };

    xhr.ontimeout = () => {
        myEndCallback({ errcode: '5004', description: '请求超时，请稍后再试' });
    };

    xhr.onload = () => {
        if (xhr.status === 200) {
            const blob = xhr.response;
            const ctype = xhr.getResponseHeader('Content-Type');
            if (ctype.indexOf('text/html') !== -1) {
                myEndCallback({ errcode: '5000', description: '服务端异常，请稍后再试' });
            } else if (ctype.indexOf('application/json') !== -1) {
                const reader = new window.FileReader();
                reader.onload = function() {
                    let content = reader.result;//内容就在这里
                    try {
                        content = JSON.parse(content);
                    } catch (error) {
                        content = { errcode: '5000', description: '服务端异常，请稍后再试' };
                        console.error(error);
                    }
                    myEndCallback(content);
                };
                reader.readAsText(blob);
            } else {
                const disposition = xhr.getResponseHeader('Content-Disposition');

                const dispositionArr = disposition.replace(/\s/g, '').split(';');
                const dispositionObj = {};
                for(let i = 0, len = dispositionArr.length; i < len; i++){
                    const param = dispositionArr[i].split('=');
                    let temValue = '';
                    if (param[1]) temValue = param[1].replace(/^"/, '').replace(/"$/, '');
                    dispositionObj[param[0]] = temValue;
                }
                const filename = (dispositionObj['filename*'] || dispositionObj.filename || dispositionObj.fileName ||'file');

                if (navigator.msSaveOrOpenBlob) {
                    navigator.msSaveOrOpenBlob(new Blob([blob]), filename);
                } else {
                    const eleLink = document.createElement('a');
                    eleLink.download = decodeURIComponent(filename);
                    eleLink.style.display = 'none';
                    eleLink.href = URL.createObjectURL(new Blob([blob]));
                    document.body.appendChild(eleLink);
                    eleLink.click();
                    document.body.removeChild(eleLink);
                }
                myEndCallback({ errcode: '0000', description: '下载成功' });
            }
        } else {
            myEndCallback({ errcode: '5000', description: '请求异常，请稍后再试' });
        }
    };

    if (method === 'post') {
        const dataStr = JSON.stringify(data);
        const newData = {};
        newData[key] = dataStr;
        xhr.send(JSON.stringify(newData));
    } else {
        xhr.send();
    }
};


/**
 *
 * @param { string } url 请求的路径
 * @param { string } key 请求的数据key, 默认downloadParams，post发送数据时将会以这个key发送数据给后台，get无关
 * @param { string|object } data 请求的数据, 支持string和object
 * @param { string } method 请求的方法，默认post
 * @param { function } startCallback 开始下载前的回调
 * @param { function } endCallback 请求完成结束后的回调，如果有失败可以根据返回的json提示
 * 可以选择前端的处理方式，默认为form形式选择，兼容性好一些，当浏览器不支持blob等对象时会自动选择form形式，还支持直接form形式（兼容性更好）
 * 注意form形式需要后台配合处理成功后写入cookie: downloadResult=1, 不成功则不需要处理，
 * node层可以参考发票管理中心publicDownload中间件
 * @param { string} downloadType 选择前端的处理方式，xhr|form
 * @param { number } timeout 超时设置
 */

export const downloadFile = function(opt) {
    const { url, key = 'downloadParams', data = {}, method = 'POST', startCallback, endCallback, downloadType = 'xhr', timeout = 60000 } = opt;
    if (window.XMLHttpRequest && window.Blob && window.FileReader && downloadType === 'xhr') {
        downloadFileXhr(opt);
    } else {
        startCallback();
        const iframeId = 'tempDownloadIframe' + (+new Date());
        const formId = 'tempFormId_' + (+new Date());
        clearCookie('downloadResult');
        const myEndCallback = (res) => {
            const iframEl = document.getElementById(iframeId);
            const formEl = document.getElementById(formId);
            clearCookie('downloadResult');
            iframEl.innerHTML = '';
            iframEl.parentNode.removeChild(iframEl);
            formEl.parentNode.removeChild(formEl);
            typeof endCallback === 'function' && endCallback(res);
        };

        const checkStatus = (startTime) => {
            if (((+new Date()) - startTime) > timeout) {
                myEndCallback({ errcode: '5004', description: '请求超时，请稍后再试！' });
            } else {
                let result = getCookie('downloadResult');
                if (result) {
                    if (result === '1') {
                        myEndCallback({ errcode: '0000', description: '下载成功' });
                    } else {
                        result = JSON.parse(unescape(result));
                        myEndCallback(result);
                    }
                } else {
                    setTimeout(function () {
                        checkStatus(startTime);
                    }, 1000);
                }
            }
        };
        const iframe = document.createElement('iframe');
        iframe.id = iframeId;
        iframe.name = iframeId;
        iframe.enctype = 'application/x-www-form-urlencoded';
        iframe.style.display = 'none';
        document.body.appendChild(iframe);
        const formEl = document.createElement('form');
        formEl.id = formId;
        formEl.target = iframeId;
        formEl.style.display = 'none';
        formEl.method = method;
        formEl.action = url;
        const inputEl = document.createElement('input');
        inputEl.type = 'hidden';
        inputEl.name = key;
        inputEl.value = typeof data === 'object' ? JSON.stringify(data) : data;
        formEl.appendChild(inputEl);
        document.body.appendChild(formEl);
        formEl.submit();
        checkStatus(+new Date());
    }
};

export const getUUId = () => {
    let d = new Date().getTime();
    const uuid = 'xxxxxxxxxxxxxxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
    return uuid;
};

// 日志打印
export const consoleLog = (tip, level = 'error', title='') => {
    if (typeof window.console === 'object') {
        if (level === 'error') {
            if (title) {
                window.console.error(title, tip);
            } else {
                window.console.error(tip);
            }
        } else if (level === 'warn'){
            if (title) {
                window.console.warn(title, tip);
            } else {
                window.console.warn(tip);
            }
        } else {
            if (title) {
                window.console.log(title, tip);
            } else {
                window.console.log(tip);
            }
        }
    }
}

// 校验指定class元素是否在地址显示区域类，可以用于动态懒加载图像等
export const isInVisualArea = (elCls, pObj) => {
    const items = pObj.getElementsByClassName(elCls);
    const boxInfo = pObj.getBoundingClientRect();
    const { top, left, bottom, right } = boxInfo;
    const result = [];
    for (let i = 0; i < items.length; i++) {
        const itemInfo = items[i].getBoundingClientRect();
        // 只要有部分区域在指定区域内，则认为应该显示
        if (itemInfo.top >= top && itemInfo.left >= left && itemInfo.top <= bottom && itemInfo.left <= right) {
            result.push(true);
        } else {
            result.push(false);
        }
    }
    return result;
};


// 校验发票的校验信息
export const getInvoiceErrInfo = function(invoice) {
    const waringResult = [];
    const errorResult = [];

    const invoiceStatusDict = {
        k1: '该发票已失控',
        k2: '该发票已作废',
        k3: '该发票已红冲',
        k4: '该发票处于异常状态',
        k5: '该发票处于非正常状态',
        k6: '该发票处于待确认状态',
        k7: '该发票处于部分红冲状态',
        k8: '该发票处于全额红冲状态'
    };

    const {
        invoiceType,
        invoiceStatus,
        // 红色提醒字段
        checkStatus, // 查验状态1：通过，2，不通过，3：未查验
        isNotEqualTaxNo, // 税号不一致
        isNotEqualBuyerName, // 抬头不一致
        repeatBx, // 1、非重复报销；2、是重复报销
        isBlacklist, // 1、非黑名单；2、是黑名单
        // 黄色提醒字段
        isSensitiveWords, // 1、非敏感词；2、是敏感词
        // isContinuousNumber, // 1、非连号发票；2、是连号发票
        continuousNos = [], // 1、非连号发票；2、是连号发票
        warningCode = '', //1.正常；2.疑似旧的监制章发票；3.疑似串号
        isOverdueInvoice,  //1、非发票过期；2、是发票过期
        isRevise // 非增票手动修改：1、未修改；2、已修改
    } = invoice;

    const invoiceTypeInfo = INPUT_INVOICE_TYPES_DICT['k' + invoiceType] || {};
    if (invoiceTypeInfo.isAddedTax) {
        if(parseInt(checkStatus) === 2) {
            errorResult.push('查验数据不相符！');
        } else if(parseInt(checkStatus) === 3) {
            errorResult.push('发票还未进行查验！');
        }

        if (invoiceStatusDict['k' + invoiceStatus]) {
            errorResult.push(invoiceStatusDict['k' + invoiceStatus]);
        }
    }

    if (isNotEqualTaxNo) {
        errorResult.push('企业税号与发票购方税号不一致！');
    }

    if (isNotEqualBuyerName) {
        errorResult.push('企业抬头与发票抬头不一致！');
    }

    if (repeatBx === 2) {
        errorResult.push('发票重复报销！');
    }

    if (isBlacklist === 2) {
        errorResult.push('该发票在黑名单中！');
    }

    if (isSensitiveWords === 2) {
        waringResult.push('发票中包含敏感词！');
    }

    if (continuousNos && continuousNos.length > 0) {
        // 的士票连号提示
        if (parseInt(invoiceType) === 8) {
            waringResult.push('的士票连号，连号号码' + continuousNos.join(','));
        }
    }

    const warningCodeArr = warningCode.split(',');
    // if (warningCodeArr.indexOf('2') !== -1) {
    //    waringResult.push('疑似旧的监制章发票！');
    // }
    if (warningCodeArr.indexOf('3') !== -1) {
        waringResult.push('疑似串号发票！');
    }

    if (isOverdueInvoice === 2) {
        waringResult.push('该发票已过期！');
    }

    if (isRevise === 2) {
        waringResult.push('手工修改过发票字段！');
    }

    return {
        errorResult,
        waringResult
    };
}

// 已二进制方式读取文件
export const readAsBinaryString = (file) => {
    return new Promise((resolve) => {
        const reader = new FileReader();
        if (typeof FileReader.prototype.readAsBinaryString === 'function') {
            reader.onload = function (e) {
                resolve(reader.result);
            }
            reader.onerror = function() {
                resolve(null);
            }
            reader.readAsBinaryString(file);
        } else { // ie版本没有原生的方法，通过readAsArrayBuffer兼容
            let binary = '';
            reader.onload = function (e) {
                var bytes = new Uint8Array(reader.result);
                var length = bytes.byteLength;
                for (var i = 0; i < length; i++) {
                    binary += String.fromCharCode(bytes[i]);
                }
                resolve(binary);
            }
            reader.onerror = function() {
                resolve(null);
            }
            reader.readAsArrayBuffer(file);
        }
    });
}