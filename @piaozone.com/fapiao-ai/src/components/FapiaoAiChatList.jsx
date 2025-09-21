/* eslint-disable react/no-danger */
import React from 'react';
import { useSelector } from 'react-redux';
import '../css/fapiaoAiChatList.less';
import FileItem from './FileItem';
import PropTypes from 'prop-types';
import useWindowSize from './windowSize';

const FapiaoAiChatList = (props) => {
    const chatList = useSelector((state) => state.fapiaoAiChat.chatList);
    const displayTemplate = useSelector((state) => state.fapiaoAiTemplate.displayTemplate);
    const processing = useSelector((state) => state.fapiaoAiInput.processing);
    const processingDescription = useSelector((state) => state.fapiaoAiInput.processingDescription);
    const proccess = useSelector((state) => state.fapiaoAiInput.proccess);
    const { displayWidth, width, height } = useWindowSize();
    const gap = props.gap;
    const bottomGap = props.bottomGap;

    if (chatList.length === 0) {
        return null;
    }
    let outWidth = displayWidth;
    if (!displayTemplate) {
        outWidth = displayWidth + (width - displayWidth) / 2;
    }
    return (
        <div
            className='fapiaoAiChatList'
            style={{
                width: displayTemplate ? displayWidth : outWidth,
                height: height - 57
            }}
        >
            <div
                className='fapiaoAiChatListContent clearfix'
                style={{
                    width: displayWidth - 7,
                    paddingRight: gap,
                    paddingLeft: gap,
                    paddingBottom: props.chatInputHeight + bottomGap
                }}
            >
                {
                    chatList.map((item) => {
                        const key = item.index + (item.taskId || '') + item.from;
                        return (
                            <div key={key} className={'chatItem ' + item.from}>
                                {
                                    item.message ? (
                                        <div className='outerMessage clearfix'>
                                            <div
                                                className='message'
                                                dangerouslySetInnerHTML={{ __html: item.message }}
                                            />
                                        </div>
                                    ) : null
                                }
                                {
                                    item.fileList && item.fileList.length > 0 ? (
                                        <div className='fileList clearfix'>
                                            {
                                                item.fileList.map((file, index) => {
                                                    return (
                                                        <FileItem
                                                            key={index}
                                                            fileInfo={{ ...file, index }}
                                                            disableDelete={true}
                                                        />
                                                    );
                                                })
                                            }
                                        </div>
                                    ) : null
                                }
                            </div>
                        );
                    })
                }
                {
                    processing ? (
                        <div className='processing chatItem'>
                            <span className='processing-text'>
                                {processingDescription}
                                {
                                    proccess > 0 ? (
                                        <span className='processing-text'>
                                            {proccess}%
                                        </span>
                                    ) : (
                                        <span className='loading-dots'>
                                            <span className='dot'>.</span>
                                            <span className='dot'>.</span>
                                            <span className='dot'>.</span>
                                            <span className='dot'>.</span>
                                        </span>
                                    )
                                }
                            </span>
                        </div>
                    ) : null
                }
            </div>
        </div>
    );
};

FapiaoAiChatList.propTypes = {
    chatInputHeight: PropTypes.number.isRequired,
    bottomGap: PropTypes.number.isRequired,
    gap: PropTypes.number.isRequired
};

export default FapiaoAiChatList;