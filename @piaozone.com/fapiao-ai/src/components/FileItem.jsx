import React from 'react';
import '../css/uploadFileList.less';
import { Card } from 'antd';
import '../css/fileItem.less';
import PropTypes from 'prop-types';
const FileItem = (props) => {
    const handleDelete = (index) => {
        props.onDelete(index);
    };
    const fileInfo = props.fileInfo;
    const fileType = fileInfo.name.split('.').pop().toLowerCase();
    return (
        <Card key={fileInfo.index} className={'fileItem ' + fileType}>
            <div>
                <p className='line'><span className='fileName'>{fileInfo.name}</span></p>
                <p><span className='fileSize'>{fileInfo.size} MB</span></p>
            </div>
            {
                props.onDelete ? (
                    <span className='closeIcon' onClick={() => handleDelete(fileInfo.index)}>&nbsp;</span>
                ) : null
            }
        </Card>
    );
};

FileItem.propTypes = {
    fileInfo: PropTypes.shape({
        index: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
        size: PropTypes.string.isRequired
    }).isRequired,
    onDelete: PropTypes.func
};

export default FileItem;