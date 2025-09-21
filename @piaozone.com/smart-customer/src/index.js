/* eslint-disable no-empty-function, no-console */
import React from 'react';
import ReactDOM from 'react-dom';
import SmartCustomerApp from './pages/chat';
import { loadCss } from './utils/tools';
import getAppAndModule from './utils/getAppAndModule';
import './css/index.css';
import { Provider } from 'react-redux';
import store from './store/index';
import { setAppAndModule } from './store/appAndModule';

class SmartCustomer {
    constructor(opt) {
        this.opt = opt || {};
        this.isLoadedCss = false;
    }

    initBox(info) {
        let boxEl = document.getElementById('smartCustomerBox');
        if (!boxEl) {
            boxEl = document.createElement('div');
            boxEl.id = 'smartCustomerBox';
            document.body.appendChild(boxEl);
            sessionStorage.setItem('smartCustomerAppInfo', JSON.stringify(info));
            ReactDOM.render(
                <Provider store={store}>
                    <SmartCustomerApp appInfo={info} />
                </Provider>,
                boxEl
            );
            return;
        }
        const newInfo = getAppAndModule();
        store.dispatch(setAppAndModule({
            ...newInfo,
            appText: info.appText,
            moduleText: info.moduleText
        }));
    }

    init(info) {
        if (this.isLoadedCss) {
            this.initBox(info);
        } else {
            // css需要先加载
            loadCss(this.opt.cssUrl, () => {
                this.isLoadedCss = true;
                this.initBox(info);
            });
        }
    }

    // 页面更新
    pageUpdate(model, props) {
        console.log('pageUpdate model props', model, props);
    }

    // 页面销毁
    closePageFreshMenu() {
        const newInfo = getAppAndModule();
        console.log('closePageFreshMenu newInfo', newInfo);
        store.dispatch(setAppAndModule(newInfo));
    }
}

let instance = null;
export default function getSmartCustomerInstance(opt = {}) {
    if (!instance) {
        instance = new SmartCustomer(opt);
    }
    return instance;
}