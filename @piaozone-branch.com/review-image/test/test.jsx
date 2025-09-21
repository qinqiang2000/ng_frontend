import React, { useState } from 'react';
import data from './data2.json';
import ReviewImage from '../src/index';

export default function Test() {
    const [visible, setVisible] = useState(true);

    const modeConfig = [
        {
            name: '封面', // 小标题
            key: 'cover', // 对应字段名
            sign: 'cover' // 标识
        },
        {
            name: '发票',
            key: 'invoice',
            sign: 'invoice'
        },
        {
            name: '附件',
            key: 'attachment',
            sign: 'attachment'
        }
    ];

    // 处理混贴，关联文件
    const handleData = (invoice, attachment) => {
        let dataInfo = {};
        let otherList = [];
        invoice.forEach(item => {
            const { filehash = '', attachSerialNoList = [] } = item;
            let newAttachList = [];
            if (attachSerialNoList.length) {
                newAttachList = attachSerialNoList.map(i => {
                    return attachment.find(o => o.serialNo === i);
                })
            }
            if (filehash) {
                if (!dataInfo[filehash]) {
                    dataInfo[filehash] = {
                        ...item,			
                        inputInvoices: [],
                        attachSerialNoList: newAttachList
                    }
                }
                dataInfo[filehash].inputInvoices.push({ ...item, attachSerialNoList: newAttachList });
            } else {
                otherList = [...otherList, { ...item, attachSerialNoList: newAttachList }];
            }
        });
        const list = Object.values(dataInfo);
        return [...list, ...otherList].map(item => ({
            ...item,
            inputInvoices: item?.inputInvoices?.length > 1 ? item.inputInvoices : [],
            signType: 'invoice'
        }));
    }

    const dataList = {
        fscanBillNos: data.expenseNumber,
        totalAmount: data.totalAmount, // 价税总计
        invoiceCount: data.invoiceCount,
        attachmentCount: data.attachmentCount,
        totalTaxAmount: data.totalTaxAmount, // 税额总计
        invoice: handleData(data.data.invoice, data.data.attachment),
        cover: data.data.cover.map(item => ({ ...item, signType: 'cover' })),
        attachment: data.data.attachment.map(item => ({ ...item, signType: 'attachment' }))
    };
    
    const modeKey = ['img', 'list'];

    const changeVisible = (value) => {
        setVisible(value);
    };

    const rotationAngleSet = (angle, page) => {
        console.log(angle, page, '===========================');
    };

    const handleSelectedInfo = (info) => {
        console.log(info, 'info');
    };

    const showOriginFile = (selected) => {
        console.log(selected, 'selected');
    };

    return (
        <ReviewImage
            modeConfig={modeConfig}
            dataList={[dataList]}
            modeKey={modeKey}
            visible={visible}
            changeVisible={changeVisible}
            setPageRotate={rotationAngleSet}
            handleSelectedInfo={handleSelectedInfo}
            showOriginFile={showOriginFile}
            isShowStatistics={false}
            leftWidth={264}
            topHeight={50}
            display='height'
            showCutImage={false}
        />
    )
};
