import React from 'react';
import PropTypes from 'prop-types';
import ReactEvents from '@piaozone.com/react-events';

class CarouseItem extends React.Component {
    componentWillMount() {
        this.reactEvents = new ReactEvents({
            onTouchMove: this.onTouchMove,
            onTouchEnd: this.onTouchEnd
        });
    }

    onTouchMove = (e, opt = {}) => {
        if (typeof this.props.onSwiper === 'function') {
            this.props.onSwiper(e, opt);
        }
    }

    // 拖动结束事件
    onTouchEnd = (e) => {
        if (typeof this.props.onSwiperEnd === 'function') {
            this.props.onSwiperEnd(e);
        }
    }

    render() {
        const toucheEvents = {
            onTouchStart: this.reactEvents.onTouchStart,
            onTouchMove: this.reactEvents.onTouchMove,
            onTouchEnd: this.reactEvents.onTouchEnd
        };

        const cls = ['pwyCarouseItem'];
        if (this.props.className) {
            cls.push(this.props.className);
        }

        return (
            <div className={cls.join(' ')} style={this.props.style} {...toucheEvents}>
                {this.props.children}
            </div>
        );
    }
}

CarouseItem.propTypes = {
    children: PropTypes.object.isRequired,
    disabledSwiper: PropTypes.bool,
    className: PropTypes.string,
    style: PropTypes.object,
    onSwiperEnd: PropTypes.func,
    onSwiper: PropTypes.func
};

export default CarouseItem;


