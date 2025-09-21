import React from 'react';
import ImageList from '../imageList';
import ListPage from '../components/listPage/index';
import { sortByRegion } from '@piaozone.com/process-image';
import { groupList } from '../utils/tools';
import PropTypes from 'prop-types';

export default function PaperInvoices({ showList, paperInvoice, ...props }) {
    const paperList = groupList(paperInvoice).map((list) => { //纸票列表
        return sortByRegion(list);
    });
    const paperImages = paperList.map((item) => { //纸票影像
        let areaInfo = [];
        for (const area of item) {
            areaInfo = areaInfo.concat(area.areaInfo);
        }
        return {
            rotateDeg: item[0].rotationAngle || 0,
            url: item[0].snapshotUrl,
            fileType: item[0].fileType,
            pdfUrl: item[0].pdfurl || item[0].localUrl || '',
            areaInfo
        };
    });
    const { clientWidth, clientHeight } = document.body;
    return (
        <div className='paperContent'>
            {
                !showList ? (
                    paperImages.length > 0 ? (
                        <ImageList
                            list={paperImages}
                            width={clientWidth - 40}
                            height={clientHeight - 146}
                            changeTabIndex={props.changeTabIndex}
                            onCheckPdf={props.onCheckPdf}
                        />
                    ) : null
                ) : (
                    <ListPage
                        list={paperList}
                        name='attachList'
                        onDetailClick={props.onDetailClick}
                        rejectState={props.rejectState}
                    />
                )
            }
        </div>
    );
}

PaperInvoices.propTypes = {
    showList: PropTypes.bool,
    paperInvoice: PropTypes.array,
    onDetailClick: PropTypes.func,
    changeTabIndex: PropTypes.func,
    onCheckPdf: PropTypes.func,
    rejectState: PropTypes.bool
};