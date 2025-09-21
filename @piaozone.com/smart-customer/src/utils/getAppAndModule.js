export default function getAppAndModule(useCache) {
    let moduleEl = null;
    // 默认新版
    let version = 'v2';
    let appEl = document.querySelector('#homepagetabap .kd-cq-homepage-tab-item-active');
    if (appEl) {
        version = 'v1';
        moduleEl = document.querySelector('#tabap .kd-cq-tab-panel .kd-cq-tabs-tab .tab-active');
    } else {
        appEl = document.querySelector('#homepagetabap .kd-dropdown-trigger');
        moduleEl = document.querySelector('#homepagetabap .kd-cq-tabs li[data-active="true"]');
    }
    const cacheInfo = sessionStorage.getItem('smartCustomerAppInfo');
    let appText = '';
    let moduleText = '';
    if (useCache && cacheInfo) {
        const cacheInfoObj = JSON.parse(cacheInfo);
        appText = cacheInfoObj.appText;
        moduleText = cacheInfoObj.moduleText;
    } else {
        if (appEl) {
            appText = appEl.innerText;
        }
        if (moduleEl) {
            moduleText = moduleEl.innerText;
        }
        if (!moduleText) {
            moduleText = appText;
        }
    }

    return {
        version,
        appText,
        moduleText
    };
}