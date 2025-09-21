import React from 'react';
import ReactDOM from 'react-dom';
import MyCom from '../src';
import './style.css';

ReactDOM.render((
    <MyCom className='myCom'
        attachment={window.pageData.attachment}
        cover={window.pageData.cover}
        electronicInvoice={window.pageData.electronicInvoice}
        paperInvoice={window.pageData.paperInvoice}
    />
), document.getElementById('root'));