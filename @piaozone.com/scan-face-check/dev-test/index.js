import React from 'react';
import ReactDOM from 'react-dom';
import { ConfigProvider, message } from 'antd';
import zhCN from 'antd/es/locale/zh_CN';

import MyCom from '../src';

message.config({
    top: 200,
    duration: 2,
    maxCount: 2
});

const contextConfig = {
    locale: zhCN
};

ReactDOM.render((
    <ConfigProvider {...contextConfig}>
        <MyCom
            taxNo='91310117MA1J3QDF97'
            API_PRE_PATH='/portalweb/api'
            longLinkName='f224ee3e03033b34479526066c47de165368720388'
            loginAccount={{
                loginAccountUid: '15019201099',
                city: '上海'
            }}
        />
    </ConfigProvider>
), document.getElementById('root'));
