import React from 'react';
import ReactDom from 'react-dom';
import PropTypes from 'prop-types';
import './style.css';

class PwyCarouse extends React.Component {
    constructor(opt) {
        super(opt);
        this.state = {
            index: this.props.index || 0
        };
    }

    onChangeIndex = async(index) => {
        if (typeof this.props.onChangeIndex === 'function') {
            const flag = (await this.props.onChangeIndex(index)) || {};
            if (flag === true) {
                this.setState({
                    index
                });
            }
        } else {
            this.setState({
                index
            });
        }
    }

    render() {
        let defaultCls = ['pwyCarouse'];
        if (this.props.className) {
            defaultCls = defaultCls.concat(this.props.className.split(' '));
        }
        // const index = this.state.index || 0;
        const { children, style = {}, disabledDots, renderInBody, disabledHandlerIcon, index = 0 } = this.props;
        const len = children.length;
        const wapperStyle = { width: len * 100 + '%', left: -index * 100 + '%' };
        const itemStyle = { width: parseFloat(100 / len) + '%' };

        const result = (
            <div className={defaultCls.join(' ')} style={style}>
                <div className='pwyCarouseWapper clearfix' style={wapperStyle}>
                    {
                        children.map((item) => {
                            if (!item) {
                                return null;
                            };
                            return (
                                <div className='pwyCarouseItem' style={itemStyle} key={item.key}>
                                    {item}
                                </div>
                            );
                        })
                    }
                </div>
                {
                    len > 1 && !disabledHandlerIcon ? (
                        <>
                            <a onClick={() => this.onChangeIndex((index + len - 1) % len)} className='controlBtn prevBtn'>&nbsp;</a>
                            <a onClick={() => this.onChangeIndex((index + len + 1) % len)} className='controlBtn nextBtn'>&nbsp;</a>
                        </>
                    ) : null
                }
                {
                    !disabledDots && len > 1 ? (
                        <div className='dots'>
                            {
                                children.map((item, i) => {
                                    return (
                                        <span
                                            className={i === index ? 'active dot' : 'dot'}
                                            key={i}
                                            onClick={() => this.onChangeIndex(i)}
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
    children: PropTypes.array,
    style: PropTypes.object,
    className: PropTypes.string,
    onChangeIndex: PropTypes.func,
    index: PropTypes.string,
    disabledDots: PropTypes.bool,
    renderInBody: PropTypes.bool,
    disabledHandlerIcon: PropTypes.bool
};

export default PwyCarouse;