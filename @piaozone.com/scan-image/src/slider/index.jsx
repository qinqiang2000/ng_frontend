
import React from 'react';
import './style.less';
import PropTypes from 'prop-types';

class Slider extends React.Component {
    componentDidMount() {
        this._isMounted = true;
        window && window.addEventListener('mouseup', this.onMouseUp);
        window && window.addEventListener('mousemove', this.onMouseMove);
    }

    componentWillUnmount() {
        this._isMounted = false;
        window && window.removeEventListener('mouseup', this.onMouseUp);
        window && window.removeEventListener('mousemove', this.onMouseMove);
    }

    onMouseDown = (e) => {
        if (this._isMounted && !this.props.disabled) {
            this.mouseDownFlag = true;
            this.startMoveX = e.clientX;
            this.oldValue = this.props.value;
        }
    }

    onMouseMove = (e) => {
        if (this._isMounted && this.mouseDownFlag) {
            const { min = 10, max = 500 } = this.props;
            const width = this.props.style.width || 200;
            const deltaMoveX = e.clientX - this.startMoveX;

            const deltaValue = deltaMoveX * parseFloat((max - min) / width);
            const newValue = this.oldValue + deltaValue;
            if (newValue > max) {
                this.props.onChange(max);
            } else if (newValue < min) {
                this.props.onChange(min);
            } else {
                this.props.onChange(newValue);
            }
        }
    }

    onMouseUp = (e) => {
        this.mouseDownFlag = false;
        this.oldValue = this.props.value;
    }

    render() {
        const { value = 0, style = {}, max = 500, disabled } = this.props;
        const percent = parseFloat(value / max) * 100;
        return (
            <div className={disabled ? 'pwy-slider disabled' : 'pwy-slider'} style={style}>
                <div className='pwy-slider-rail' />
                <div className='pwy-slider-track' style={{ left: 0, width: percent + '%' }} />
                <div className='pwy-slider-step' />
                <div
                    className='pwy-slider-handle' style={{ left: percent + '%', cursor: disabled ? 'default' : 'pointer' }}
                    onMouseDown={this.onMouseDown}
                />
                <div className='pwy-slider-mark' />
            </div>
        );
    }
}


Slider.propTypes = {
    value: PropTypes.number,
    style: PropTypes.object,
    min: PropTypes.number,
    max: PropTypes.number,
    width: PropTypes.number,
    disabled: PropTypes.bool,
    onChange: PropTypes.func
};

export default Slider;