import React from 'react';
import { Select } from 'antd';
import * as invoiceInfoTypes from '../../constants';

const Option = Select.Option;
const inputFullInvoiceTypes = invoiceInfoTypes.default.inputFullInvoiceTypes;

// inputFullInvoiceTypes = inputFullInvoiceTypes.filter((item) => {
//     return [1, 3, 4, 5, 12, 13, 15].indexOf(parseInt(item.value)) === -1;
// });

function ChangeBillType({ onChangeBillType, billType, disabled, index }) {
    return (
        <Select value={billType} style={{ width: '100%' }} onChange={(v) => { onChangeBillType(v, index); }} disabled={disabled}>
            {
                inputFullInvoiceTypes.map((item) => {
                    return (
                        <Option value={item.value} key={item.value}>{item.text}</Option>
                    );
                })
            }
        </Select>
    );
}

export default ChangeBillType;