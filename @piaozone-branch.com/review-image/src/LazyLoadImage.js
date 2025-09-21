/* eslint-disable */
import React, { useEffect, useRef, useState } from 'react';
export const LazyLoadImage = ({ src, alt, width, height, onLoaded, onLoadErr, rotationAngle }) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const imgRef = useRef(null);
    useEffect(() => {
        // 检查 IntersectionObserver 是否可用
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver(
                ([entry]) => {
                    if (entry.isIntersecting) {
                        setIsLoaded(true);
                        observer.unobserve(entry.target);
                    }
                },
                {
                    rootMargin: '100px',
                    threshold: 0.1
                }
            );

            if (imgRef.current) {
                observer.observe(imgRef.current);
            }

            return () => {
                if (imgRef.current) {
                    observer.unobserve(imgRef.current);
                }
            };
        } else {
        // 如果 IntersectionObserver 不可用，直接加载图片
            setIsLoaded(true);
        }
    }, []);

    const onError = () => {
        if (onLoadErr && typeof onLoadErr === 'function') {
            onLoadErr();
        }
    };

    const onLoad = () => {
        if (onLoaded && typeof onLoaded === 'function') {
            onLoaded();
        }
    };
    return (
        <div ref={imgRef} style={{ width, height }}>
            {
                isLoaded ? (
                    <img
                        src={src}
                        alt={alt}
                        style={{ width: 60, height: 60, borderRadius: 4, transform: `rotate(${rotationAngle}deg)` }}
                        onError={onError}
                        onLoad={onLoad}
                    />
                ) : (
                    <div style={{ width: '100%', height: '100%', backgroundColor: '#f0f0f0' }} />
                )
            }
        </div>
    );
};
