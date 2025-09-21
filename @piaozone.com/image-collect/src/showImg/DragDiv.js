/*eslint-disable*/
import React from 'react';

class DragDiv extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            dragging: false,
            startTop: 0, // top is a Key Word in Chrome and Opera
            startLeft: 0,
            dragPosY: 0,
            dragPosX: 0,
            style: {
                position: 'relative',
                top: 0,
                left: 0
            },
            ...props
        };
    }

    componentWillReceiveProps(nextProps, nextContext) {
        this.setState({
            ...this.state,
            ...nextProps
        });
    }

    trimPX = (_px) => {
        if (_px == null || _px === '') return 0;
        if (typeof _px === 'number') {
            return _px;
        }
        return parseInt(_px.substr(0, _px.lastIndexOf('px')), 10);
    };

    mousedown = (event) => {
        // start moving image
        let currentTarget = event.currentTarget;
        let dragging = true;
        let startTop = this.trimPX(currentTarget.style.top);
        let startLeft = this.trimPX(currentTarget.style.left);
        let dragPosX = this.trimPX(event.pageX);
        let dragPosY = this.trimPX(event.pageY);
        this.setState({
            ...this.state,
            dragging,
            startTop,
            startLeft,
            dragPosX,
            dragPosY
        });
        event.preventDefault(); // disable default behavior of browser
    };

    mousemove = (event) => {
        // moving image
        if (this.state.dragging) {
            let lx = this.state.startLeft + (event.pageX - this.state.dragPosX);
            let tx = this.state.startTop + (event.pageY - this.state.dragPosY);

            let style = {
                ...this.state.style,
                left: lx,
                top: tx
            };
            this.setState({
                ...this.state,
                style
            });
        }
        event.preventDefault();
    };

    mouseup = (event) => {
        // stop moving image
        this.setState({
            ...this.state,
            dragging: false
        });
        event.preventDefault();
    };

    render() {
        return (
            <div
                onMouseUp={this.mouseup}
                onMouseDown={this.mousedown}
                onMouseOver={this.mouseup}
                onMouseMove={this.mousemove}
                style={{ ...this.state.style }}
            >
                {this.props.children}
            </div>
        );
    }
}
export default DragDiv;
