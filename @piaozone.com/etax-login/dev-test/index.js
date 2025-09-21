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
            taxNo='91441900MA53JJ2740'
            API_PRE_PATH='/portalweb/api'
            client_type={3}
            longLinkName='f224ee3e03033b34479526066c47de165368720388'
            // hideSuccessModal={true}
        />
    </ConfigProvider>
), document.getElementById('root'));
