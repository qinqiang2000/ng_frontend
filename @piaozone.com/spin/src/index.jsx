import React from 'react';
import './style.less';

class Spin extends React.Component {
    render() {
        return (
            <div
                style={{ position: 'absolute', top: '50%', left: '50%', marginLeft: -16, marginTop: -30 }}
                className='pwy-spin pwy-spin-lg pwy-spin-spinning'
            >
                <span className='pwy-spin-dot pwy-spin-dot-spin'>
                    <i className='pwy-spin-dot-item'>&nbsp;</i>
                    <i className='pwy-spin-dot-item'>&nbsp;</i>
                    <i className='pwy-spin-dot-item'>&nbsp;</i>
                    <i className='pwy-spin-dot-item'>&nbsp;</i>
                </span>
            </div>
        );
    }
}

export default Spin;