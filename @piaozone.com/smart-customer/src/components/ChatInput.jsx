import React from 'react';
import { Input, Button, Tooltip } from 'antd';
import {
    SendOutlined,
    UploadOutlined,
    PictureOutlined,
    SmileOutlined,
    StarOutlined
} from '@ant-design/icons';

const { TextArea } = Input;

const ChatInput = ({ inputValue, setInputValue, sendMessage }) => (
    <div>
        <TextArea
            rows={3}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onPressEnter={(e) => {
                if (!e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                }
            }}
            placeholder='请简短描述您的问题...'
            style={{ marginBottom: 4 }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 8 }}>
                <Tooltip title='上传文件'><Button size='small' icon={<UploadOutlined />} /></Tooltip>
                <Tooltip title='上传图片'><Button size='small' icon={<PictureOutlined />} /></Tooltip>
                <Tooltip title='发送表情'><Button size='small' icon={<SmileOutlined />} /></Tooltip>
                <Tooltip title='星级评价'><Button size='small' icon={<StarOutlined />} /></Tooltip>
            </div>
            <Button type='primary' icon={<SendOutlined />} onClick={sendMessage}>发送</Button>
        </div>
    </div>
);

export default ChatInput;
