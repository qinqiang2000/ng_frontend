import React, { useState } from 'react';
import { LazyLoadImage } from './LazyLoadImage';
import { Spin } from 'antd';

export function useImg({ url, className, isShowImg, rotationAngle, fallback }) {
    const [loading, setLoading] = useState(true);
    const [imageSrc, setImageSrc] = useState(url);
    const getStylCls = (angle) => {
        const absAngle = Math.abs(angle);
        const isEnd = new Set([90, 270]).has(absAngle);
        let width = 0;
        let height = 0;
        if (isEnd) {
            width = 60;
            height = 'auto';
        } else {
            width = 'auto';
            height = 60;
        }
        return {
            width,
            height
        };
    };

    const { width, height } = getStylCls(rotationAngle);

    const handleError = () => {
        console.log('scan----图片加载失败，尝试重新加载');
        setImageSrc(fallback); // 使用备用图片或重新加载原图
    };

    return (
        <div className={className} style={{ position: 'relative' }}>
            <LazyLoadImage
                src={imageSrc}
                className={className}
                onLoaded={() => { setLoading(false); }}
                onLoadErr={() => setLoading(false)}
                onError={handleError}
                rotationAngle={isShowImg ? `${-rotationAngle}` : 0}
                width={width}
                height={height}
            />
            <Spin size='small' style={{ position: 'absolute', top: '40%', left: '45%', visibility: loading ? 'visible' : 'hidden' }} />
        </div>
    );
}