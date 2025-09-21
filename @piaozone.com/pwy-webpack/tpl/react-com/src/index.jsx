import React from 'react';
import PropTypes from 'prop-types';

class MyCom extends React.Component {
    render() {
        let defaultCls = ['pwy-render-in-body'];
        if (this.props.className) {
            defaultCls = defaultCls.concat(this.props.className.split(' '));
        }
        const style = this.props.style || {};
        return (
            <div className={defaultCls.join(' ')} style={style}>
                {this.props.children}
            </div>
        );
    }
}

MyCom.propTypes = {
    children: PropTypes.object,
    style: PropTypes.object,
    className: PropTypes.string
};

export default MyCom;