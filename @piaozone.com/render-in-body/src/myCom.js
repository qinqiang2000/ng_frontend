import React from 'react';
import PropTypes from 'prop-types';

class RenderInBody extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        let defaultCls = ['pwy-render-in-body'];
        if (this.props.className) {
            defaultCls = defaultCls.concat(this.props.className.split(' '));
        }
        const layerStyle = this.props.layerStyle || {};
        return (
            <div className={defaultCls.join(' ')} style={layerStyle}>
                {this.props.children}
            </div>
        );
    }
}

RenderInBody.propTypes = {
    children: PropTypes.object,
    layerStyle: PropTypes.object,
    className: PropTypes.string
};

export default RenderInBody;