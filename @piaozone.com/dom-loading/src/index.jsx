import React from 'react';
import './style.less';
import PropTypes from 'prop-types';
class Loading extends React.Component {
    constructor() {
        super(...arguments);
        const { loading, loadTxt } = this.props;
        this.state = {
            loading,
            loadTxt
        };
    }

    render() {
        const { loading, loadTxt } = this.props;
        return (
            <div>
                {
                    loading ? (
                        <div className='custom-loading'>
                            <div className='loadTxt'>正在加载中</div>
                            <div className='loading-box'>
                                <div />
                                <div />
                                <div />
                                <div />
                            </div>
                        </div>
                    ) : (
                        <div className='custom-loading'>
                            <span className='loadTxt'>{loadTxt}</span>
                        </div>
                    )
                }
            </div>
        );
    }
}

Loading.propTypes = {
    loading: PropTypes.bool,
    loadTxt: PropTypes.string
};
export default Loading;
