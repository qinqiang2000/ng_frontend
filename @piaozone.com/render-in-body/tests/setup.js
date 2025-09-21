import { JSDOM } from 'jsdom';

// fixed jsdom miss
if (typeof window !== 'undefined') {
    const documentHTML = '<!doctype html><html><body</body></html>';
    global.document = new JSDOM(documentHTML);
    global.window = document.parentWindow;
}

global.requestAnimationFrame = global.requestAnimationFrame || function (cb) {  // 处理兼容 添加 requestAnimationFrame 动画函数
    return setTimeout(cb, 0);
};

const Enzyme = require('enzyme');
const Adapter = require('enzyme-adapter-react-16');
Enzyme.configure({ adapter: new Adapter() });