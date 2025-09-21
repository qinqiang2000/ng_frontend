import React from 'react';
import ImageList from '../imageList';
import ListPage from '../components/listPage/index';
import { sortByRegion } from '@piaozone.com/process-image';
import { groupList } from '../utils/tools';
import PropTypes from 'prop-types';

export default function Attaches({ showList, attachment, ...props }) {
    const attachList = groupList(attachment).map((list) => { //附件列表
        return sortByRegion(list);
    });
    const attachImages = attachList.map((item) => { //附件影像
        let areaInfo = [];
        for (const area of item) {
            areaInfo = areaInfo.concat(area.areaInfo);
        }
        const data = {
            url: item[0].snapshotUrl,
            attachmentType: item[0].attachmentType,
            pdfUrl: item[0].localUrl || '',
            extName: item[0].extName || '',
            areaInfo
        };
        return data;
    });
    const { clientWidth, clientHeight } = document.body;
    return (
        <div className='attachContent'>
            {
                !showList ? (
                    attachImages.length > 0 ? (
                        <ImageList
                            list={attachImages}
                            width={clientWidth - 40}
                            height={clientHeight - 146}
                            changeTabIndex={props.changeTabIndex}
                            onCheckPdf={props.onCheckPdf}
                        />
                    ) : null
                ) : (
                    <ListPage
                        list={attachList}
                        name='attachList'
                        onDetailClick={props.onDetailClick}
                        rejectState={props.rejectState}
                    />
                )
            }
        </div>
    );
}

Attaches.propTypes = {
    showList: PropTypes.bool,
    attachment: PropTypes.array,
    onDetailClick: PropTypes.func,
    changeTabIndex: PropTypes.func,
    onCheckPdf: PropTypes.func,
    rejectState: PropTypes.bool
};
