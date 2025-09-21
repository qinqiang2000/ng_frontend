import React from 'react';
import ReactDom from 'react-dom';
import PropTypes from 'prop-types';
import './style.css';
import immutable from 'immutable';
import CarouseItem from './carouseItem';
class PwyCarouse extends React.Component {
    constructor(props) {
        super(...arguments);
        this.state = {
            leftOffset: 0,
            transitionTime: 300
        };
    }

    componentWillReceiveProps = async() => {
        this.setState({
            leftOffset: 0,
            transitionTime: 300
        });
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (immutable.is(immutable.fromJS(this.props), immutable.fromJS(nextProps)) &&
        (this.state.leftOffset === nextState.leftOffset && this.state.transitionTime === nextState.transitionTime)) {
            return false;
        }
        return true;
    }

    onSwiper = (e, { deltaMoveX, deltaMoveY }) => {
        if (!this.props.disabledSwiper) {
            this.setState({
                leftOffset: deltaMoveX,
                transitionTime: 0
            });
            typeof this.props.onSwiper === 'function' && this.props.onSwiper(e, { deltaMoveX, deltaMoveY });
        }
    }

    onSwiperEnd = (e) => {
        if (!this.props.disabledSwiper) {
            const { leftOffset } = this.state;
            const index = this.props.index;
            let nextActiveIndex = index;
            let direct = '';
            if (leftOffset < -80) {
                direct = 'next';
                nextActiveIndex = index + 1 < this.props.children.length ? index + 1 : index;
            } else if (leftOffset > 80) {
                direct = 'prev';
                nextActiveIndex = index - 1 >= 0 ? index - 1 : index;
            }
            typeof this.props.onSwiperEnd === 'function' && this.props.onSwiperEnd(e, nextActiveIndex, direct);
        }
    }

    createCarouseItem = (showType, children) => {
        const itemStyle = { width: this.props.itemWidth };
        if (showType === 'image') {
            return children.map((item) => {
                return (
                    <div className='pwyCarouseItem' style={itemStyle} key={item.key}>
                        {
                            React.cloneElement(item, {
                                onSwiperEnd: this.onSwiperEnd,
                                onSwiper: this.onSwiper
                            })
                        }
                    </div>
                );
            });
        } else {
            let swiperProps = {};
            if (!this.props.disabledSwiper) {
                swiperProps = {
                    onSwiper: this.onSwiper,
                    onSwiperEnd: this.onSwiperEnd
                };
            }
            return children.map((item) => {
                return (
                    <CarouseItem style={itemStyle} key={item.key} {...swiperProps}>
                        {item}
                    </CarouseItem>
                );
            });
        }
    }

    render() {
        let defaultCls = ['pwyCarouse'];
        if (this.props.className) {
            defaultCls = defaultCls.concat(this.props.className.split(' '));
        }
        const { leftOffset = 0, transitionTime = 500 } = this.state;
        const { itemWidth, children, style = {}, disabledDots, index = 0, showType = 'image', renderInBody } = this.props;
        const wapperStyle = { width: children.length * itemWidth, left: -index * itemWidth + leftOffset, transition: 'left ' + transitionTime + 'ms' };

        const result = (
            <div style={style} className={defaultCls.join(' ')}>
                <div className='pwyCarouseWapper clearfix' style={wapperStyle}>
                    {this.createCarouseItem(showType, children)}
                </div>
                {
                    !disabledDots ? (
                        <div className='dots'>
                            {
                                children.map((item, i) => {
                                    return (
                                        <span
                                            className={i === index ? 'active dot' : 'dot'}
                                            key={i}
                                        >
                                            &nbsp;
                                        </span>
                                    );
                                })
                            }
                        </div>
                    ) : null
                }
            </div>
        );

        if (renderInBody) {
            return ReactDom.createPortal(result, document.body);
        } else {
            return result;
        }
    }
}

PwyCarouse.propTypes = {
    itemWidth: PropTypes.number.isRequired,
    onSwiperEnd: PropTypes.func.isRequired,
    children: PropTypes.array.isRequired,
    index: PropTypes.number.isRequired,
    disabledSwiper: PropTypes.bool,
    onSwiper: PropTypes.func,
    showType: PropTypes.string,
    style: PropTypes.object,
    className: PropTypes.string,
    disabledDots: PropTypes.bool,
    renderInBody: PropTypes.bool
};

export default PwyCarouse;