import '@babel/polyfill';
import './utils/public_path';
import dva from 'dva';
import { createBrowserHistory as createHistory } from 'history';
import { message } from 'antd';
import router from './router';
import appInfo from './models/app';
import './media/less/base.less';
const ERROR_MSG_DURATION = 1.5; // 3 秒

message.config({
    top: 200,
    duration: ERROR_MSG_DURATION,
    maxCount: 2
});

// 1. Initialize
const app = dva({
    history: createHistory(),
    onError(e) {
        message.info(e.message, ERROR_MSG_DURATION);
    }
});

// 2. Plugins
app.use({});

app.model(appInfo);

// 4. Router
app.router(router);
// 5. Start
app.start('#root');

if (module.hot) {
    module.hot.accept();
}
