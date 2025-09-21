import { useState, useEffect } from 'react';

function useWindowSize() {
    const gap = 25;
    const maxDisplayWidth = 760;
    const maxTemplateWidth = 900;
    const minWidth = maxDisplayWidth + maxTemplateWidth + gap;
    const rate = maxDisplayWidth / minWidth;
    const getSize = () => {
        return {
            width: window.innerWidth,
            height: window.innerHeight,
            maxDisplayWidth,
            maxTemplateWidth,
            displayWidth: window.innerWidth > minWidth ? maxDisplayWidth : Math.min(rate * window.innerWidth, maxDisplayWidth),
            templateWidth: window.innerWidth > minWidth ? maxTemplateWidth : Math.min(window.innerWidth * (1 - rate), maxTemplateWidth)
        };
    };
    const initSize = getSize();
    const [size, setSize] = useState(initSize);

    useEffect(() => {
        const handleResize = () => {
            const newSize = getSize();
            setSize(newSize);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return size;
}

export default useWindowSize;