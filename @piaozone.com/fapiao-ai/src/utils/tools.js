

export function sleep(time = 500) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve();
        }, time);
    });
}

// 自定义 requestAnimationFrame
export const myRequestAnimationFrame = (function myRequestAnimationFrame() {
    return (
        window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        function fCallback(callback) {
            return window.setTimeout(() => callback(performance.now()), 16);
        }
    );
})();

// 自定义 cancelAnimationFrame
export const myCancelAnimationFrame = (function myCancelAnimationFrame() {
    return (
        window.cancelAnimationFrame ||
        window.webkitCancelAnimationFrame ||
        window.mozCancelAnimationFrame ||
        function fHandle(handle) {
            clearTimeout(handle);
        }
    );
})();

export function wait(boxId, opt) {
    return new Promise((resolve) => {
        const startTime = Date.now();
        let animationFrameId;
        const check = () => {
            const el = document.getElementById(boxId);
            if (el) {
                myCancelAnimationFrame(animationFrameId);
                resolve(el);
            } else if (Date.now() - startTime >= opt.maxTime) {
                myCancelAnimationFrame(animationFrameId);
                resolve(null);
            } else {
                animationFrameId = myRequestAnimationFrame(check);
            }
        };
        animationFrameId = myRequestAnimationFrame(check);
    });
}

export function checkWait(check, maxTime = 30000) {
    return new Promise((resolve) => {
        const startTime = Date.now();
        let animationFrameId;
        const fixCheck = () => {
            const checkRes = check();
            if (checkRes.stopFlag) {
                myCancelAnimationFrame(animationFrameId);
                resolve(checkRes);
            } else if (Date.now() - startTime >= maxTime) {
                myCancelAnimationFrame(animationFrameId);
                resolve(checkRes);
            } else {
                animationFrameId = myRequestAnimationFrame(fixCheck);
            }
        };
        animationFrameId = myRequestAnimationFrame(fixCheck);
    });
}


export function registerHotkey(keys, callback) {
    const pressed = new Set();
    const normalizeKey = (key) => key.toLowerCase();
    function onKeyDown(event) {
        pressed.add(normalizeKey(event.key));

        const allMatched = keys.every((key) => {
            if (key === 'ctrl') {
                return event.ctrlKey;
            }
            if (key === 'shift') {
                return event.shiftKey;
            }
            if (key === 'alt') {
                return event.altKey;
            }
            if (key === 'meta') {
                return event.metaKey;
            }
            return pressed.has(normalizeKey(key));
        });

        if (allMatched) {
            callback();
            pressed.clear(); // 防止持续触发
        }
    }

    function onKeyUp(event) {
        pressed.delete(normalizeKey(event.key));
    }

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    // 返回一个卸载函数
    return () => {
        window.removeEventListener('keydown', onKeyDown);
        window.removeEventListener('keyup', onKeyUp);
    };
}

export function loadCss(url, callback) {
    if (!url) {
        console.error('CSS URL is required');
        return;
    }

    // 检查是否已经加载过相同的 CSS
    const existingLink = [...document.getElementsByTagName('link')].find(
        (link) => link.href === url
    );
    if (existingLink) {
        if (callback) {
            callback();
        }
        return;
    }

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = url;
    link.type = 'text/css';
    link.onload = () => {
        if (callback) {
            callback();
        }
    };
    link.onerror = () => {
        console.error(`Failed to load CSS: ${url}`);
    };
    document.head.appendChild(link);
}

export function handleUnLock() {
    const tabap = document.getElementById('tabap');
    const application = document.getElementsByClassName(
        'kd-cq-application-center'
    );
    const kdesignerRoot = document.getElementsByClassName(
        'kdesigner-kdesigner-root'
    );
    if (kdesignerRoot.length > 0) {
        window.designerRightSlotWidth = '0px';
    } else {
        if (tabap) {
            tabap.style.removeProperty('width');
            tabap.style.removeProperty('flex-grow');
        }
        if (application.length > 0) {
            const dom = application[0];
            dom.style.removeProperty('width');
        }
    }
}

export function handleLock(fixedWidth = 420) {
    const tabap = document.getElementById('tabap');
    const application = document.getElementsByClassName(
        'kd-cq-application-center'
    );
    const kdesignerRoot = document.getElementsByClassName(
        'kdesigner-kdesigner-root'
    );
    if (kdesignerRoot.length > 0) {
        window.designerRightSlotWidth = fixedWidth + 'px';
    } else {
        if (tabap) {
            tabap.style.setProperty('width', `calc(100% - ${fixedWidth}px)`, 'important');
            tabap.style.setProperty('flex-grow', '0', 'important');
        }
        if (application.length > 0) {
            const dom = application[0];
            dom.style.setProperty('width', '100%', 'important');
        }
    }
}

export function trim(str) {
    return str.replace(/^\s+/g, '').replace(/\s+$/g, '');
}


export function generateKey() {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
