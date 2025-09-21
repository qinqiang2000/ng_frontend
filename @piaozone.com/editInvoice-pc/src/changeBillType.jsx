
import React from 'react';
import { Select } from 'antd';
import PropTypes from 'prop-types';
import { invoiceTypes } from '@piaozone.com/pwyConstants';
const Option = Select.Option;

function ChangeBillType({ onChangeBillType, billType, disabled }) {
    return (
        <Select value={billType} style={{ width: 190 }} onChange={(v) => { onChangeBillType(v); }} disabled={disabled}>
            {
                invoiceTypes.INPUT_INVOICE_TYPES.map((item) => {
                    return (
                        <Option value={item.value} key={item.value}>{item.text}</Option>
                    );
                })
            }
        </Select>
    );
}


ChangeBillType.propTypes = {
    disabled: PropTypes.bool,
    billType: PropTypes.number.isRequired,
    onChangeBillType: PropTypes.func.isRequired
};

export default ChangeBillType;