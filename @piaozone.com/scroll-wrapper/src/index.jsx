
import React from 'react';
import BScroll from 'better-scroll';
import PropTypes from 'prop-types';
import './style.css';

class ScrolWrapper extends React.Component {
    constructor(props) {
        super(props);
        this._isMounted = false;
        this.scrollListId = 'id' + ((+new Date()) + '' + Math.random()).replace('.', '');
        this.scrollY = 0;
        this.scrollX = 0;
    }

    componentDidMount() {
        this._isMounted = true;
        this.scrollObj = new BScroll('#' + this.scrollListId, {
            click: false,
            bounce: false,
            mouseWheel: {
                speed: 20,
                invert: false,
                easeTime: 300
            },
            pullDownRefresh: false,
            pullUpLoad: false,
            scrollbar: {
                fade: false,
                interactive: true // 1.8.0 新增
            }
        });


        this.scrollObj.on('scroll', (pos) => {
            this.scrollY = pos.y;
            this.scrollX = pos.x;
        });

        if (typeof this.props.onMounted === 'function') {
            this.props.onMounted(this.changeScrollLoc, this.scrollObj);
        }
    }

    componentWillUnmount() {
        this._isMounted = false;
        if (this.scrollObj) {
            this.scrollObj.on('scroll', null);
            this.scrollObj = null;
        }
    }

    componentDidUpdate() {
        if (this._isMounted && this.scrollObj) {
            this.scrollObj.refresh();
            if (!this.props.disabledKeepLocation && (this.scrollY !== 0 || this.scrollX !== 0)) {
                this.changeScrollLoc(this.scrollY, this.scrollX);
            }
        }
    }

    changeScrollLoc = (newScrollY = 0, newScrollX = 0, time = 10) => {
        if (this.scrollObj) {
            this.scrollY = newScrollY;
            this.scrollX = newScrollX;
            if (window.isIeBrowser == '1') { //ie9
                this.scrollObj.scrollTo(newScrollX, newScrollY); //保持之前位置不变
            } else {
                this.scrollObj.scrollTo(newScrollX, newScrollY, time, 'none'); //保持之前位置不变
            }
        }
    }

    render() {
        const { children, className = '', width, height } = this.props;
        const style = {
            overflow: 'hidden',
            position: 'relative'
        };

        if (typeof width === 'number') {
            style.width = width;
        }

        if (typeof height === 'number') {
            style.height = height;
        }
        return (
            <div className={className + ' pwyScrollWapper'} style={{ ...style, ...this.props.style }} id={this.scrollListId}>
                {children}
            </div>
        );
    }
}

ScrolWrapper.propTypes = {
    style: PropTypes.object,
    children: PropTypes.object,
    width: PropTypes.number,
    height: PropTypes.number,
    className: PropTypes.string,
    onMounted: PropTypes.object,
    disabledKeepLocation: PropTypes.bool
};

export default ScrolWrapper;