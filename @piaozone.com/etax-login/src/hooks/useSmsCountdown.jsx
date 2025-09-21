import { useState, useEffect } from 'react';

// 短信倒计时
export default function useSmsCountdown(initCounter = -1) {
    const [counter, setCounter] = useState(initCounter);

    // 开启和销毁倒计时
    useEffect(() => {
        let timer = null;
        if (counter >= 0) {
            timer = window.setTimeout(() => {
                setCounter(counter - 1);
            }, 1000);
        }
        return () => {
            window.clearTimeout(timer);
        };
    }, [counter]);

    return [counter, setCounter];
}
