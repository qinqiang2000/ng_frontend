'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.checkInvoiceTypeFull = checkInvoiceTypeFull;
var blockchain_filter = exports.blockchain_filter = function blockchain_filter(fpInfo) {
    var flag = false;
    var invoiceCode = fpInfo.invoiceCode,
        invoiceNo = fpInfo.invoiceNo;

    if (invoiceCode && invoiceNo) {
        if (invoiceCode.length == 12 && invoiceNo.length == 8) {
            var str5 = invoiceCode.substr(0, 5);
            var str9 = invoiceCode.substr(8, 1);
            if (str5 == '14403' && str9 == '9') {
                flag = true;
            }
        }
    }
    return flag;
};

var checkInvoiceType = exports.checkInvoiceType = function checkInvoiceType(fpdm, fphm) {
    if (fpdm) {
        fpdm += '';
    }
    if (fphm) {
        fphm += '';
    }

    var last3Str = fpdm.substr(fpdm.length - 3);
    var last2Str = fpdm.substr(fpdm.length - 2);
    var firstStr = fpdm.substr(0, 1);
    var sixthStr = fpdm.substr(5, 1);
    var eighthStr = fpdm.substr(7, 1);
    if (last3Str === '130' || last3Str === '140' || last3Str === '160' || last3Str === '170') {
        return 4;
    }

    if (fpdm.length == 12) {
        if (firstStr == '0' && last2Str == '12') {
            return 15;
        }

        if (firstStr === '0' && last2Str === '17') {
            return 13;
        }

        if (firstStr === '0' && (last2Str === '06' || last2Str === '07')) {
            return 5;
        }
        if (firstStr === '0' && last2Str === '13') {
            return 2;
        }
        if (sixthStr == '1' || sixthStr == '2') {
            if (eighthStr == '2') {
                return 12;
            }
        }
    }
    return 3;
};

function checkInvoiceTypeFull(fpdm, fphm) {
    if (fpdm) {
        fpdm += '';
    }

    if (fphm) {
        fphm += '';
    }

    if (!fphm || !fpdm) {
        return 5;
    }

    var fpdmLength = fpdm.length;

    if (fpdmLength == 12) {
        if (fpdm.length == 12 && fphm.length == 8) {
            if (fpdm.startsWith('14403') && '9' === fpdm.substr(8, 9)) {
                return 1;
            }
            if (fpdm.startsWith('0') && fpdm.endsWith('13')) {
                return 2;
            }
        }

        if (fpdm.startsWith('1') && fpdm.substr(7, 8).equals('2')) {
            return 12;
        }

        if (fpdm.endsWith('11') && fpdm.startsWith('0')) {
            return 1;
        }

        if (fpdm.endsWith('12') && fpdm.startsWith('0')) {
            return 15;
        }

        if (fpdm.endsWith('04') || fpdm.endsWith('05')) {
            return 3;
        }

        if (fpdm.endsWith('06') || fpdm.endsWith('07')) {
            return 5;
        }

        if (fpdm.endsWith('17') && fpdm.startsWith('0')) {
            return 13;
        } else {
            return 3;
        }
    } else if (fpdmLength == 10) {
        if (fpdm.endsWith('130') || fpdm.endsWith('140') || fpdm.endsWith('160') || fpdm.endsWith('170')) {
            return 4;
        } else {
            return 3;
        }
    } else {
        return 3;
    }
}