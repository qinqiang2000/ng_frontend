/* eslint-disable max-len*/
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { handleUnLock, handleLock } from '../utils/tools';
import '../css/header.less';

const ChatHeader = ({ onClose, height }) => {
    const [fixed, setFixed] = useState(true);
    const toggleFixed = () => {
        const nextFixed = !fixed;
        setFixed(nextFixed);
        if (nextFixed) {
            handleLock();
        } else {
            handleUnLock();
        }
        if (nextFixed === true) {
            sessionStorage.setItem('customer-fixed-default', '1');
        } else {
            sessionStorage.setItem('customer-fixed-default', '2');
        }
    };

    return (
        <div
            className='smartHeader'
            style={{
                height
            }}
        >
            <div className='title'><span>发票云支持及售后产品助手</span></div>
            <div className='iconBtns'>
                <span
                    className={fixed ? 'fixedIcon fixed headerIcon' : 'fixedIcon headerIcon'}
                    onClick={toggleFixed}
                >
                    &nbsp;
                </span>
                <span className='closeIcon headerIcon' onClick={onClose}>&nbsp;</span>
            </div>
        </div>
    );
};

ChatHeader.propTypes = {
    onClose: PropTypes.func,
    height: PropTypes.number
};

export default ChatHeader;
