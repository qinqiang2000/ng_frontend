import React from 'react';
import ReactDOM from 'react-dom';
import ClientCompanyInfo from '../src';
import '../src/common/style.less';
ReactDOM.render((
    <ClientCompanyInfo
        queryCompanyAuthor={'/portal/platform/organization/company/cur-user-admin'} //查询接口
    />
), document.getElementById('root'));