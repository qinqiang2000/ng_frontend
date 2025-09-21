import React from 'react';
import Slider from './slider/index.jsx';
import Icon from '@piaozone.com/icon';
import PropTypes from 'prop-types';

function BottomBtns({ index, total, isShowBtns, onZoom, onReset, disabled, minZoom, maxZoom, onRotate, largerRatio, onExit, displayFlag = 'showImage' }) {
    const isOtherType = displayFlag === 'showOther';
    const opDisabled = disabled || isOtherType;
    const iconStyle = {
        fontSize: 16,
        color: opDisabled ? '#cecece' : '#3598ff',
        cursor: opDisabled ? 'default' : 'pointer',
        display: 'inline-block'
    };
    return (
        <div
            className='btns'
            style={{ display: isShowBtns ? 'block' : 'none' }}
        >
            {
                typeof index !== 'undefined' ? (
                    <span style={{ color: '#3598ff', marginRight: 15 }}>第{index + 1}/{total}张</span>
                ) : null
            }
            <Icon
                type='undo'
                rotate={30}
                style={iconStyle}
                onClick={opDisabled ? () => f => f : () => onRotate(90)}
            />

            <Slider
                value={largerRatio * 100}
                style={{ width: 200, margin: '0 15px', display: 'inline-block' }}
                min={minZoom}
                max={maxZoom}
                disabled={opDisabled}
                onChange={onZoom}
                step={1}
            />

            <Icon
                type='redo'
                style={iconStyle}
                onClick={opDisabled ? () => f => f : () => onRotate(-90)}
            />

            {
                opDisabled ? (
                    <a href='javascript:;' className='disabled' style={{ fontSize: 14, marginLeft: 10, cursor: 'default' }}>还原</a>
                ) : (
                    <a href='javascript:;' onClick={onReset} style={{ fontSize: 14, marginLeft: 10 }}>还原</a>
                )
            }

            {
                typeof onExit === 'function' ? (
                    <a href='javascript:;' onClick={onExit} style={{ fontSize: 14, marginLeft: 10 }}>退出</a>
                ) : null
            }
        </div>
    );
}

BottomBtns.propTypes = {
    onZoom: PropTypes.func.isRequired,
    onReset: PropTypes.func.isRequired,
    onRotate: PropTypes.func.isRequired,
    isShowBtns: PropTypes.bool,
    disabled: PropTypes.bool,
    index: PropTypes.number,
    total: PropTypes.number,
    onExit: PropTypes.func,
    minZoom: PropTypes.number,
    maxZoom: PropTypes.number,
    largerRatio: PropTypes.number,
    displayFlag: PropTypes.string
};

export default BottomBtns;