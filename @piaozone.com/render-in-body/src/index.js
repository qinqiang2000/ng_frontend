import React from 'react';
import ReactDom from 'react-dom';
import PropTypes from 'prop-types';

class RenderInBody extends React.Component {
    constructor(props) {
        super(props);
        let defaultCls = ['pwy-render-in-body'];
        this.popup = document.createElement('div');
        const layerStyle = props.layerStyle;
        if (layerStyle) {
            Object.keys(layerStyle).forEach((k) => {
                const nk = k.replace(/([A-Z])/g, function(match) {
                    return '-' + match.toLocaleLowerCase();
                });
                this.popup.style[nk] = layerStyle[k];
            });
        }
        if (props.className) {
            defaultCls = defaultCls.concat(props.className.split(' '));
        }
        this.popup.className = defaultCls.join(' ');
    }

    componentDidMount() { //新建一个div标签并塞进body
        document.body.appendChild(this.popup);
    }

    componentWillUnmount() { //在组件卸载的时候，保证弹层也被卸载掉
        document.body.removeChild(this.popup);
    }

    render() {
        return ReactDom.createPortal(this.props.children, this.popup);
    }
}

RenderInBody.propTypes = {
    children: PropTypes.object,
    layerStyle: PropTypes.object,
    className: PropTypes.string
};

export default RenderInBody;