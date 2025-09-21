/* eslint-disable max-len, no-unused-vars, no-console*/
import React, { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import '../css/base.less';
import '../css/index.less';
import FapiaoAiChatList from '../components/FapiaoAiChatList';
import FapiaoAiHeader from '../components/Header';
import FapiaoAiInput from '../components/FapiaoAiInput';
import FapiaoAiTemplate from '../components/FapiaoAiTemplate';
import useWindowSize from '../components/windowSize';

const FapiaoAiPage = () => {
    const chatList = useSelector((state) => state.fapiaoAiChat.chatList);
    const displayTemplate = useSelector((state) => state.fapiaoAiTemplate.displayTemplate);
    const [chatInputHeight, setChatInputHeight] = useState(87);
    const { displayWidth, templateWidth } = useWindowSize();

    const ref = useRef(null);
    useEffect(() => {
        let resizeObserver = null;
        if (ref.current) {
            setChatInputHeight(ref.current.clientHeight);
            resizeObserver = new ResizeObserver((entries) => {
                for (const entry of entries) {
                    const { height } = entry.contentRect;
                    setChatInputHeight(height);
                }
            });
            // 开始观察元素
            resizeObserver.observe(ref.current);
        }

        return () => {
            if (resizeObserver) {
                resizeObserver.disconnect();
            }
        };
    }, []);

    let gap = 0;
    const bottomGap = 70;
    if (displayTemplate) {
        gap = 25;
    }
    const innerFapiaoAiInputBoxHeight = displayTemplate ? displayWidth + templateWidth : displayWidth;
    return (
        <div className={chatList.length > 0 ? 'fapiaoAiInputBox processing' : 'fapiaoAiInputBox'}>
            <div className='innerFapiaoAiInputBox' style={{ width: innerFapiaoAiInputBoxHeight }}>
                <FapiaoAiHeader />
                <FapiaoAiChatList
                    displayWidth={displayWidth}
                    chatInputHeight={chatInputHeight}
                    gap={gap}
                    bottomGap={bottomGap}
                />
                <FapiaoAiInput
                    displayWidth={displayWidth}
                    ref={ref}
                    gap={gap}
                />
                <FapiaoAiTemplate />
            </div>

        </div>
    );
};

export default FapiaoAiPage;
