import React from 'react';
import PropTypes from 'prop-types';
import { Select } from 'antd';

import { ROLES } from '../../constants';

const { Option } = Select;
export default function Roles(props) {
    return (
        <Select
            className={props.className}
            value={props.currentRole}
            onChange={props.onChangeRole}
            placeholder='请选择'
            size={props.size || 'default'}
        >
            {ROLES.map((item) => <Option key={item.value} value={item.value}>{item.value}</Option>)}
        </Select>
    );
}

Roles.propTypes = {
    className: PropTypes.string,
    size: PropTypes.oneOf(['small', 'default', 'large']),
    currentRole: PropTypes.string.isRequired,
    onChangeRole: PropTypes.func.isRequired
};
