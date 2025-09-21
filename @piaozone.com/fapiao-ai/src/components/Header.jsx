import React from 'react';
import { Typography } from 'antd';
import { useSelector } from 'react-redux';
import '../css/header.less';
const { Title } = Typography;

const FapiaoAiHeader = () => {
    const chatList = useSelector((state) => state.fapiaoAiChat.chatList);
    const notEmptyChat = chatList && chatList.length > 0;
    return (
        <Title level={2} className={notEmptyChat ? 'fapiaoAiHeader processing' : 'fapiaoAiHeader'}>
            <span className='titleName'>Fapiao</span>.
            <span style={{ color: '#1677ff' }}>AI</span>
        </Title>
    );
};

export default FapiaoAiHeader;