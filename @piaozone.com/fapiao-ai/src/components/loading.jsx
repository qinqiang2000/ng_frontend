import React from 'react';
import PropTypes from 'prop-types';
import '../css/loading.less';

const Loading = ({ loading }) => {
    if (loading) {
        return (
            <div className='box-loader-overlay'>
                <div className='dot-loader'>
                    <span className='dot dot1'>&nbsp;</span>
                    <span className='dot dot2'>&nbsp;</span>
                    <span className='dot dot3'>&nbsp;</span>
                </div>
            </div>
        );
    }
    return null;
};

Loading.propTypes = {
    loading: PropTypes.bool
};

export default Loading;
