import React from 'react';
import ReactDom from 'react-dom';
import PropTypes from 'prop-types';
/* eslint-disable */
export default class RenderInBody extends React.Component {
    constructor(props) {
        super(props);

        this.popup = document.createElement('div');
        const layerStyle = props.layerStyle;
        if (layerStyle) {
            for (const k in layerStyle) {
                if (layerStyle.hasOwnProperty(k)) {
                    const nk = k.replace(/([A-Z])/g, function(match) {
                        return '-' + match.toLocaleLowerCase();
                    });
                    this.popup.style[nk] = layerStyle[k];
                }
            }
        }
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

RenderInBody.prototype = {
    layerStyle: PropTypes.object,
    children: PropTypes.element.isRequired
};