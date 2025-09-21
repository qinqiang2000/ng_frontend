
let pageDirName = '';

// 浏览器端
if (typeof window === 'object') {
    const initData = window.__INITIAL_STATE__ || {};
    pageDirName = initData.pageDirName || '';
}

module.exports = {
    PAGE_PRE_PATH: pageDirName + '/web',
    PUBLIC_PAGE_PRE_PATH: pageDirName,
    API_PRE_PATH: pageDirName + '/api'
};