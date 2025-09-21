import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import '../css/fapiaoAiTemplate.less';
import useWindowSize from './windowSize';
import { setDisplay } from '../store/fapiaoAiTemplate';
import Loading from './loading';

const FapiaoAiTemplate = () => {
    const templateUrl = useSelector((state) => state.fapiaoAiTemplate.templateUrl);
    const displayTemplate = useSelector((state) => state.fapiaoAiTemplate.displayTemplate);
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(true);
    const { templateWidth } = useWindowSize();
    if (!templateUrl || !displayTemplate) {
        return null;
    }

    const iframeOnload = () => {
        setLoading(false);
    };

    return (
        <div className='fapiaoAiTemplate' style={{ width: templateWidth, right: 0, height: '100%' }}>
            <div className='fapiaoAiTemplate-close'>
                <div className='close-icon' onClick={() => dispatch(setDisplay(false))}></div>
            </div>
            <Loading loading={loading} />
            <iframe
                border='0'
                frameBorder='0'
                src={templateUrl}
                onLoad={iframeOnload}
            />
        </div>
    );
};

export default FapiaoAiTemplate;