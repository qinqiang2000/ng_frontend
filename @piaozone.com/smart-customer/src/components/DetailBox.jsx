import React, { useEffect, useState } from 'react';
import '../css/detail.less';
import Loading from './loading';
import PropTypes from 'prop-types';

const DetailBox = (props = {}) => {
    const [loading, setLoading] = useState(true);
    const iframeOnload = () => {
        setTimeout(() => {
            setLoading(false);
        }, 300); // 你可以根据实际情况调整这个延迟
    };
    useEffect(() => {
        setLoading(true);
    }, [props.detailInfo?.link]);
    return (
        <div
            className='smartCustomerDetailBox'
            style={{
                width: props.detailWidth,
                height: props.height,
                right: props.right
            }}
        >
            <div className='detailHeader'>
                <span className='close' onClick={props.onClose}>&nbsp;</span>
            </div>
            <Loading loading={loading} />
            {
                props.detailInfo?.link && (
                    <div
                        className='outIframe'
                        style={{ width: props.detailWidth - 10 }}
                    >
                        <div className='ifameFix'>&nbsp;</div>
                        <iframe
                            title={props.detailInfo.title}
                            style={{ opacity: loading ? 0 : 1, width: props.detailWidth - 12 }}
                            className='detailBoxIframe'
                            frameBorder='0'
                            border='0'
                            height='100%'
                            src={`${props.detailInfo?.link.split('|')[0]}?view=doc_embed`}
                            onLoad={iframeOnload}
                        />
                    </div>
                )
            }
        </div>
    );
};

DetailBox.propTypes = {
    detailInfo: PropTypes.object,
    detailWidth: PropTypes.number,
    right: PropTypes.number,
    onClose: PropTypes.func,
    height: PropTypes.number
};

export default DetailBox;
