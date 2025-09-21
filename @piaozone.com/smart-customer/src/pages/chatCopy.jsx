import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Divider, Button } from 'antd';
import ChatHeader from '../components/ChatHeader';
import ChatHistory from '../components/ChatHistory';
import ChatInput from '../components/ChatInput';
import ChatNoticeBar from '../components/ChatNoticeBar';

const SmartCustomerChat = forwardRef(({ width = 350, top, right = 0, bottom = 0, left }, ref) => {
    const [visible, setVisible] = useState(true);
    const [chatHeight, setChatHeight] = useState(document.documentElement.clientHeight - 58);
    const [messages, setMessages] = useState([
        {
            id: 1,
            sender: 'bot',
            content: `您好！请问有什么可以帮您的吗？您可以咨询关于发票云产品或发票相关的问题。
点赞👍：http://47.236.17.67:9999/like/06c869ca579648308dc56548cff114bd/e3703b9068d144e793acc12b258f84a8
点踩👎：http://47.236.17.67:9999/dislike/06c869ca579648308dc56548cff114bd/e3703b9068d144e793acc12b258f84a8`,
            timestamp: Date.now()
        }
    ]);
    const [inputValue, setInputValue] = useState('');

    useImperativeHandle(ref, () => ({
        show: () => setVisible(true),
        hide: () => setVisible(false),
        toggle: () => setVisible((v) => !v)
    }));

    useEffect(() => {
        const resize = () => setChatHeight(Math.max(300, document.documentElement.clientHeight - 58));
        window.addEventListener('resize', resize);
        return () => window.removeEventListener('resize', resize);
    }, []);

    const sendMessage = () => {
        if (!inputValue.trim()) {
            return;
        }
        const userMessage = {
            id: Date.now(),
            sender: 'user',
            content: inputValue,
            timestamp: Date.now()
        };
        setMessages((prev) => [...prev, userMessage]);
        setInputValue('');
        setTimeout(() => {
            const botMessage = {
                id: Date.now() + 1,
                sender: 'bot',
                content: `您说的是：“${userMessage.content}”？我们已收到请求。`,
                timestamp: Date.now()
            };
            setMessages((prev) => [...prev, botMessage]);
        }, 600);
    };

    if (!visible) {
        return null;
    }

    return (
        <div style={{
            position: 'fixed', width, height: chatHeight, top, right, bottom, left,
            display: 'flex', flexDirection: 'column', zIndex: 999, backgroundColor: '#fff',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }}>
            <ChatHeader onClose={() => setVisible(false)} />
            <ChatNoticeBar
                notices={[
                    { text: '税局系统升级维护通知（2025.04.25）', href: 'https://vip.kingdee.com/knowledge/703563165874861056?productLineId=25&isKnowledge=2&lang=zh-CN' }
                ]}
            />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 16, overflow: 'hidden' }}>
                <ChatHistory messages={messages} setMessages={setMessages} height={chatHeight - 200} />
                <Divider style={{ margin: '12px 0 12px -16px', width }} />
                <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                    <Button size='small'>税控设备寄回申请</Button>
                    <Button size='small'>领票&导出托管发票数据</Button>
                </div>
                <ChatInput
                    inputValue={inputValue}
                    setInputValue={setInputValue}
                    sendMessage={sendMessage}
                />
            </div>
        </div>
    );
});

export default SmartCustomerChat;
