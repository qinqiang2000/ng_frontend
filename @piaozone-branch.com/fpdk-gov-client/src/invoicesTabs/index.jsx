import React from 'react';
import PropTypes from 'prop-types';
import './invoiceTabs.css';

export default function InvoicesTabs({
    tabInfo,
    onChange,
    activeInvoiceType,
    INPUT_INVOICE_TYPES,
    allowDkFlag,
    configInvoice,
    loading
}) {
    const tabs = [];
    for (let i = 0; i < INPUT_INVOICE_TYPES.length; i++) {
        const curType = INPUT_INVOICE_TYPES[i];
        const k = 'k' + curType.value;
        if (allowDkFlag === true) {
            if (curType.allowDeduction !== 1) {
                continue;
            }
        }

        if (tabInfo[k]) {
            tabs.push({
                key: k,
                invoiceType: curType.value,
                invoiceTypeText: curType.text,
                num: tabInfo[k].num,
                controlLevel: tabInfo[k].controlLevel || 1
            });
        }
    }

    if (tabs.length === 0) {
        return null;
    } else {
        return (
            <div className='invoiceTabs'>
                {
                    tabs.map(item => {
                        return (
                            <a
                                key={item.key}
                                className={
                                    activeInvoiceType === item.key ? 'active tabItem' : loading ? 'tabItemLoading tabItem' : 'tabItem'
                                }
                                onClick={() => loading ? {} : onChange(item)}
                            >
                                <span className='tab'>{item.invoiceTypeText}</span>
                                {
                                    configInvoice ? (
                                        item.controlLevel == '0' || item.controlLevel == '2' ? (
                                            <span className={item.controlLevel == '0' ? 'num' : 'yellow'}>!</span>
                                        ) : null
                                    ) : (
                                        item.num && item.num > 0 ? (
                                            <span className='num'>{item.num}</span>
                                        ) : null
                                    )
                                }
                                
                            </a>
                        );
                    })
                }
            </div>
        );
    }
}

InvoicesTabs.propTypes = {
    tabInfo: PropTypes.array,
    onChange: PropTypes.func.isRequired,
    activeInvoiceType: PropTypes.string,
    allowDkFlag: PropTypes.bool,
    INPUT_INVOICE_TYPES: PropTypes.array.isRequired,
    configInvoice: PropTypes.bool,
    loading: PropTypes.bool
};