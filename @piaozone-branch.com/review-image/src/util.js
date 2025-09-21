/* eslint-disable */
// 获取文件名中的后缀
const pwyConstants = require('@piaozone.com/pwyConstants');
export function getFileExtend(fileName) {
    return fileName && fileName.substring(fileName.lastIndexOf('.') + 1).toUpperCase();
}

// 获取文件类型
export function getFileType(ext) {
    ext = ext.toUpperCase();
    if (['PDF'].indexOf(ext) !== -1) {
        return 'pdf';
    } else if (['OFD'].indexOf(ext) !== -1) {
        return 'ofd';
    } else if (['XLS', 'XLSX', 'CSV'].indexOf(ext) !== -1) {
        return 'excel';
    } else if (['XML'].indexOf(ext) !== -1) {
        return 'xml';
    } else if (['BMP', 'PNG', 'JPEG', 'JPG', 'GIF'].indexOf(ext) !== -1) {
        return 'image';
    } else if (['DOC', 'DOCX'].indexOf(ext) !== -1) {
        return 'docx';
    } else if (['PPT', 'PPTX'].indexOf(ext) !== -1) {
        return 'ppt';
    } else if (['TXT'].indexOf(ext) !== -1) {
        return 'txt';
    } else if (['HEIC'].indexOf(ext) !== -1) {
        return 'heic';
    }
    return 'unknown';
}

// 增值税专用发票/电子专票
const specialTicket = [
    { name: '发票代码', key: 'invoiceCode' },
    { name: '发票号码', key: 'invoiceNo' },
    { name: '开票日期', key: 'invoiceDate' },
    { name: '不含税金额', key: 'invoiceAmount' },
    { name: '合计金额', key: 'totalAmount' },
    { name: '税额', key: 'totalTaxAmount' }
];

// 增值税普通发票/通行费发票/电子发票
const ordinaryTicket = [
    { name: '发票代码', key: 'invoiceCode' },
    { name: '发票号码', key: 'invoiceNo' },
    { name: '开票日期', key: 'invoiceDate' },
    { name: '校验码', key: 'checkCode' },
    { name: '合计金额', key: 'totalAmount' },
    { name: '税额', key: 'totalTaxAmount' }
];

const taxi = [// 出租车
    { name: '发票代码', key: 'invoiceCode' },
    { name: '发票号码', key: 'invoiceNo' },
    { name: '开票日期', key: 'invoiceDate' },
    { name: '金额（含税）', key: 'totalAmount' }
];

const usedCar = [ //二手车销售统一发票
    { name: '发票代码', key: 'invoiceCode' },
    { name: '发票号码', key: 'invoiceNo' },
    { name: '开票日期', key: 'invoiceDate' },
    { name: '车价合计', key: 'totalAmount' }
];

const roadBridge = [ //过路过桥 17
    { name: '发票代码', key: 'invoiceCode' },
    { name: '发票号码', key: 'invoiceNo' },
    { name: '开票日期', key: 'invoiceDate' },
    { name: '合计金额', key: 'totalAmount' }
];

const generalMachine = [ //通用机打电子发票
    { name: '发票代码', key: 'invoiceCode' },
    { name: '发票号码', key: 'invoiceNo' },
    { name: '开票日期', key: 'invoiceDate' },
    { name: '合计金额', key: 'totalAmount' }
];

// 火车票
const train = [
    { name: '印刷序号', key: 'printingSequenceNo' },
    { name: '车次', key: 'trainNum' },
    { name: '乘车日期', key: 'invoiceDate' },
    { name: '姓名', key: 'passengerName' },
    { name: '票价', key: 'totalAmount' },
    { name: '开始行程', key: 'stationGetOn' },
    { name: '结束行程', key: 'stationGetOff' }
];

// 定额发票
const quota = [
    { name: '发票代码', key: 'invoiceCode' },
    { name: '发票号码', key: 'invoiceNo' },
    { name: '金额', key: 'totalAmount' }
];

// 客运汽车
const car = [
    { name: '发票代码', key: 'invoiceCode' },
    { name: '发票号码', key: 'invoiceNo' },
    { name: '日期', key: 'invoiceDate' },
    { name: '出发站', key: 'stationGetOn' },
    { name: '到达站', key: 'stationGetOff' },
    { name: '票价', key: 'totalAmount' },
    { name: '姓名', key: 'passengerName' }
];

// 航空运输电子客运行程单
const airplane = [
    { name: '旅客姓名', key: 'customerName' },
    { name: '电子客票号码', key: 'electronicTicketNum' },
    { name: '票价', key: 'invoiceAmount' },
    { name: '开始行程', key: 'placeOfDeparture' },
    { name: '结束行程', key: 'destination' },
    { name: '乘机日期', key: 'invoiceDate' },
    { name: '航班号', key: 'flightNum' }
];

// 机动车销售统一发票
const vehicle = [
    { name: '发票代码', key: 'invoiceCode' },
    { name: '发票号码', key: 'invoiceNo' },
    { name: '开票日期', key: 'invoiceDate' },
    { name: '不含税金额', key: 'invoiceAmount' }
];

// 完税证明
const certificate = [
    { name: '纳税人识别号', key: 'buyerTaxNo' },
    { name: '税务机关名称', key: 'taxAuthorityName' },
    { name: '完税证明号', key: 'taxPaidProofNo' }
];

// 船票
const ship = [
    { name: '发票代码', key: 'invoiceCode' },
    { name: '发票号码', key: 'invoiceNo' },
    { name: '金额', key: 'totalAmount' },
    { name: '乘船日期', key: 'invoiceDate' }
];

// 其它发票
const other = [
    { name: '金额', key: 'totalAmount' },
    { name: '日期', key: 'billCreateTime' }
];

// 火车退票凭证
const trainRefund = [
    { name: '收据号码', key: 'number' },
    { name: '日期', key: 'billCreateTime' },
    { name: '金额', key: 'totalAmount' },
    { name: '抬头标题', key: 'title' }
];

// 海关缴款书
const customs = [
    { name: '缴款书号码', key: 'customDeclarationNo' },
    { name: '填发日期', key: 'invoiceDate' },
    { name: '报关单编号', key: 'declareNo' },
    { name: '税款金额合计', key: 'totalTaxAmount' },
    { name: '合计金额', key: 'totalAmount' },
    { name: '提/装货单号', key: 'dealGoodsNo' },
    { name: '提运单号', key: 'deliveryNo' }
];

// 财务票据
const finance = [
    { name: '票据代码', key: 'invoiceCode' },
    { name: '票据号码', key: 'invoiceNo' },
    { name: '校验码', key: 'checkCode' },
    { name: '开票日期', key: 'invoiceTime' }, //invoiceDate
    { name: '总金额', key: 'totalAmount' },
    { name: '业务流水号', key: 'serialNo' },
    { name: '红票票据代码', key: 'relatedInvoiceCode' },
    { name: '红票票据号码', key: 'relatedInvoiceNo' }
];

// 全电普票/专票
const electronic = [
    { name: '发票号码', key: 'invoiceNo' },
    { name: '开票日期', key: 'invoiceDate' },
    { name: '销方名称', key: 'salerName' },
    { name: '销方税号', key: 'salerTaxNo' },
    { name: '购方名称', key: 'buyerName' },
    { name: '购方税号', key: 'buyerTaxNo' },
    { name: '不含税金额', key: 'invoiceAmount' },
    { name: '税额', key: 'totalTaxAmount' },
    { name: '价税合计', key: 'totalAmount' }
];

const eleAirBill = [
    { name: '电子客票号码', key: 'electronicTicketNum' },
    { name: '开票日期', key: 'issueDate' },
    { name: '票价', key: 'invoiceAmount' },
    { name: '税费', key: 'totalTaxAmount' }, //增值税税额
    { name: '其他税费', key: 'otherTotalTaxAmount' },
    { name: '燃油附加费', key: 'fuelSurcharge' },
    { name: '民航发展基金', key: 'airportConstructionFee' },
    { name: '保险费', key: 'insurancePremium' },
    { name: '总额', key: 'totalAmount' }, //合计金额
    { name: '航班号', key: 'flightNum' },
    { name: '乘机日期', key: 'invoiceDate' }
];

const eleTrainBill = [
    { name: '发票号码', key: 'invoiceNo' },
    { name: '开票日期', key: 'issueDate' },
    { name: '车次', key: 'trainNum' },
    { name: '乘车日期', key: 'invoiceDate' },
    { name: '票价', key: 'totalAmount' },
    { name: '不含税金额', key: 'invoiceAmount' },
    { name: '税率', key: 'taxRate' },
    { name: '税额', key: 'totalTaxAmount' },
    { name: '电子客票号码', key: 'electronicTicketNum' },
    { name: '购方名称', key: 'buyerName' },
    { name: '购方税号', key: 'buyerTaxNo' }
];

const { INPUT_INVOICE_TYPES } = pwyConstants.invoiceTypes;

const invoiceFields = {
    1: { list: ordinaryTicket },
    2: { list: specialTicket },
    3: { list: ordinaryTicket },
    4: { list: specialTicket },
    5: { list: ordinaryTicket },
    7: { list: generalMachine },
    8: { list: taxi },
    9: { list: train },
    10: { list: airplane },
    11: { list: other },
    12: { list: vehicle },
    13: { list: usedCar },
    14: { list: quota },
    15: { list: ordinaryTicket },
    16: { list: car },
    17: { list: roadBridge },
    19: { list: certificate },
    20: { list: ship },
    21: { list: customs },
    23: { list: generalMachine },
    24: { list: trainRefund },
    25: { list: finance },
    26: { list: electronic },
    27: { list: electronic },
    28: { list: eleAirBill },
    29: { list: eleTrainBill }
};

const invoiceTypeName = {};

for (const item of INPUT_INVOICE_TYPES) {
    invoiceTypeName[item.value] = {
        text: item.text,
        isAddedTax: item.value === 23 ? true : item.isAddedTax || false,
        fields: invoiceFields[item.value].list
    };
}

export const invoiceBaseInfo = (invoiceType, selectedInfo) => {
    const isCheck = [1, 2];
    return [
        {
            name: '发票类型 ',
            key: 'name',
            value: invoiceType && invoiceTypeName[invoiceType] ? invoiceTypeName[invoiceType]?.text : '其他'
        },
        ...invoiceType && invoiceTypeName[invoiceType] ? invoiceTypeName[invoiceType].fields : [],
        {
            name: '是否查验',
            key: 'isCheckStatus',
            value: isCheck.includes(+selectedInfo.checkStatus) ? '是' : '否'
        },
        {
            name: '查验结果',
            key: 'checkStatus',
            value: +selectedInfo.checkStatus === 1 ? '通过' : +selectedInfo.checkStatus === 2 ? '否' : '---'
        },
        {
            name: '采集渠道',
            key: 'fuploadModeStr'
        }
        // {
        //     name: '签收匹配状态',
        //     key: ''
        // },
        // {
        //     name: '开票地',
        //     key: ''
        // }
    ];
};

export const clientCheck = function() {
    //rendering engines
    var engine = {
        ie: 0,
        gecko: 0,
        webkit: 0,
        khtml: 0,
        opera: 0,
        ver: null
    };
    //browsers
    var browser = {
        ie: 0,
        firefox: 0,
        safari: 0,
        konq: 0,
        opera: 0,
        chrome: 0,
        ver: null
    };
    //platform/device/OS
    var system = {
        win: false,
        mac: false,
        x11: false,
        //mobile devices
        iphone: false,
        ipod: false,
        ipad: false,
        ios: false,
        android: false,
        nokiaN: false,
        winMobile: false,
        //game systems
        wii: false,
        ps: false
    };
    //detect rendering engines/browsers
    var ua = navigator.userAgent;
    if (window.opera) {
        engine.ver = browser.ver = window.opera.version();
        engine.opera = browser.opera = parseFloat(engine.ver);
    } else if (/AppleWebKit\/(\S+)/.test(ua)) {
        engine.ver = RegExp['$1'];
        engine.webkit = parseFloat(engine.ver);

        //figure out if it's Chrome or Safari
        if (/Chrome\/(\S+)/.test(ua)) {
            browser.ver = RegExp['$1'];
            browser.chrome = parseFloat(browser.ver);
        } else if (/Version\/(\S+)/.test(ua)) {
            browser.ver = RegExp['$1'];
            browser.safari = parseFloat(browser.ver);
        } else {
            //approximate version
            var safariVersion = 1;
            if (engine.webkit < 100) {
                safariVersion = 1;
            } else if (engine.webkit < 312) {
                safariVersion = 1.2;
            } else if (engine.webkit < 412) {
                safariVersion = 1.3;
            } else {
                safariVersion = 2;
            }

            browser.safari = browser.ver = safariVersion;
        }
    } else if (/KHTML\/(\S+)/.test(ua) || /Konqueror\/([^;]+)/.test(ua)) {
        engine.ver = browser.ver = RegExp['$1'];
        engine.khtml = browser.konq = parseFloat(engine.ver);
    } else if (/rv:([^\)]+)\) Gecko\/\d{8}/.test(ua)) {
        engine.ver = RegExp['$1'];
        engine.gecko = parseFloat(engine.ver);

        //determine if it's Firefox
        if (/Firefox\/(\S+)/.test(ua)){
            browser.ver = RegExp['$1'];
            browser.firefox = parseFloat(browser.ver);
        }
    } else if (/MSIE ([^;]+)/.test(ua)) {
        engine.ver = browser.ver = RegExp['$1'];
        engine.ie = browser.ie = parseFloat(engine.ver);
    } else if (/Trident\/7.0/.test(ua) && /rv:([^\)]+)\)/.test(ua)) { // edge 11版本
        engine.ver = browser.ver = RegExp['$1'];
        engine.ie = browser.ie = parseFloat(engine.ver);
    } else if (/Edge\/(\S+)/.test(ua)) { // edge 12或者更高版本
        engine.ver = browser.ver = RegExp['$1'];
        engine.ie = browser.ie = parseFloat(engine.ver);
    }

    //detect browsers
    browser.ie = engine.ie;
    browser.opera = engine.opera;

    //detect platform
    var p = navigator.platform;
    system.win = p.indexOf('Win') == 0;
    system.mac = p.indexOf('Mac') == 0;
    system.x11 = (p == 'X11') || (p.indexOf('Linux') == 0);

    //detect windows operating systems
    if (system.win) {
        if (/Win(?:dows )?([^do]{2})\s?(\d+\.\d+)?/.test(ua)) {
            if (RegExp['$1'] == 'NT') {
                switch(RegExp['$2']){
                case '5.0':
                    system.win = '2000';
                    break;
                case '5.1':
                    system.win = 'XP';
                    break;
                case '6.0':
                    system.win = 'Vista';
                    break;
                case '6.1':
                    system.win = '7';
                    break;
                default:
                    system.win = 'NT';
                    break;
                }
            } else if (RegExp['$1'] == '9x') {
                system.win = 'ME';
            } else {
                system.win = RegExp['$1'];
            }
        }
    }

    //mobile devices
    system.iphone = ua.indexOf('iPhone') > -1;
    system.ipod = ua.indexOf('iPod') > -1;
    system.ipad = ua.indexOf('iPad') > -1;
    system.nokiaN = ua.indexOf('NokiaN') > -1;

    //windows mobile
    if (system.win == 'CE') {
        system.winMobile = system.win;
    } else if (system.win == 'Ph') {
        if(/Windows Phone OS (\d+.\d+)/.test(ua)){;
            system.win = 'Phone';
            system.winMobile = parseFloat(RegExp['$1']);
        }
    }

    //determine iOS version
    if (system.mac && ua.indexOf('Mobile') > -1) {
        if (/CPU (?:iPhone )?OS (\d+_\d+)/.test(ua)) {
            system.ios = parseFloat(RegExp.$1.replace('_', '.'));
        } else {
            system.ios = 2;  //can't really detect - so guess
        }
    }

    //determine Android version
    if (/Android (\d+\.\d+)/.test(ua)) {
        system.android = parseFloat(RegExp.$1);
    }

    //gaming systems
    system.wii = ua.indexOf('Wii') > -1;
    system.ps = /playstation/i.test(ua);

    return {
        engine: engine,
        browser: browser,
        system: system
    };
};