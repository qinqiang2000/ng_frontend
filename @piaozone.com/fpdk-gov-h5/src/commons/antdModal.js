
import { Modal } from 'antd';

export const confirm = ({ title, content, onOk, cancelText = '取消', okText = '确定' }) => {
    Modal.confirm({
        title, 
        content, 
        onOk,
        cancelText,
        okText
    });
};

export const modalSuccess = ({ title, content, okText = '知道了' }) => {
    Modal.success({
        title, 
        content,
        okText
    });
};

export const modalError = ({ title, content, okText = '知道了' }) => {
    Modal.error({
        title, 
        content,
        okText
    });
};

export const modalInfo = ({ title, content, okText = '知道了' }) => {
    Modal.info({
        title, 
        content,
        okText
    });
};