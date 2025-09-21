/*eslint-disable*/
import React from 'react';
import noImg from './img/fileIcons/no-img.png';
import { Spin } from 'antd';
import { LazyLoadImage } from 'react-lazy-load-image-component';

class Img extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            src: props.src || '',
            outterStyle: props.outterStyle || {},
            style: props.style || {},
            loading: true,
            err: false
        };
    }
    onLoadErr = () => {
        this.setState({ src: noImg, loading: false, err: true });
        typeof this.props.onError === 'function' && this.props.onError();
    };
    onLoaded = () => {
        this.setState({ loading: false, err: false });
        typeof this.props.onLoadSuccess === 'function' && this.props.onLoadSuccess();
    };

    getStylCls = (angle) => {
        const absAngle = Math.abs(angle);
        const isEnd = new Set([90, 270]).has(absAngle);
        let width = 0,height=0;
        if (isEnd) {
            width = 60;
            height = 'auto';
        } else {
            width = 'auto';
            height = 60;
        }
        return {
            width,
            height
        }
    };
    render() {
        const { loading, err } = this.state;
        const { src, localUrl = '', style, outterStyle, angle } = this.props;
        // console.log('style------fan-----', style);
        const { width, height } =  this.getStylCls(angle);
        return (
            <div
                style={{
                    position: 'relative',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: '100%',
                    height: '100%',
                    ...outterStyle
                }}
            >
                {
                    loading ? <Spin size='small' style={{ position: 'absolute', left: 65, top: 50 }} /> : null
                }
                {
                    err ? (
                        <div style={{ width: 140, height: 'auto'}}>
                            <LazyLoadImage
                                src={src || localUrl}
                                style={{ width: 140, height: 'auto', background: '#fff' }}
                                effect='blur'
                            />
                        </div>
                    ) : (
                        <div  style={{ ...style }}>
                            <LazyLoadImage
                                src={src || localUrl}
                                onError={this.onLoadErr}
                                onLoad={this.onLoaded}
                                style={{ width, height, maxWidth: 140 }}
                                effect='blur'
                            />
                        </div>
                    )
                }
            </div>
        );
    }
}

export default Img;
