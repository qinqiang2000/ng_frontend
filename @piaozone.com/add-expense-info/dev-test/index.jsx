import React from 'react';
import ReactDOM from 'react-dom';
import AddExpenseInfo from '../src/';
import './style.css';

ReactDOM.render((
    <AddExpenseInfo
        width={1100}
        height={650}
        serialNos={[
            'd7d9e09069d445e3934e50ee301aa5430'
        ]}
        queryInvoiceUrl='/portal/bm/expense/invoice/common/query/for/standard?access_token=5cb973ba24cac034aa3821bf3cd5e2de'
        saveExpenseUrl='/portal/platform/inputinvoice/expense?access_token=5cb973ba24cac034aa3821bf3cd5e2de'
        expenseId='tttttt'
    />
), document.getElementById('root'));