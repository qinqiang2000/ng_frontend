/*eslint-disable*/
import React, { useImperativeHandle } from 'react';
import PropTypes from 'prop-types';
import './index.less';
import ViewPdf from './pdfView';
import { clientCheck, getFileType, getUrlParam } from './util';

export default function DocView(props) {
    const { fileUrl, angle, changeAngle, extName, method, officeUrl } = props;
    let staticUrl = window.staticUrl;

    const childRef = React.createRef();
    const clientInfo = clientCheck();

    useImperativeHandle(props.onRef, () => {
        return {
            zoom,
            rotate
        }
    });

    const rotate = (dir) => {
        childRef.current?.rotate(dir);
    };

    const zoom = (dir) => {
        dir === 'enlarge' ? childRef.current?.zoomIn() : childRef.current?.zoomOut();
    }

    if ((getFileType(extName) === 'pdf') && (clientInfo.browser.chrome > 80 || clientInfo.browser.firefox > 80)) { // 高版本浏览器才走
        if (staticUrl?.indexOf('localhost') !== -1) {
            staticUrl = 'https://imgshow-master.piaozone.com';
        }

        return (
            <div className='doc-view'>
                <ViewPdf
                    filename={''}
                    src={fileUrl}
                    cMapUrl={staticUrl + '/static/gallery/pdfjs-doc/web/pdfjs/cmaps/'}
                    cMapPacked={true}
                    useOnlyCssZoom={false}
                    renderInteractiveForms={true}
                    fileType='pdf'
                    ref={childRef}
                    className='pdf-bg'
                    pagesContainerRotate={angle}
                    changeAngle={changeAngle}
                    scale='auto'
                    pdfWorkUrl={staticUrl + '/static/gallery/pdfViewJs/2x/pdf.worker.js'}
                />
            </div>
        )
    }

    const access_token = getUrlParam(fileUrl, 'access_token');
    const client_platform = getUrlParam(fileUrl, 'client-platform');
    let originFileUrl = '';

    const { protocol, host } = window.location;
    if (method === 1) {
        originFileUrl = clientInfo.browser.ie ? (
                `${officeUrl}/online-view/onlinePreview?url=${encodeURIComponent(fileUrl)}&access_token=${access_token}&client-platform=${client_platform}&browser=ie`
            ) : (
                `${officeUrl}/online-view/onlinePreview?url=${encodeURIComponent(fileUrl)}&access_token=${access_token}&client-platform=${client_platform}`
            );
    } else {
        originFileUrl = `${protocol}//${host}${window.__INITIAL_STATE__?.pageDirName}/m22/vdoc?fileUrl=${encodeURIComponent(fileUrl)}`;
    }

    return (
        <div className='doc-view'>
            <iframe
                width='100%'
                height='100%'
                src={originFileUrl}
            >
            </iframe>
        </div>
    );
};

DocView.propTypes = {
    officeUrl: PropTypes.string,
    fileUrl: PropTypes.string, // 文件地址
    extName: PropTypes.string, // 文件类型
    angle: PropTypes.oneOfType([PropTypes.number, PropTypes.string, PropTypes.object]), //旋转角度
    changeAngle: PropTypes.func, // 旋转后的回调
    method: PropTypes.number // office组件是否用微软，仅公有云能用
};