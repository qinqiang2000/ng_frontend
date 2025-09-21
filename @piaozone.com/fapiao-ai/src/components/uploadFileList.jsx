import React from 'react';
import '../css/uploadFileList.less';
import FileItem from './FileItem';
import PropTypes from 'prop-types';

const UploadFileList = (props) => {
    const fileList = props.fileList;
    if (!fileList || fileList.length === 0) {
        return null;
    }

    return (
        <div className='uploadFileList'>
            {
                fileList.map((file, index) => {
                    return (
                        <FileItem
                            key={file.uid}
                            fileInfo={{ ...file, index }}
                            onDelete={props.onDelete}
                            disableDelete={false}
                        />
                    );
                })
            }
        </div>
    );
};

UploadFileList.propTypes = {
    fileList: PropTypes.array.isRequired,
    onDelete: PropTypes.func
};

export default UploadFileList;