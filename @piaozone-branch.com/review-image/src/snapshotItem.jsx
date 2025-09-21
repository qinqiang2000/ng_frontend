/* eslint-disable */
import React from 'react';
import { Tooltip } from 'antd';
import PropTypes from 'prop-types';
import noImg from './img/noImg.png';
import file from './img/file.png';
import pdfIcon from './img/pdf.png';
import excelIcon from './img/excel.png';
import wordIcon from './img/word.png';
import electricTicket from './img/electricTicket.png';
import paperTicket from './img/paperTicket.png';
import pptIcon from './img/ppt.png';
import ofdIcon from './img/ofd.png';
import txtIcon from './img/txt.png';
import heicIcon from './img/heic.png';
import xmlIcon from './img/xml.png';
import { getFileType } from './util';
import { useImg } from './hooks';

const iconUrl = {
    pdf: pdfIcon,
    docx: wordIcon,
    excel: excelIcon,
    ppt: pptIcon,
    ofd: ofdIcon,
    txt: txtIcon,
    heic: heicIcon,
    xml: xmlIcon
};

export default function SnapshotItem (props) {
    const { mode, info, count, sign, getSelectedInfo, selectedInfo, getSelectNo, fscanBillNos, changeSign } = props;
    const { snapshotUrl = '', thumbnailUrl = '', originalFileName = '---', extName = 'jpg', invoiceFileType = 1, inputInvoices = [], attachSerialNoList = [], pageNum = 0, ffileType } = info;
    const fixedIcon = () => { //固定图标展示
        // return (ffileType === 2 && (getFileType(extName) !== 'unknown' && getFileType(extName) !== 'ofd' && getFileType(extName) !== 'xml')) || inputInvoices.length > 0 ? snapshotUrl : iconUrl[getFileType(extName)] ? iconUrl[getFileType(extName)] : noImg
        const fileType = getFileType(extName);
        const resultUrl = ffileType === 2 && (
          fileType !== 'unknown' && fileType !== 'ofd' && fileType !== 'xml'
        ) ? (thumbnailUrl || snapshotUrl) : (iconUrl[fileType] || noImg);
        return resultUrl;
        // const endName = getFileType(extName);
        // if (snapshotUrl) {
        //     if (endName && endName == 'image') {
        //         return snapshotUrl;
        //     }
        // }
        // return iconUrl[getFileType(extName)] || noImg;
    }

    const fileLabel = (sign, info) => {
        if(sign === 'cover') {
            return null
        }
        if (sign === 'noCover') {
            const { fscanType } = info
            if (fscanType == 1) {
                return <div className="file-label">发票</div>
            } else {
                return <div className="file-label">附件</div>
            }
        } else {
            if (invoiceFileType === 3) {
                return <div className='otherType'>其他</div>
            } else {
                return <img src={invoiceFileType === 1 ? paperTicket : electricTicket} className='signIcon' />
            }
        }
    }

    return (
        <div
            className={info.serialNo === selectedInfo.serialNo ? 'snapshot snapshot-active' : 'snapshot'}
            onClick={() => {
                getSelectedInfo(info);
                getSelectNo(fscanBillNos);
                changeSign(true);
            }}
        >
            {mode === 'img' && (
                <>
                    <span>{count}</span>
                    {
                        useImg({
                            url: fixedIcon(),
                            className: 'img',
                            isShowImg: !!snapshotUrl,
                            rotationAngle: info.rotationAngle,
                            fallback: noImg
                        })}
                </>
            )}
            <div>
                <div className='snapshot-title'>
                    {mode === 'list' && <span className='count'>{count}</span>}
                    <Tooltip placement='top' title={<div className='tooltip'>{originalFileName}</div>} getPopupContainer={() => document.getElementById(`name${mode}`)}>
                        <div className='originName' id={`name${mode}`}>{originalFileName}</div>
                    </Tooltip>
                </div>
                {
                    sign !== 'attachment' ? (
                        <div className='content'>
                            {fileLabel(sign, info)}
                            <span className='text'>共{inputInvoices.length || 1}张</span>
                            {pageNum > 1 && <span className='text'>共{pageNum}页</span>}
                            {attachSerialNoList.length > 0 && (
                                <span className='fileCount'><img src={file} /><span>{attachSerialNoList.length}</span></span>
                            )}
                        </div>
                    ) : null
                }
            </div>
        </div>
    )
};

SnapshotItem.propTypes = {
    mode: PropTypes.string,
    getSelectNo: PropTypes.func,
    info: PropTypes.object,
    count: PropTypes.number,
    sign: PropTypes.string,
    getSelectedInfo: PropTypes.func,
    selectedInfo: PropTypes.object,
    fscanBillNos: PropTypes.string,
    changeSign: PropTypes.func
};

SnapshotItem.default = {
    mode: 'img'
};