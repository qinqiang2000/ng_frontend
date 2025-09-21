import React from 'react';
import ReactDOM from 'react-dom';
import MyCom from '../src';
import './style.css';

const list = [1, 2, 3, 4, 5, 6];
let billData = {
    "salerName": "加格达奇区欣宜宾馆",
    "invoiceMoney": "751.46",
    "proxyMark": "",
    "downloadUrl": "https://api.kingdee.com/kdrive/user/file/thumbnail?client_id=200242&file_id=128863442&quality=100&scode=TE5zQVhQY01BNjBkN29uRjIvYzRO&sign=8dcf872d82f5e379638deb33a65ea56cf0de4707&width=800",
    "payee": "",
    "salerTaxNo": "92232741MA19M9KF16",
    "invoiceType": "3",
    "machineNo": "929907103545",
    "invoiceNo": "37748688",
    "isRepeat": false,
    "buyerAddressPhone": "深圳市南山区高新技术产业园区科技南十二路迈瑞大厦1-4层0755-26582888",
    "salerAccount": "龙江银行股份有限公司大兴安岭分行27030120002000459",
    "amount": "751.46",
    "buyerTaxNo": "914403007084678371",
    "cancelMark": "N",
    "drawer": "",
    "checkCount": "",
    "reviewer": "",
    "invoiceDate": "20190620",
    "buyerName": "深圳迈瑞生物医疗电子股份有限公司",
    "invoiceCode": "023001800104",
    "serialNo": "cf38d93e018d4d8f8885d1a13a3020530",
    "checkCode": "258239",
    "totalAmount": "774.00",
    "salerAddressPhone": "加格达奇区交运小区2号楼2113666",
    "buyerAccount": "中国银行深圳分行招商路支行777057935773",
    "snapshotUrl": "https://api.kingdee.com/kdrive/user/file/thumbnail?client_id=200242&file_id=128863442&quality=100&scode=TE5zQVhQY01BNjBkN29uRjIvYzRO&sign=8dcf872d82f5e379638deb33a65ea56cf0de4707&width=800",
    "taxAmount": "22.54",
    "totalAmountCn": "柒佰柒拾肆元整",
    "errcode": "0000",
    "description": "操作成功",
    "localUrl": "https://api.kingdee.com/kdrive/user/file/public?client_id=200242&file_id=128863442&scode=dmtxPXRhb3F1eFdqbl9qYl95bUNV&sign=ef2b520890e3ee92ce13d4eb4895c634988d6489",
    "ofdUrl": "",
    "orientation": 0,
    "region": "[0,0,4032,3024]",
    "pixel": "4032,3024",
    "cyjg": "1",
    "fid": "cf38d93e018d4d8f8885d1a13a3020530",
    "recognitionSerialNo": "cf38d93e018d4d8f8885d1a13a3020530",
    "formName": "",
    "companySeal": "1",
    "warningCode": "1",
    "fpdm": "023001800104",
    "fphm": "37748688",
    "ghf_tin": "914403007084678371",
    "kprq": "20190620",
    "xhf_mc": "加格达奇区欣宜宾馆",
    "ghf_mc": "深圳迈瑞生物医疗电子股份有限公司",
    "bx": 60,
    "isRevise": 1,
    "jshjje": 774.00,
    "fplx": 3,
    "snapshoturl": "https://api.kingdee.com/kdrive/user/file/thumbnail?client_id=200242&file_id=128863442&quality=100&scode=TE5zQVhQY01BNjBkN29uRjIvYzRO&sign=8dcf872d82f5e379638deb33a65ea56cf0de4707&width=800",
    "se": "22.54",
    "totalTaxAmount": "22.54",
    "inputStatus": "1",
    "isExist": true,
    "errorLevel": "0",
    "verifyResult": [{
        "key": "verifyBuyerName",
        "name": "错误原因：发票抬头与企业名称不一致，禁止导入",
        "config": "3",
        "result": "1",
        "msg": "发票抬头深圳迈瑞生物医疗电子股份有限公司与企业名称环球机器人技术有限公司不一致",
        "extFields": ["深圳迈瑞生物医疗电子股份有限公司",
        "环球机器人技术有限公司"]
    },
    {
        "key": "verifyBuyerTaxNo",
        "name": "错误原因：发票税号与企业税号不一致，禁止导入",
        "config": "3",
        "result": "1",
        "msg": "发票税号914403007084678371与企业税号440301999999980不一致",
        "extFields": ["914403007084678371",
        "440301999999980"]
    }],
    "invoiceStatus": "0",
    "invoiceAmount": "751.46",
    "spbm": "3070402000000000000",
    "taxRate": "0.030000",
    "verifySign": false,
    "attachCount": 0,
    "attachSerialNoList": []
};

// billData = {"salesUnitCode":"XMN042,08673111","destination":"杭州","fileHash":"0","invoiceAmount":"1410.00","localUrl":"https://api.kingdee.com/kdrive/user/file/public?client_id=200242&file_id=196956649&scode=N1plRGRXTHF4WHdkdTNSZFVncWl4&sign=17b29db2f026fab16c5087bee0667fa9956c618f","electronicTicketNum":"7312432755974","flightNum":"MF8382","placeOfDeparture":"T2广州","deductionStatus":1,"airportConstructionFee":"50.00","invoiceType":"10","issueDate":"20201011","isRepeat":true,"pixel":"1500,2000","airTime":"13:50","insurancePremium":0,"orientation":"270","batchNo":"d44a931b47fb4c2ca5e292dfc7a8ea4e9","printNum":"13423754713","warningCode":"1","otherTotalTaxAmount":"0.00","invoiceDate":"2020-10-11","customerName":"杨盛","checkCode":"5471","serialNo":"488da76c841e45dd8382b48c43716a680","fillingUnit":"厦门航空有限公司广州营业部柜台","totalAmount":"1460.00","taxRate":0.09,"seatGrade":"Y","carrier":"厦航","customerIdentityNum":"360781199009272010","snapshotUrl":"https://api.kingdee.com/kdrive/user/file/thumbnail?client_id=200242&file_id=196956649&quality=100&scode=LVhNNz1xOGtmV2twdVpJLVFFOGE3&sign=f5e48e22021d798bb3703cc20a2b6b5b24546d4a&width=800","imageSerialNo":"04279e4a881848eab382fb8260448a580","printingSequenceNo":"13423754713","recognitionSerialNo":"488da76c841e45dd8382b48c43716a680","fuelSurcharge":"0.00","totalTaxAmount":116.42,"taxAmount":116.42,"region":"[0,0,1500,2000]","items":[{"flightNum":"MF8382","placeOfDeparture":"T2广州","seatGrade":"Y","carrier":"厦航","destination":"杭州","takePlaneTime":"13:50","invoiceDate":"2020-10-11"}],"fileType":2,"fid":"488da76c841e45dd8382b48c43716a680","bx":1,"isRevise":1,"isExist":true,"cyjg":"3","errorLevel":"0","verifyResult":[{"key":"change","name":"错误原因：手工修改，禁止导入","config":"3","result":"1","msg":"存在手工修改记录"}],"attachCount":0,"attachSerialNoList":[]};
// billData = {"salerName":"深圳市君胜百货有限公司","fileHash":"0","localUrl":"https://api.kingdee.com/kdrive/user/file/public?client_id=200242&file_id=196959040&scode=UUxtLWJwZEZ0TC94VGlUeFRKQ3lv&sign=22b355cad52c498a8e6be36a76adab107747cd63","province":"广东省","deductionStatus":1,"salerTaxNo":"440300791740506","invoiceType":"7","place":"深圳市","invoiceNo":"12733914","isRepeat":true,"pixel":"854,640","orientation":"0","batchNo":"dba8255ae1f1416a99adfde741d4323a3","buyerTaxNo":"914403006188392540","warningCode":"2","companySeal":"1","invoiceDate":"2017-09-02","buyerName":"金蝶软件(中国)有限公司","invoiceCode":"144031600124","checkCode":"84525620566140328156","serialNo":"7a49cff24ea243ec91c1c1d9899485810","totalAmount":"490.00","snapshotUrl":"https://api.kingdee.com/kdrive/user/file/thumbnail?client_id=200242&file_id=196959040&quality=100&scode=WTdiZmovai1FcC9KaW1jaDE5VHE0&sign=56ee0c0fc646ca15f264506b03688cea951bd7df&width=800","imageSerialNo":"f3bfeb49239f4a02a014eb1eab97d95c0","recognitionSerialNo":"7a49cff24ea243ec91c1c1d9899485810","region":"[0,0,854,640]","fileType":2,"fid":"7a49cff24ea243ec91c1c1d9899485810","bx":30,"isRevise":1,"isExist":true,"cyjg":"3","errorLevel":"0","verifyResult":[{"key":"repeat","name":"错误原因：被其他单据在用或已用，禁止导入","config":"3","result":"1","msg":"已被er_dailyreimbursebill_833170369408990208,er_dailyreimbursebill_860818381324948480,er_dailyreimbursebill_860820048384626688,er_dailyreimbursebill_860780168908660736,er_dailyreimbursebill_860820603895046144,er_dailyreimbursebill_860829454463691776,FYBX-2020-04-29-00025,BX-2007-0180,BX-2007-0192,FYBX-2020-07-31-00012,FYBX-2020-08-03-00001,FYBX-2020-08-03-00005,BX-2008-0753,FYBX-2020-08-21-00003,FYBX-20200910-0011,FYBX-20200928-0053,FY202010SZRY0000055,C2020111900006,C2020112400003,C2020112500035,C2020120100061,C2020120800039,FYBX-2020-12-09-00084,FYBX-2020-12-12-00158,FYBX-2020-12-12-00159,FYBX-2020-12-15-00231,FYBX-2020-12-16-00258,FYBX-2020-12-24-00477,FYBX-Z001-0054,FYBX-Z001-0057,FYBX-Z001-0058,H000.001-20210108-00000086,H000.001-20210108-00000088,H000.001-20210108-00000090,H000.001-20210108-00000092,H000.001-20210108-00000094,H000.001-20210111-00000100,DGBX-210112-1196,KDC-02-20210127-00010,FYBX-20210129-00040,KDC-02-20210225-00003,KDC-02-20210225-00010,KDC-02-20210305-00042,KDC-02-20210312-00001,KDC-02-20210324-00005,KDC-02-20210324-00007,KDC-02-20210325-00004,KDC-02-20210325-00005单据报销","extFields":["er_dailyreimbursebill_833170369408990208,er_dailyreimbursebill_860818381324948480,er_dailyreimbursebill_860820048384626688,er_dailyreimbursebill_860780168908660736,er_dailyreimbursebill_860820603895046144,er_dailyreimbursebill_860829454463691776,FYBX-2020-04-29-00025,BX-2007-0180,BX-2007-0192,FYBX-2020-07-31-00012,FYBX-2020-08-03-00001,FYBX-2020-08-03-00005,BX-2008-0753,FYBX-2020-08-21-00003,FYBX-20200910-0011,FYBX-20200928-0053,FY202010SZRY0000055,C2020111900006,C2020112400003,C2020112500035,C2020120100061,C2020120800039,FYBX-2020-12-09-00084,FYBX-2020-12-12-00158,FYBX-2020-12-12-00159,FYBX-2020-12-15-00231,FYBX-2020-12-16-00258,FYBX-2020-12-24-00477,FYBX-Z001-0054,FYBX-Z001-0057,FYBX-Z001-0058,H000.001-20210108-00000086,H000.001-20210108-00000088,H000.001-20210108-00000090,H000.001-20210108-00000092,H000.001-20210108-00000094,H000.001-20210111-00000100,DGBX-210112-1196,KDC-02-20210127-00010,FYBX-20210129-00040,KDC-02-20210225-00003,KDC-02-20210225-00010,KDC-02-20210305-00042,KDC-02-20210312-00001,KDC-02-20210324-00005,KDC-02-20210324-00007,KDC-02-20210325-00004,KDC-02-20210325-00005"]},{"key":"change","name":"错误原因：手工修改，禁止导入","config":"3","result":"1","msg":"存在手工修改记录"}],"attachCount":0,"attachSerialNoList":[]};

ReactDOM.render((
    <MyCom
        billData={billData}
        height={document.body.clientHeight}
        width={document.body.clientWidth}
        disabledEdit={false}
    />
), document.getElementById('root'));