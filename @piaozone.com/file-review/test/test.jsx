import React, { useState } from 'react';
import FileReview from '../src/index';
//多页图
//https://api-sit.piaozone.com/doc/free/fileInfo/preview/nf1374409294676029440.pdf
const mutiFile ={
    extName: 'pdf',
    angle: {},
    // fileUrl: 'https://api-sit.piaozone.com/doc/free/fileInfo/preview/nf1349380311556116480.pdf',
    // fileUrl: 'https://api-sit.piaozone.com/doc/free/fileInfo/preview/nf1371857224118898688.pdf',
    // fileUrl: 'https://api-sit.piaozone.com/doc/free/fileInfo/preview/nf1374407548771823616.pdf',

    // fileUrl: 'https://api-sit.piaozone.com/doc/free/fileInfo/preview/nf1374409294676029440.pdf',
    fileUrl: 'https://api-sit.piaozone.com/doc/free/fileInfo/preview/nf1374763143142785024.pdf'
    // fileUrl: 'https://api-sit.piaozone.com/doc/free/fileInfo/preview/nf1372580464431034368.pdf',
    // fileUrl: 'https://api-sit.piaozone.com/doc/free/fileInfo/preview/nf1372582605577089024.pdf'



    //fileUrl: 'https://api-sit.piaozone.com/doc/free/fileInfo/preview/nf1372630223875305472.pdf'
    // fileUrl: 'https://api-sit.piaozone.com/doc/free/fileInfo/preview/nf1349102892804943872.pdf',
    // fileUrl: 'https://api-sit.piaozone.com/doc/free/fileInfo/preview/nf1348636153876688896.pdf',
    //fileUrl: 'https://api-sit.piaozone.com/doc/free/fileInfo/preview/nf1348632405297180672.pdf',

    // 8页
    //fileUrl: 'https://api-sit.piaozone.com/doc/free/fileInfo/preview/nf1304381335312363520.pdf',
    // fileUrl: 'https://api-sit.piaozone.com/doc/free/fileInfo/preview/nf1304381335207505920.pdf',
    //4页
    // fileUrl: 'https://api-sit.piaozone.com/doc/free/fileInfo/preview/nf1304381335241060352.pdf'
};

// 单张图片
const fileInfo1 = {
    extName: 'pdf',
    angle: {},
    //fileUrl: 'https://api-sit.piaozone.com/doc/free/fileInfo/preview/f12660873076631470088569210856.pdf',
    fileUrl: 'https://api-sit.piaozone.com/doc/free/fileInfo/preview/nf1348632405297180672.pdf',
    //fileUrl: 'https://api-sit.piaozone.com/doc/free/fileInfo/preview/nf1294674234238656512.pdf',
    //fileUrl: "https://api-sit.piaozone.com/doc/free/fileInfo/preview/nf1299699631726559232.pdf",
    //fileUrl: 'https://api-sit.piaozone.com/doc/free/fileInfo/preview/nf1301540297477750784.pdf', //win7
};

// 混贴
const fileInfo2 = {
    fileUrl: 'https://api-sit.piaozone.com/test/base/download/files/tenant-files/5368721074/3zwbu98zu9.jpg',
    extName: 'jpg',
    angle: {},
    isCutImage: true,
    inputInvoices: [{
        "canBeDeduction": 0,
        "ftenantNum": 1,
        "downloadUrl": "https://api-sit.piaozone.com/public/pdf/35cf0cc5b7d9f5f1b673a23fd099cde6",
        "errorNumberFlag": false,
        "invoiceAmount": "78.11",
        "payee": "",
        "salerTaxNo": "91442000MA55GMCA6B",
        "invoiceType": "1",
        "machineNo": "",
        "invoiceNo": "01124052",
        "isRepeat": true,
        "checkErrcode": "0000",
        "formType": "",
        "buyerTaxNo": "91440300MA5G9GK78Y",
        "originalState": "0",
        "companySeal": "1",
        "invoiceCode": "044002063111",
        "serialNo": "616c061948ae40c5b7642c2b08d7fe0c0",
        "checkCode": "990196",
        "totalAmount": "82.80",
        "salerAddressPhone": "中山市东区中山六路1号天奕国际广场四楼402.403卡 020-85528551",
        "taxAmount": "4.69",
        "totalAmountCn": "捌拾贰元捌角",
        "totalTaxAmount": "4.69",
        "region": "[0,0,2480,2829]",
        "invoiceCodeConfirm": "044002063111",
        "items": [
            {
                "unitPrice": "78.110000000000000000",
                "taxRate": "6%",
                "unit": "次",
                "num": "1.000000000000000000",
                "detailAmount": "78.11",
                "specModel": "",
                "goodsCode": "3070401000000000000",
                "taxAmount": "4.69",
                "goodsName": "*餐饮服务*餐饮服务"
            }
        ],
        "invoiceNoConfirm": "",
        "salerName": "广州大师兄餐饮管理连锁发展有限公司中山六路分公司",
        "checkDescription": "操作成功",
        "invoiceMoney": 78.11,
        "proxyMark": "",
        "localUrl": "https://api-sit.piaozone.com/test/base/download/files/tenant-files/5368721074/3zwbu98zu9.jpg",
        "checkStatus": "1",
        "formName": "",
        "electronicInvoice": true,
        "pixel": "2480,3532",
        "buyerAddressPhone": "",
        "salerAccount": "中信银行股份有限公司广州凤凰城支行 8110901013501240404",
        "amount": "78.11",
        "orientation": "0",
        "cancelMark": "N",
        "drawer": "",
        "checkCount": "",
        "reviewer": "",
        "invoiceDate": "20211031",
        "buyerName": "金蝶票据云科技（深圳）有限公司",
        "buyerAccount": "",
        "rotationAngle": "0",
        "snapshotUrl": "https://api-sit.piaozone.com/test/base/download/files/tenant-files/5368721074/3zwbu98zu9.jpg",
        "invoiceStatus": 0
    }]
};

// 文件
const fileInfo3 = {
    // fileUrl: 'https://api-sit.piaozone.com/test/base/download/files/tenant-files/5368720902/anubrot0bo.xls',
    // fileUrl: 'https://api.piaozone.com/base/download/pdf/invoice-pdf-storage-pro/SYNC/5368709152/2021-12-27/3621aa5f7805d0ec08b976fe44b6bb1dcf4dd813bbe61ca4516bd09769a46c9d.pdf',
    // fileUrl: 'https://api.piaozone.com/base/download/pdf/invoice-pdf-storage-pro/SYNC/5368724755/91500000077297236D/2022-07-14/tgpwtzq5vs.pdf',
    // fileUrl: 'https://api.piaozone.com/base/download/pdf/invoice-pdf-storage-pro/SYNC/5368709281/23298s23ks83js278sn3/2023-04-25/a9nqsqpicr.pdf',
    fileUrl: 'https://api-dev.piaozone.com/test/base/download/pdf/invoice-pdf-storage/SYNC/5368720902/914403006188392540/2023-09-05/09ratidj35.pdf',
    extName: 'pdf',
    angle: {}
};

export default function Test() {
    const [fileInfo, setFileInfo] = useState(mutiFile);

    const changeAngle = (angle, page) => {
        console.log('调整角度========', angle, page);
        setFileInfo({
            ...fileInfo,
            angle
        })
        console.log(angle, page);
    };

    const changeIndex = (type) => {
        console.log(type);
    };

    return (
        <div style={{ height: '890px', width: '1500px', marginLeft: '200px'}}>
            <FileReview
                { ...fileInfo }
                changeAngle={changeAngle}
                changeIndex={changeIndex}
                showChangePageBtn={false}
                reviewBoxWidth={1040}
                reviewBoxHeight={759}
                leftWidth={200}
                onReviewFileUrl={()=>{ console.log('获取调阅地址'); }}
                display='height'
            />
        </div>
    )
};
