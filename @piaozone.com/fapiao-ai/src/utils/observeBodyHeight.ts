type HeightChangeCallback = (newHeight: number) => void;

export function observeBodyHeight(callback: HeightChangeCallback): () => void {
    let lastHeight = document.body.offsetHeight;
    let observer: ResizeObserver | null = null;
    let intervalId: number | null = null; // 确保 intervalId 是 number | null

    const notifyIfChanged = () => {
        const newHeight = document.body.offsetHeight;
        if (newHeight !== lastHeight) {
            lastHeight = newHeight;
            callback(newHeight);
        }
    };

    // 如果浏览器支持 ResizeObserver
    if ('ResizeObserver' in window) {
        observer = new ResizeObserver(() => {
            notifyIfChanged();
        });
        observer.observe(document.body);
    } else {
        // 退回使用 setInterval 轮询检测，兼容 IE11 及更老版本浏览器
        intervalId = (window as Window).setInterval(notifyIfChanged, 300); // 每300ms检查一次
    }

    // 返回取消监听函数
    return () => {
        if (observer) {
            observer.disconnect();
        }
        if (intervalId !== null) {
            clearInterval(intervalId);
        }
    };
}
