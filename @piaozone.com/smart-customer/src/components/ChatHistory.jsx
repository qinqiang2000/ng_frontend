import React, { useRef, useEffect, useState } from 'react';
import { List } from 'antd';
import ChatMessageItem from './ChatMessageItem';

const ChatHistory = ({ messages, setMessages, height }) => {
    const scrollRef = useRef(null);
    const firstMsgRef = useRef(null);
    const loadingRef = useRef(null);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [initialLoaded, setInitialLoaded] = useState(false);

    const handleLoadMore = () => {
        if (loadingHistory) {
            return;
        }
        setLoadingHistory(true);
        const oldScrollHeight = scrollRef.current?.scrollHeight || 0;

        setTimeout(() => {
            const now = Date.now();
            const newMessages = Array.from({ length: 5 }).map((_, i) => ({
                id: now - (i + 1) * 1000,
                sender: i % 2 === 0 ? 'bot' : 'user',
                content: `历史消息 #${i + 1}`,
                timestamp: now - (i + 1) * 1000
            }));
            setMessages((prev) => [...newMessages.reverse(), ...prev]);

            setTimeout(() => {
                const newScrollHeight = scrollRef.current.scrollHeight;
                scrollRef.current.scrollTop = newScrollHeight - oldScrollHeight;
                setLoadingHistory(false);
            }, 0);
        }, 600);
    };

    useEffect(() => {
        if (!scrollRef.current || !firstMsgRef.current) {
            return;
        }
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && initialLoaded) {
                    handleLoadMore();
                }
            },
            { root: scrollRef.current, threshold: 1.0 }
        );
        observer.observe(firstMsgRef.current);
        const timer = setTimeout(() => setInitialLoaded(true), 300);
        return () => {
            observer.disconnect();
            clearTimeout(timer);
        };
    }, [messages]);

    return (
        <div ref={scrollRef} style={{ flex: 1, minHeight: 0, height, overflowY: 'auto' }}>
            <div ref={loadingRef} style={{ textAlign: 'center', padding: 8, fontSize: 12, color: '#999' }}>
                {loadingHistory ? '加载历史记录中...' : '↑ 上滑加载更多'}
            </div>
            <List
                dataSource={messages}
                renderItem={(item, index) => (
                    <ChatMessageItem key={item.id} item={item} ref={index === 0 ? firstMsgRef : null} />
                )}
            />
        </div>
    );
};

export default ChatHistory;
