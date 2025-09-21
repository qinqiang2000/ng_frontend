import React from 'react';
import ReactDOM from 'react-dom';
import MyCom from '../src';
import './style.css';
import { pwyFetch } from '@piaozone.com/utils';

async function checkInvocies(opt) {
    const res = await pwyFetch('/portal/bm/ocr/check/invoice/data', {
        method: 'post',
        data: opt
    });
}


ReactDOM.render((
    <MyCom
        style={{ width: 600, margin: '0 auto' }}
        onCheckInvoice={checkInvocies}
    />

), document.getElementById('root'));