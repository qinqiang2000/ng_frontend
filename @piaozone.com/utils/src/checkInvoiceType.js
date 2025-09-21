export const blockchain_filter = function(fpInfo){//区块链点击发票区分
    let flag = false;
    const { invoiceCode, invoiceNo } = fpInfo;
    if (invoiceCode && invoiceNo){
        if (invoiceCode.length == 12 && invoiceNo.length == 8) {
            const str5 = invoiceCode.substr(0, 5);
            const str9 = invoiceCode.substr(8, 1);
            if (str5 == '14403' && str9 == '9') {
                flag = true;
            }
        }
    }
    return flag
}

//根据发票代码判断专票或普票
export const checkInvoiceType = function(fpdm, fphm) {
    if (fpdm) {
        fpdm +='';
    }
    if (fphm) {
        fphm +='';
    }
    if (!fpdm && fphm.length == 20) {
        return 26;
    }
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
    return 3
}


export function checkInvoiceTypeFull(fpdm, fphm) {
    if (fpdm) {
        fpdm +='';
    }

    if (fphm) {
        fphm +='';
    }

    if (!fphm || !fpdm) {
        return 5; // 普通纸质卷票
    }

    const fpdmLength = fpdm.length;

    //长度为12位的都是
    if (fpdmLength == 12) {
        //如果是区块链发票 区块链发票五要素查验 区块链发票暂时定为1--电子发票类型
        if (fpdm.length == 12 && fphm.length == 8) {
            //发票代码12位  发票号码8位
            if (fpdm.startsWith('14403') && '9' === fpdm.substr(8, 9)) {
                return 1;
            }
            if (fpdm.startsWith('0') && fpdm.endsWith('13')) {
                return 2; //电专票
            }
        }

        if (fpdm.startsWith('1') && fpdm.substr(7, 8).equals('2')) {
            return 12; // 机动车
        }

        if (fpdm.endsWith('11') && fpdm.startsWith('0')) {
            return 1; // 普通电子发票
        }

        if (fpdm.endsWith('12') && fpdm.startsWith('0')) {
            return 15; // 通行费
        }

        if (fpdm.endsWith('04') || fpdm.endsWith('05')) {
            return 3; // 普通纸质发票
        }

        if (fpdm.endsWith('06') || fpdm.endsWith('07')) {
            return 5; // 普通纸质卷票
        }

        if (fpdm.endsWith('17') && fpdm.startsWith('0')) {
            return 13; // 二手车
        } else {
            return 3; // 普票
        }
    } else if (fpdmLength == 10) {
        if (fpdm.endsWith('130') || fpdm.endsWith('140') || fpdm.endsWith('160') || fpdm.endsWith('170')) {
            return 4; // 纸质专用发票
        } else {
            return 3; // 普票
        }
    } else {
        return 3;
    }
}