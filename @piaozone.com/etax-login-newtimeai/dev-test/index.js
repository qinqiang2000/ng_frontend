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
            loginAccount={{
                needLogin: true, // 是否需要登录
                checkAuth: true // 是否身份认证
            }}
            needLoginType
            cityInfo={{ code: '440300', city: '深圳市' }}
        />
    </ConfigProvider>
), document.getElementById('root'));
