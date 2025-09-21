//显示混贴图像
import React from 'react';
import PropTypes from 'prop-types';
import { Spin } from 'antd';
import { cuteImage, loadImage, isShowCanvas } from '$commons/utils/imageTools';
import { changeKingdeeUrl } from '$commons/utils/tools';

class ShowImage extends React.Component {
    constructor(props) {
        super(...arguments);
        this.state = {
            redirectShowImage: false,
            loading: true
        };
    }

    async componentDidMount() {
        this._isAmounted = true;
        const pixel = this.props.pixel;
        const region = this.props.region;
        const orientation = this.props.orientation;
        const imgSrc = changeKingdeeUrl(this.props.src);
        const loadRes = await loadImage(imgSrc);
        if (loadRes.errcode !== '0000') {
            this.setState({
                descrption: '获取图像失败！',
                loading: false
            });
        } else {
            if (this.props.redirectShowImage || !isShowCanvas(pixel, region, orientation)) {
                this.setState({
                    redirectShowImage: true,
                    imgSrc: imgSrc,
                    loading: false
                });
            } else {
                const res = await cuteImage({ imgSrc: imgSrc, imgObj: loadRes.imgObj, pixel, region, orientation, canvasId: 'imgCanvas' });
                if (res.errcode !== '0000') {
                    this.setState({
                        redirectShowImage: true,
                        imgSrc: imgSrc,
                        loading: false
                    });
                } else {
                    this.setState({
                        loading: false
                    });
                }
            }
        }
    }

    componentWillUnmount() {
        this._isAmounted = false;
        this.canvas = null;
        this.ctx = null;
    }

    render() {
        const { descrption, loading } = this.state;
        const { height, clientWidth = 880 } = this.props;
        const redirectShowImage = this.state.redirectShowImage;
        const showCanvas = isShowCanvas(this.props.pixel, this.props.region, this.props.orientation);

        if (descrption) {
            return <p style={{ textAlign: 'center' }}>{descrption}</p>;
        } else if (redirectShowImage || !showCanvas) {
            if (loading) {
                return <Spin style={{ position: 'absolute', left: '50%', top: '50%' }} />;
            } else {
                return <img src={changeKingdeeUrl(this.props.src)} style={{ maxHeight: height }} />;
            }
        } else {
            return (
                <div style={{ width: '100%', height: height || 450, overflow: 'hidden', position: 'relative' }}>
                    <canvas
                        id='imgCanvas'
                        width={(clientWidth - 20).toString()}
                        height={height ? height.toString() : '450'}
                        style={{ position: 'absolute', left: 0, top: 0 }}
                    />
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
    pixel: PropTypes.string,
    region: PropTypes.string,
    orientation: PropTypes.number,
    src: PropTypes.string,
    height: PropTypes.number,
    redirectShowImage: PropTypes.number,
    clientWidth: PropTypes.number
};

export default ShowImage;