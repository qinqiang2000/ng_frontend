import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Modal, Select } from 'antd';

export default function ChooseAccount(props) {
    const { visible, closeModal, handleChooseOk, accountList, defaultAccount } = props;
    const [value, setValue] = useState(defaultAccount.loginAccountUid);

    useEffect(() => {
        setValue(defaultAccount.loginAccountUid);
    }, [defaultAccount.loginAccountUid]);

    const handleChange = (val) => {
        setValue(val);
    };

    return (
        <Modal
            title='选择电子税局账号'
            visible={visible}
            onOk={() => handleChooseOk(value)}
            onCancel={closeModal}
        >
            <div>
                <Select style={{ width: '100%' }} onChange={handleChange} placeholder='请选择' value={value}>
                    {
                        accountList.map(item => (
                            <Select.Option value={item.loginAccountUid} key={item.loginAccountUid}>{item.name}</Select.Option>
                        ))
                    }
                </Select>
            </div>
        </Modal>
    );
}

ChooseAccount.propTypes = {
    accountList: PropTypes.array,
    visible: PropTypes.bool,
    closeModal: PropTypes.func,
    handleChooseOk: PropTypes.func,
    defaultAccount: PropTypes.object
};