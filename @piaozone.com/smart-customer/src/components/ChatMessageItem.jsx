import React, { forwardRef } from 'react';
import { Avatar } from 'antd';
import { UserOutlined, RobotOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';

const ChatMessageItem = forwardRef(({ item }, ref) => {
    const formatTime = (timestamp) => {
        const d = new Date(timestamp);
        return d.toLocaleString();
    };

    return (
        <li ref={ref} style={{ listStyle: 'none', padding: '4px 0' }}>
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                style={{
                    display: 'flex',
                    flexDirection: item.sender === 'user' ? 'row-reverse' : 'row',
                    alignItems: 'flex-start',
                    gap: 8
                }}
            >
                <Avatar icon={item.sender === 'bot' ? <RobotOutlined /> : <UserOutlined />} />
                <div style={{ maxWidth: '80%' }}>
                    <div style={{ fontSize: 12, color: '#888', textAlign: item.sender === 'user' ? 'right' : 'left' }}>
                        {item.sender === 'bot' ? '发票云智能客服' : '我'}
                    </div>
                    <div style={{
                        backgroundColor: item.sender === 'user' ? '#d6f5ff' : '#f5f5f5',
                        borderRadius: 4,
                        padding: '8px 12px',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word'
                    }}>
                        {item.content}
                    </div>
                    <div style={{ fontSize: 12, color: '#aaa', marginTop: 5, textAlign: 'center' }}>
                        {formatTime(item.timestamp)}
                    </div>
                </div>
            </motion.div>
        </li>
    );
});

export default ChatMessageItem;
