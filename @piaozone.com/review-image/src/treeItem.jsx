import React from 'react';
import { Tooltip } from 'antd';
import PropTypes from 'prop-types';
import noImg from './img/noImg.png';
import pdfIcon from './img/pdf.png';
import excelIcon from './img/excel.png';
import wordIcon from './img/word.png';
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

export default function TreeItem(props) {
    const { info, count, getSelectedInfo, selectedInfo, getSelectNo, fscanBillNos, mode } = props;
    const { snapshotUrl = '', originalFileName = '---', extName = 'jpg' } = info;
    return (
        <div
            className={info.fd === selectedInfo.fd ? 'snapshot snapshot-active' : 'snapshot'}
            onClick={() => {
                getSelectedInfo(info);
                getSelectNo(fscanBillNos);
            }}
        >
            {mode === 'img' && (
                <>
                    <span>{count}</span>
                    {
                        useImg({
                            url: snapshotUrl || iconUrl[getFileType(extName)] || noImg,
                            className: 'img',
                            isShowImg: !!snapshotUrl,
                            rotationAngle: info.rotationAngle,
                            fallback: noImg
                        })
                    }
                </>
            )}
            <div>
                <div className='snapshot-title'>
                    {mode === 'list' && <span className='count'>{count}</span>}
                    <Tooltip
                        placement='top'
                        title={<div className='tooltip'>{originalFileName}</div>} getPopupContainer={() => document.getElementById(`name${mode}`)}
                    >
                        <div className='originName' id={`name${mode}`}>{originalFileName}</div>
                    </Tooltip>
                </div>
            </div>
        </div>
    );
};

TreeItem.propTypes = {
    getSelectNo: PropTypes.func,
    info: PropTypes.object,
    count: PropTypes.number,
    getSelectedInfo: PropTypes.func,
    selectedInfo: PropTypes.object,
    fscanBillNos: PropTypes.string,
    mode: PropTypes.string
};