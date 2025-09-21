import React from 'react';
import { Upload, Tooltip } from 'antd';
import PropTypes from 'prop-types';
const CustomUpload = (props) => {
    const uploadProps = {
        showUploadList: false,
        className: 'custom-upload',
        accept: '.jpg,.jpeg,.png,.pdf,.ofd,.xml', // 限制上传文件类型
        multiple: true, // 是否允许多选文件
        beforeUpload: (file, curFileList) => {
            props.beforeUpload(curFileList);
            return false; // 阻止自动上传
        }
    };

    return (
        <Tooltip
            title={
                <div style={{ fontSize: 12, lineHeight: '20px' }}>
                    <span>选择jpg/png/ofd/xml/pdf格式文件上传</span><br />
                    <span>一次最多选择20个文件, 单个文件最大10M</span><br />
                </div>
            }
        >
            <Upload {...uploadProps}>
                <span className='upload-icon'>&nbsp;</span>
            </Upload>
        </Tooltip>
    );
};
CustomUpload.propTypes = {
    beforeUpload: PropTypes.func.isRequired
};
export default CustomUpload;
