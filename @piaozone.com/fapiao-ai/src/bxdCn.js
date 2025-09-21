/* eslint-disable no-empty-function, no-console */
import React from 'react';
import ReactDOM from 'react-dom';
import BxdCn from './pages/bxdCn';

class AiBxd {
    constructor(opt) {
        this.opt = opt || {};
    }

    init(props) {
        const boxEl = document.getElementById('root');
        const {
            config,
            expenseData,
            invoiceData,
            paymentData
        } = props;
        ReactDOM.render(
            <BxdCn
                config={config}
                expenseData={expenseData}
                invoiceData={invoiceData}
                paymentData={paymentData}
            />,
            boxEl
        );
    }
}

let instance = null;
export default function getAiBxd(opt = {}) {
    if (!instance) {
        instance = new AiBxd(opt);
    }
    return instance;
}