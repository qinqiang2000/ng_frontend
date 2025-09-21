import moment from 'moment';
export const preCheckInvoice = function(invoiceData) {
    const { invoiceAmount = '', invoiceCode = '', invoiceNo = '', checkCode = '' } = invoiceData;
    let invoiceType = invoiceData.invoiceType || '';
    let invoiceDate = invoiceData.invoiceDate || '';
    invoiceType = parseInt(invoiceType);
        
    //可以查验的发票
    const addedTax = [
        1, //电子普通发票, jym
        3, //普通纸质发票 jym
        4, //专用纸质发票 je
        5, //普通纸质卷票  jym  
        12, //机动车发票 je
        13, //二手车发票 je
        15 //通行费 jym
    ];

    if (addedTax.indexOf(invoiceType) !== -1) {
        if ((invoiceAmount !== '' || checkCode !== '') && invoiceCode !== '' && invoiceNo !== '' && invoiceDate != '') {
            invoiceDate = moment(invoiceDate, 'YYYYmmDD').format('YYYY-mm-DD');
        }

        let tempKpje = parseFloat(invoiceAmount);

        if (invoiceAmount !== '' && !isNaN(tempKpje)) {
            tempKpje = tempKpje.toFixed(2);
        } else {
            tempKpje = '';
        }

        if (((invoiceType === 4 || invoiceType === 12 || invoiceType === 13) && tempKpje !== '') || checkCode !== '') {
            return {
                errcode: '0000',
                data: {
                    ...invoiceData,
                    invoiceCode,
                    invoiceNo,
                    invoiceDate: invoiceDate,
                    invoiceMoney: tempKpje,
                    checkCode
                }
            };
        } else {
            return {
                errcode: '3001',
                description: '必要参数为空，无法完成查验！'
            };
        }
    } else {
        return {
            errcode: 'notNeedCheck',
            description: '非增值税发票，无法进行查验'
        };
    }
};

