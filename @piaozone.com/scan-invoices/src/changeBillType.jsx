
import React from 'react';
import { Select } from 'antd';
import PropTypes from 'prop-types';
import { invoiceTypes } from '@piaozone.com/pwyConstants';
const Option = Select.Option;

const inputFullInvoiceTypes = invoiceTypes.INPUT_INVOICE_TYPES;

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

ChangeBillType.propTypes = {
    onChangeBillType: PropTypes.func.isRequired,
    billType: PropTypes.number.isRequired,
    disabled: PropTypes.bool.isRequired,
    index: PropTypes.number
};

export default ChangeBillType;