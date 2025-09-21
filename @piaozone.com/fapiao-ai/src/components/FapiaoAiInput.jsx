/* eslint-disable max-len, no-unused-vars, no-console, quotes, complexity */
import React, { useState, forwardRef, useRef } from 'react';
import TextArea from 'antd/lib/input/TextArea';
import Upload from './Upload';
import { Select } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import UploadFileList from './uploadFileList';
import { useSelector, useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import { updateProccess } from '../store/fapiaoAiInput';
import { addChatMessage, changeChatMessage } from '../store/fapiaoAiChat';
import { setTemplateUrl } from '../store/fapiaoAiTemplate';
import { useScrollToBottom } from '../utils/scroll-utils';
import axios from 'axios';
import { detectMarkdown, convertMarkdownToHtml, processStreamingContent } from '../utils/markdown-tools';

const { Option } = Select;

const FapiaoAiInput = forwardRef((props, ref) => {
    const [focus, setFocus] = useState(false);
    const [value, setValue] = useState('');
    const [fileList, setFileList] = useState([]);
    const chatList = useSelector((state) => state.fapiaoAiChat.chatList);
    const processing = useSelector((state) => state.fapiaoAiInput.processing);
    const { scrollToBottom } = useScrollToBottom('.fapiaoAiChatList');
    const dispatch = useDispatch();
    const gap = props.gap;
    const inputRef = useRef(null);
    const chatListRef = useRef(chatList);

    // 更新chatListRef的值
    React.useEffect(() => {
        chatListRef.current = chatList;
    }, [chatList]);

    const handleEnter = async() => {
        if (value.trim()) {
            const index = chatList.length;
            dispatch(updateProccess({
                processing: true,
                processType: '',
                proccess: 0,
                processResult: '',
                processingDescription: '正在处理中'
            }));
            // 显示用户消息
            dispatch(addChatMessage({
                index: index,
                from: 'user',
                message: value,
                fileList: fileList.map((f) => {
                    return {
                        name: f.name,
                        size: f.size,
                        type: f.type
                    };
                }) // 只显示文件信息，不包含File对象
            }));

            scrollToBottom();
            const currentValue = value;
            const currentFileList = [...fileList];
            setValue(''); // 清空输入框
            setFileList([]);

            try {
                await handleStreamRequest(currentValue, currentFileList, index);
            } catch (error) {
                console.error('发送消息失败:', error);
                dispatch(addChatMessage({
                    index: index + 1,
                    from: 'system',
                    message: '抱歉，处理您的请求时出现了错误，请稍后重试。',
                    fileList: []
                }));
                scrollToBottom();
            } finally {
                dispatch(updateProccess({
                    processing: false,
                    processType: '',
                    proccess: 0,
                    processResult: ''
                }));
            }
        }
    };

    const handleStreamRequest = async(message, currentFileList, userMessageIndex) => {
        return new Promise((resolve, reject) => {
            const formData = new FormData();
            const history = chatList.map((item) => {
                return {
                    role: item.from === 'user' ? 'user' : 'assistant',
                    content: item.message
                };
            });

            formData.append('message', message);
            formData.append('userId', 'guest');
            formData.append('history', JSON.stringify(history));

            // 添加文件到FormData
            currentFileList.forEach((fileInfo) => {
                if (fileInfo.file) {
                    formData.append('files', fileInfo.file);
                }
            });

            const systemMessageIndex = userMessageIndex + 1;

            const handleStreamData = (data) => {
                switch (data.type) {
                    case 'connected':
                        break;

                    case 'task_progress':
                        // 统一的任务进度处理
                        const taskData = data.data;
                        const progress = taskData.progress || 0;
                        const taskStatus = taskData.taskStatus;
                        const taskResult = taskData.taskResult || {};
                        const taskId = taskData.taskId;

                        // 存储当前任务ID
                        if (taskId) {
                            sessionStorage.setItem('currentTaskId', taskId);
                        }
                        if (taskData.content) {
                            dispatch(updateProccess({
                                processing: false,
                                processType: taskData.taskType,
                                proccess: progress,
                                taskId: taskId,
                                processingDescription: ''
                            }));
                        } else if (data.message) {
                            dispatch(updateProccess({
                                processing: true,
                                processType: taskData.taskType,
                                proccess: 0,
                                taskId: taskId,
                                processingDescription: data.message
                            }));
                        }


                        // 查找是否存在相同taskId的消息
                        const existingMessageIndex = chatListRef.current.findIndex(
                            (msg) => msg.taskId === taskId && msg.from === 'system'
                        );

                        // 根据是否找到现有消息判断新增还是更新
                        const isNewMessage = existingMessageIndex === -1;
                        const messageIndex = isNewMessage ? systemMessageIndex : existingMessageIndex;

                        // 统一处理所有任务类型的消息
                        if (taskData.content) {
                            let messageContent = taskData.content;

                            // 特殊处理报销任务的步骤显示
                            if (taskData.taskType === 'expense_report' && taskResult.steps) {
                                const currentStepInfo = taskResult.steps.find((step) =>
                                    step.name === taskResult.currentStep
                                );

                                if (currentStepInfo) {
                                    const stepsList = taskResult.steps.map((step) => {
                                        return `${step.status} ${step.title}`;
                                    }).join('\n');

                                    if (!taskData.content) {
                                        messageContent = `## 报销流程进度\n\n${stepsList}\n\n**当前步骤**: ${currentStepInfo.title}`;
                                    } else {
                                        messageContent += `\n\n## 处理步骤\n\n${stepsList}`;
                                    }
                                }
                            }

                            // 统一检测和转换Markdown
                            const hasMarkdown = detectMarkdown(messageContent);
                            let displayContent = messageContent;
                            let finalContentType = 'text';

                            if (hasMarkdown && displayContent) {
                                // 判断是否为完成状态
                                const isTaskComplete = taskData.isComplete || taskStatus === 'completed';

                                if (isTaskComplete) {
                                    console.log('完整内容，进行最终转换');
                                    // 完整内容，进行最终转换
                                    displayContent = convertMarkdownToHtml(displayContent);
                                    finalContentType = 'html';
                                } else {
                                    console.log('流式内容，智能处理');
                                    // 流式内容，智能处理
                                    displayContent = processStreamingContent(displayContent, false);
                                    finalContentType = 'html'; // 流式处理后也是HTML格式
                                }
                            } else if (hasMarkdown) {
                                console.log('没有Markdown，直接显示');
                                finalContentType = 'markdown';
                            }

                            const messageData = {
                                index: messageIndex,
                                from: 'system',
                                message: displayContent,
                                fileList: [],
                                isStreaming: !(taskData.isComplete || taskStatus === 'completed'),
                                hasMarkdown: hasMarkdown,
                                contentType: finalContentType,
                                taskId: taskId,
                                taskType: taskData.taskType,
                                taskProgress: progress,
                                taskStatus: taskStatus,
                                taskResult
                            };

                            if (isNewMessage) {
                                dispatch(addChatMessage(messageData));
                            } else {
                                dispatch(changeChatMessage(messageData));
                            }

                            // 检查任务是否完成并有特殊结果（如报销单URL）
                            if (taskStatus === 'completed' && taskResult.formUrl) {
                                dispatch(setTemplateUrl({
                                    templateUrl: taskResult.formUrl
                                }));
                            }
                        }
                        scrollToBottom();
                        break;

                    case 'error':
                        console.error('任务处理错误:', data);

                        // 直接添加错误消息，不与任务关联
                        dispatch(addChatMessage({
                            index: systemMessageIndex,
                            from: 'system',
                            message: `错误: ${data.message}`,
                            fileList: [],
                            taskStatus: 'error'
                        }));

                        dispatch(updateProccess({
                            processing: false,
                            processType: '',
                            proccess: 0,
                            processResult: ''
                        }));
                        scrollToBottom();
                        inputRef.current.focus();
                        break;

                    case 'cancelled':
                        // 直接添加取消消息，不与任务关联
                        dispatch(addChatMessage({
                            index: systemMessageIndex,
                            from: 'system',
                            message: `任务已取消: ${data.message}`,
                            fileList: [],
                            taskStatus: 'cancelled'
                        }));

                        dispatch(updateProccess({
                            processing: false,
                            processType: '',
                            proccess: 0,
                            processResult: ''
                        }));
                        scrollToBottom();
                        break;

                    case 'done':
                        dispatch(updateProccess({
                            processing: false,
                            processType: '',
                            proccess: 100,
                            processResult: ''
                        }));
                        scrollToBottom();
                        inputRef.current.focus();
                        break;

                    default:
                        console.log('未知的响应类型:', data);
                }
            };

            // 开始fetch请求
            fetch('/api/chat/process', {
                method: 'POST',
                body: formData
            }).then((response) => {
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const reader = response.body.getReader();
                const decoder = new TextDecoder();
                let buffer = ''; // 用于存储不完整的数据

                const readStream = () => {
                    reader.read().then(({ done, value: chunkValue }) => {
                        if (done) {
                            resolve();
                            return;
                        }

                        const chunk = decoder.decode(chunkValue, { stream: true });
                        // 将新数据添加到缓冲区
                        buffer += chunk;

                        // 按行分割处理
                        const lines = buffer.split('\n');

                        // 保留最后一行（可能不完整）
                        buffer = lines.pop() || '';

                        lines.forEach((line) => {
                            if (line.startsWith('data: ')) {
                                try {
                                    const jsonStr = line.slice(6).trim();
                                    if (jsonStr) {
                                        const data = JSON.parse(jsonStr);
                                        handleStreamData(data);
                                    }
                                } catch (e) {
                                    console.error('解析流式数据失败:', e, '原始行:', line);
                                }
                            }
                        });

                        readStream();
                    }).catch(reject);
                };
                readStream();
            }).catch(reject);
        });
    };

    const beforeUpload = (curFileList) => {
        // 可在此进行上传验证逻辑
        let fullFileList = [...fileList];
        for (let i = 0; i < curFileList.length; i++) {
            const item = curFileList[i];
            const fileInfo = {
                file: item,
                name: item.name,
                size: (item.size / (1024 * 1024)).toFixed(2), // 转换为MB
                type: item.type,
                uid: item.uid,
                lastModified: item.lastModified
            };
            fullFileList = fullFileList.concat(fileInfo);
        }
        setFileList(fullFileList);
        inputRef.current.focus();
    };

    const onDeleteFile = (index) => {
        const newFileList = fileList.filter((_, i) => i !== index);
        setFileList(newFileList);
    };

    const handleStop = async() => {
        // 取消当前正在进行的任务
        try {
            // 发送取消请求到服务器（如果有正在运行的任务）
            const currentTaskId = sessionStorage.getItem('currentTaskId');
            if (currentTaskId) {
                await axios.post(`/api/chat/task/${currentTaskId}/cancel`);
                sessionStorage.removeItem('currentTaskId');
            }
        } catch (error) {
            console.error('取消任务失败:', error);
        }

        // 重置处理状态
        dispatch(updateProccess({
            processing: false,
            processType: '',
            proccess: 0,
            processResult: ''
        }));
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault(); // 阻止换行
            handleEnter();
        }
    };

    const showLogo = (!focus && value === '' && fileList.length === 0 && chatList.length === 0);
    let boxClass = 'fapiaoAiInput';
    if (focus) {
        boxClass += ' focus';
    }
    if (chatList.length > 0) {
        boxClass += ' hasChat';
    }
    const displayWidth = props.displayWidth - 2 * gap;

    return (
        <div style={{ width: displayWidth, marginLeft: gap }} className='outFapiaoAiInput'>
            <div className={boxClass} style={{ width: displayWidth }} ref={ref}>
                {
                    showLogo ? (
                        <span className='log-icon'>&nbsp;</span>
                    ) : null
                }

                <UploadFileList
                    fileList={fileList}
                    onDelete={onDeleteFile}
                />
                <Select
                    className='selectModel'
                    defaultValue='Deepseek'
                    bordered={false}
                    popupClassName='selectModel-dropdown'
                    suffixIcon={<DownOutlined style={{ color: '#2E8CF0', fontSize: 12 }} />}
                >
                    <Option value='Deepseek'>Deepseek</Option>
                </Select>
                <TextArea
                    autoFocus
                    ref={inputRef}
                    placeholder='有问题尽管问Fapiao.AI'
                    className='input-textarea'
                    onFocus={() => setFocus(true)}
                    onBlur={() => setFocus(false)}
                    onKeyDown={handleKeyDown}
                    onChange={(e) => setValue(e.target.value)}
                    value={value}
                    disabled={processing}
                    autoSize={{ minRows: 2, maxRows: 10 }} // 自动高度调整
                    style={showLogo ? {
                        padding: '5px 44px 0 48px'
                    } : {
                        padding: '5px 44px 0 18px'
                    }}
                />
                <Upload
                    beforeUpload={beforeUpload}
                />
                <span
                    className={processing ? 'send-icon disabled' : 'send-icon'}
                    onClick={processing ? handleStop : handleEnter}
                />
            </div>
        </div>
    );
});

FapiaoAiInput.propTypes = {
    displayWidth: PropTypes.number.isRequired,
    gap: PropTypes.number.isRequired
};
export default FapiaoAiInput;