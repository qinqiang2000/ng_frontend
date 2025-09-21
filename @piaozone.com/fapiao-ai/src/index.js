/* eslint-disable no-empty-function, no-console */
import React from 'react';
import ReactDOM from 'react-dom';
import FapiaoAiPage from './pages/index';
import { loadCss } from './utils/tools';
import { Provider } from 'react-redux';
import store from './store/index';

class FapiaoAi {
    constructor(opt) {
        this.opt = opt || {};
        this.isLoadedCss = false;
    }

    initBox() {
        const boxEl = document.getElementById('root');
        ReactDOM.render(
            <Provider store={store}>
                <FapiaoAiPage />
            </Provider>,
            boxEl
        );
    }

    init(info) {
        if (this.isLoadedCss || !this.opt.cssUrl) {
            this.initBox(info);
        } else {
            // css需要先加载
            loadCss(this.opt.cssUrl, () => {
                this.isLoadedCss = true;
                this.initBox(info);
            });
        }
    }
}

let instance = null;
export default function getFapiaoAi(opt = {}) {
    if (!instance) {
        instance = new FapiaoAi(opt);
    }
    return instance;
}