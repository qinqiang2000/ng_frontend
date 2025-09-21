import React from 'react';
import ReactDOM from 'react-dom';
import PreSelect from '../src';
import '../src/commons/base.less';
ReactDOM.render((
    <PreSelect
        dkgxSearchUrl={'/portal/bm/ocr/invoice/account/query'} //查询接口
    />
), document.getElementById('root'));