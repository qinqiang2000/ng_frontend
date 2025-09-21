/*eslint-disable*/
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import ViewPdf from '@piaozone.com/view-pdf';
import { message } from 'antd';
// import * as DataApi from '../../services/common';

import { clientCheck } from './clientCheck';
import './index.less';

const propTypes = {
    fileId: PropTypes.string,
    fileType: PropTypes.string,
    fileUrl: PropTypes.string,
    filename: PropTypes.string,
    openSlide: PropTypes.bool,
};

const clientInfo = clientCheck();

const ViewFile = ({ fileId, fileType, fileUrl, filename, openSlide=true, accessToken, onReviewFileUrl }) => {


    const [pagesContainerRotate, setPagesContainerRotate] = useState({});
    const [isFetchSearch, setIsFetchSearch] = useState(false);
    const [originFileUrl, setOriginFileUrl] = useState(''); //影像扫描调阅地址
    const reviewMethod = localStorage['reviewMethod'] ? localStorage['reviewMethod'] ?? '1' : '1';
    const isPdf = fileType === 'pdf' && (clientInfo.browser.chrome > 80 || clientInfo.browser.firefox > 80);
    console.log('isPdf------fileUrl-------fan----------', isPdf, fileUrl);
    useEffect(() => {
        // if(isPdf) {
        //     rotationSerach();
        // }else {
        //     onGetFileUrl();
        // }
        onGetFileUrl();
    }, [fileUrl])

    async function onGetFileUrl() {
        const reviewFileUrl = await onReviewFileUrl({ reviewMethod, fileUrl, accessToken });
        console.log('reviewFileUrl---------------', reviewFileUrl)
        setOriginFileUrl(reviewFileUrl);
    }
    const rotationSerach = async() => { //初始化pdf的角度， 原代码
        const res = await DataApi.rotationSerach({
            ffileId: fileId,
            fsource: 1
        });
        if (res.errcode !== '0000') {
            message.error(`${res.description}[${res.errcode}]`);
            return false;
        }
        const { data } = res;
        const pageRotate = {};
        data.forEach(item => {
            const { fpage, frotationAngle } = item;
            pageRotate[Number(fpage)] = Number(frotationAngle);
        });
        setPagesContainerRotate(pageRotate);
        setTimeout(() => {
            setIsFetchSearch(true);
        }, 0)
    }

    if (!fileUrl) {
        return null;
    }

    if (isPdf) { // 高版本浏览器才走
        if (staticUrl.indexOf('localhost') !== -1) {
            staticUrl = 'https://imgshow-master.piaozone.com';
        }

        // if (!isFetchSearch) {
        //     return null;
        // }

        return (
            <ViewPdf
                filename={filename}
                src='http://localhost:7001/imgsys-web/api/imgsys/bill/mongoDB/viewFile?fileId=9b45b0e415d04f4f8100c8e9b9b8cd400&client-platform=archive'
                cMapUrl={staticUrl + '/static/gallery/pdfjs-doc/web/pdfjs/cmaps/'}
                cMapPacked={true}
                useOnlyCssZoom={false}
                renderInteractiveForms={true}
                fileType="pdf"
                pagesContainerRotate={pagesContainerRotate}
                // setPageRotate={}
                scale="page-actual"
                openSlide={openSlide}
                className='image-system-view-pdf'
                pdfWorkUrl={staticUrl + '/static/gallery/pdfViewJs/2x/pdf.worker.js'}
            />
        )
    }
    return (
        <iframe src={originFileUrl} width='100%' height='100%' />
    );

};

ViewFile.propTypes = {
    onReviewFileUrl: PropTypes.func
}

export default ViewFile;
