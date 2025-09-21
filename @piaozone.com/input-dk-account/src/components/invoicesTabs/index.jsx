import React from 'react';
import './invoicesTabs.less';
import { invoiceTypes } from '@piaozone.com/pwyConstants';
const INPUT_INVOICE_TYPES_DICT = invoiceTypes.INPUT_INVOICE_TYPES_DICT;

export default function InvoicesTabs({
    tabsList = [],
    onChange,
    activeInvoiceType
}) {
    const noShowInvoiceType = [28, 29]; // 需要暂时屏蔽的发票类型
    const tabs = tabsList.filter(item => !noShowInvoiceType.includes(item.invoiceType)).map((curType) => {
        const type = curType.invoiceType;
        return {
            key: type,
            invoiceType: type,
            invoiceTypeText: INPUT_INVOICE_TYPES_DICT['k' + type] ? INPUT_INVOICE_TYPES_DICT['k' + type].text : curType.invoiceTypeString,
            num: curType.totalCount
        };
    });
    if (tabs.length === 0) {
        return null;
    } else {
        return (
            <div className='newInvoiceTabs'>
                {
                    tabs.map(item => {
                        return (
                            <a
                                key={item.key}
                                className={
                                    activeInvoiceType === item.key ? 'active tabItem' : 'tabItem'
                                }
                                onClick={() => onChange(item)}
                            >
                                <span className='tab'>{item.invoiceTypeText}</span>
                                {
                                    item.num && item.num > 0 ? (
                                        <span className='num'>{item.num}</span>
                                    ) : null
                                }
                            </a>
                        );
                    })
                }
            </div>
        );
    }
}
