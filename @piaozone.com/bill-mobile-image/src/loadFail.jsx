import React from 'react';
const loadfail = require('./media/img/loadfail.png');
export default function LoadFail() {
    return (
        <div className='loadFail' style={{ marginTop: 0 }}>
            <img src={loadfail} alt='' style={{ width: 108, height: 72 }} />
            <span style={{ padding: '20px 0' }}>暂无相关发票和附件</span>
        </div>
    );
}