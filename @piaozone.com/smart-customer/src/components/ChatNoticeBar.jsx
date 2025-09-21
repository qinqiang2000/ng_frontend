import React, { useState, useEffect } from 'react';
import { SoundOutlined } from '@ant-design/icons';
import '../css/ChatNoticeBar.css';

const ChatNoticeBar = ({ notices = [] }) => {
    const [index, setIndex] = useState(0);
    const [key, setKey] = useState(Date.now()); // 用于触发组件重新渲染，控制播放顺序

    const currentNotice = notices[index];

    // 控制切换到下一个通知
    const playNext = () => {
        const nextIndex = (index + 1) % notices.length;
        setIndex(nextIndex);
        setKey(Date.now()); // 通过时间戳强制刷新
    };

    // 每次播放完成时切换到下一个通知
    useEffect(() => {
        const timer = setTimeout(playNext, 20000); // 假设每个通知播放时间为 18 秒
        return () => clearTimeout(timer);
    }, [key]);

    if (!notices.length) {
        return null;
    }
    const noticeStyle = {
        whiteSpace: 'nowrap',
        display: 'inline-block',
        fontSize: '14px',
        color: '#161616',
        animation: 'wordsLoop 18s linear infinite normal' // 通过 CSS 动画实现滚动
    };

    const renderNotice = (notice) => {
        if (typeof notice.href === 'undefined') {
            return (
                <span style={noticeStyle}>{notice.text}</span>
            );
        }
        return (
            <a
                href={notice.href}
                target='_blank'
                rel='noopener noreferrer'
                style={{ textDecoration: 'underline', ...noticeStyle }}
            >
                {notice.text}
            </a>
        );
    };

    return (
        <div style={{
            overflow: 'hidden',
            background: '#fffbe6',
            padding: '4px 16px',
            fontSize: 14,
            display: 'flex',
            alignItems: 'center',
            height: 35,
            position: 'relative'
        }}>
            <SoundOutlined style={{ marginRight: 8, width: 17, height: 17 }} />
            <div style={{ overflow: 'hidden', flex: 1 }}>
                <div className='notice-track'>
                    {renderNotice(currentNotice)}
                </div>
            </div>
        </div>
    );
};

export default ChatNoticeBar;
