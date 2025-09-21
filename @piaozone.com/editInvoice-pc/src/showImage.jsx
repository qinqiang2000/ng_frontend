//显示混贴图像

import React from 'react';
import { Spin } from 'antd';
import PropTypes from 'prop-types';

class ShowImage extends React.Component {
    constructor(props) {
        super(...arguments);
        this.state = {
            redirectShowImage: false,
            loading: true
        };
    }

    componentDidMount() {
        this.freshImg(this.props);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.src !== this.props.src || nextProps.pixel !== this.props.pixel ||
            nextProps.region !== this.props.region || nextProps.orientation !== this.props.orientation
        ) {
            this.freshImg(nextProps);
        }
    }

    freshImg(opt) {
        this.canvas = document.getElementById('imgCanvas');
        if (this.canvas && this.canvas.getContext) {
            this.ctx = this.canvas.getContext('2d');
        }

        let pixel = opt.pixel;
        let region = opt.region;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        const orientation = -opt.orientation || 0;
        const imgSrc = opt.src || '';

        const cos = Math.cos;
        const sin = Math.sin;
        const maxWidth = 980;
        const maxHeight = 550;
        const pi = parseFloat(Math.PI / 180);

        let deg = Math.abs(orientation);
        deg = deg % 360;

        let maxRw = maxWidth;
        let maxRh = maxHeight;

        if (deg === 0 || deg === 180) {
            maxRw = maxWidth;
            maxRh = maxHeight;
        } else if (deg === 90 || deg === 270) {
            maxRw = maxHeight;
            maxRh = maxWidth;
        } else if ((deg > 0 && deg < 90) || (deg > 180 && deg < 270)) {
            maxRw = maxWidth * cos(deg * pi) + maxHeight * sin(deg * pi);
            maxRh = maxHeight * cos(deg * pi) + maxWidth * sin(deg * pi);
        } else if ((deg > 90 && deg < 180) || (deg > 270 && deg < 360)) {
            maxRw = maxHeight * cos(deg * pi) + maxWidth * sin(deg * pi);
            maxRh = maxWidth * cos(deg * pi) + maxHeight * sin(deg * pi);
        }

        if (imgSrc) {
            this.setState({
                loading: true
            });
            const img = new Image();
            img.onload = () => {
                if (this.ctx) {
                    const imgWidth = img.width;
                    const imgHeight = img.height;
                    var sx, sy, sw, sh;

                    if (region && pixel) {
                        pixel = pixel.split(',');
                        let originWidth = parseInt(pixel[0]);
                        let originHeight = parseInt(pixel[1]);
                        if ((imgWidth > imgHeight && originWidth < originHeight) || (imgWidth < imgHeight && originWidth > originHeight)) {
                            originWidth = parseInt(pixel[1]);
                            originHeight = parseInt(pixel[0]);
                        }

                        const wRate = parseFloat(imgWidth / originWidth);
                        const hRate = parseFloat(imgHeight / originHeight);

                        region = region.replace(/[[\]]/g, '').split(',');
                        sx = parseInt(region[0]) * wRate;
                        sy = parseInt(region[1]) * hRate;
                        sw = parseInt(region[2]) * wRate - sx;
                        sh = parseInt(region[3]) * hRate - sy;
                    } else {
                        sx = 0;
                        sy = 0;
                        sw = img.width;
                        sh = img.height;
                    }

                    var rate = parseFloat(sw / sh);

                    var rw = sw;
                    var rh = sh;

                    this.ctx.save();
                    this.ctx.translate(maxWidth / 2, maxHeight / 2);
                    this.ctx.rotate(orientation * Math.PI / 180);

                    if (rw > rh) {
                        rh = maxRh;
                        rw = rate * rh;
                    } else {
                        rw = maxRw;
                        rh = rw / rate;
                    }

                    if (rw > maxRw) {
                        rw = maxRw;
                        rh = rw / rate;
                    } else if (rh > maxRh) {
                        rh = maxRh;
                        rw = rh * rate;
                    }


                    this.ctx.translate(-rw / 2, -rh / 2);
                    this.ctx.drawImage(img, sx, sy, sw, sh, 0, 0, rw, rh);
                    this.ctx.restore();

                    this.setState({
                        loading: false
                    });
                } else {
                    this.setState({
                        redirectShowImage: true,
                        imgSrc: imgSrc,
                        loading: false
                    });
                }
            };

            img.onerror = () => {
                this.setState({
                    descrption: '获取图像失败！',
                    loading: false
                });
            };
            img.src = imgSrc;
        } else {
            const imgSrc = opt.src || '';
            this.setState({
                redirectShowImage: true,
                imgSrc: imgSrc,
                loading: false
            });
        }
    }

    componentWillUnmount() {
        this.canvas = null;
        this.ctx = null;
    }

    render() {
        const { descrption, redirectShowImage, loading } = this.state;

        if (descrption) {
            return <p style={{ textAlign: 'center' }}>{descrption}</p>;
        } else if (redirectShowImage) {
            return <img src={this.props.src} style={{ transform: 'rotate(' + this.props.orientation + 'deg)' }} />;
        } else {
            return (
                <div style={{ width: 980, height: 550, overflow: 'hidden', position: 'relative' }}>
                    <canvas id='imgCanvas' width='980' height='530' style={{ position: 'absolute', left: 0, top: 10 }} />
                    {
                        loading ? (
                            <Spin style={{ position: 'absolute', left: '50%', top: '50%' }} />
                        ) : null
                    }
                </div>
            );
        }
    }
}

ShowImage.propTypes = {
    src: PropTypes.string.isRequired,
    pixel: PropTypes.string,
    region: PropTypes.string,
    orientation: PropTypes.string
};

export default ShowImage;