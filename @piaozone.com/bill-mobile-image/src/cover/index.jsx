import React from 'react';
import PropTypes from 'prop-types';
import ScanImage from '@piaozone.com/mobile-scan-image';
import './style.less';

export default function Cover({ cover, width, height }) {
    let src = '';
    if (cover.length > 0) {
        src = cover[0].snapshotUrl || '';
    }
    return (
        <div className='coverContent'>
            <div className='innerContent'>
                <ScanImage
                    key=''
                    id=''
                    width={width}
                    height={height}
                    areaInfo=''
                    displayFlag=''
                    visible={true}
                    imgSrc={src}
                />

            </div>
        </div>
    );
}

Cover.propTypes = {
    cover: PropTypes.array,
    width: PropTypes.number,
    height: PropTypes.number
};