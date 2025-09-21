import React from 'react';
import PropTypes from 'prop-types';
import { message, Modal, Progress } from 'antd';

const lang = {
    printData: []
};

class IframePrintImg extends React.Component {
    constructor(props) {
        super(...arguments);
        this._isMounted = false;
        this.hadLoadedNum = 0; //已经加载数量
        this.state = {
            loading: false,
            percent: 0,
            printData: props.printData || [], //待打印图片数组
            t: props.locale || 'zh-CN',
            originAngle: [], // 初始保存旋转角度都是0
            scales: [],
            imgLoad: [], //图片还未生成
            showPrintStatus: false,
            printTip: null //打印提示信息
        };
    }

    componentDidMount() {
        this._isMounted = true;
        const content = this.beforePrint(this.props.printData, this.props.printNums);
        if (content) {
            Modal.confirm({
                title: '温馨提示',
                content,
                cancelText: '取消',
                okText: '继续打印',
                onOk: () => {
                    this.printImg();
                },
                onCancel: () => {
                    this.printEnd();
                }
            });
        }
    }

    componentWillUnmount() {
        this._isMounted = false;
        // 清除图片加载超时计时器
        clearInterval(this.timer);
    }

    componentWillReceiveProps(nextProps) {
        const printData = nextProps.printData;
        // 有数据就弹出打印，打印完毕必须回调清空打印数据
        if (printData && this.props.printData !== printData && printData.length !== 0) {
            const printNums = nextProps.printNums;
            const content = this.beforePrint(printData, printNums);
            if (content) {
                this.setState({
                    showPrintStatus: true,
                    printTip: content
                });
            }
        }
    }

    continuePrint = () => { //继续打印
        this.hadLoadedNum = 0;
        this.setState({
            showPrintStatus: false,
            printData: lang.printData,
            printListOriginAngle: this.props.printListOriginAngle || [],
            percent: 0
        }, () => {
            this.printImg();
        });
    }

    beforePrint = (pData, printNums) => {
        if (pData.length === 0) {
            return '';
        }
        let errNum = 0;
        let successNum = 0;
        const nums = [];
        const printData = pData.filter((v, index) => {
            if (v && (/^(http|https):\/\//.test(v) || /^data:image\/png;base64,/.test(v))) {
                successNum++;
                return true;
            } else {
                if (printNums && v != 'error') {
                    nums.push(printNums[index].invoiceNo);
                }
                errNum++;
            }
        });
        if (printData.length === 0) {
            message.error('待打印资源链接丢失，请检查！');
            this.printEnd();
            return '';
        }
        let content = '确认打印?';
        if (errNum > 0) {
            content = `待打印的发票中，${errNum}张文件加载失败，是否继续打印剩余${successNum}张文件？`;
        }
        lang.printData = printData;
        return content;
    }

    // 打印图片
    printImg() {
        if (!this._isMounted) return;
        const { printData, printListOriginAngle } = this.state;
        // dom获取
        const iframe = document.getElementById('pwyPrintImgIframe');
        const doc = iframe.contentWindow.document;
        const head = doc.querySelectorAll('head')[0];
        // 隐藏页眉页脚 去除body的margin 纵向size: portrait;
        const styleHtml = `
            <style media='print'>@page { margin: 0mm; }</style>
            <style>body{ margin: 0; }</style>
        `;
        head.innerHTML = styleHtml;

        // 设置初始角度
        let originAngle = [];
        if (!printListOriginAngle?.length) {
            printData.forEach(() => {
                originAngle.push(0);
            });
        } else {
            originAngle = printListOriginAngle;
        }

        this.setState({ loading: true, originAngle });

        const length = printData.length;

        this.timer = setInterval(() => {
            this.setState({ percent: Math.floor(this.hadLoadedNum / length * 100) });
            // 每次都获取新的html片段
            if (this.hadLoadedNum === length) {
                // 渲染iframe
                // 获取最新的dom
                const el = document.getElementById('pwyPrintImgBox');
                doc.body.innerHTML = el.innerHTML;
                doc.close();
                clearInterval(this.timer);
                // 浏览器渲染时间
                setTimeout(() => {
                    this.setState({ loading: false }, () => { //防止图片绘制不全
                        this.showPrint(iframe);
                    });
                }, 1000);
            }
        }, 500);
    }

    // 获取iframe的焦点，从iframe开始打印
    showPrint(iframe) {
        // 兼容IE
        const iframeName = 'pwyPrintImgIframe';
        if (!!window.ActiveXObject || 'ActiveXObject' in window) {
            window.frames[iframeName].focus();
            window.frames[iframeName].print();
        } else {
            iframe.contentWindow.focus();
            iframe.contentWindow.print();
        }

        // 回调清空待打印数据
        this.printEnd();
    }

    // 打印结束
    printEnd() {
        this.setState({
            printData: [],
            originAngle: [], // 初始保存旋转角度都是0
            scales: [],
            imgLoad: [], //图片还未生成
            showPrintStatus: false
        });
        // 主页清空数据，避免一直回调打印
        if (typeof this.props.printEnd === 'function') this.props.printEnd();
    }

    handleImageLoaded = (e, index) => {
        const { originAngle } = this.state;
        const imgW = e.target.width;
        const imgH = e.target.height;
        const scale = parseFloat(imgW / imgH).toFixed(2);
        //width>height说明是横向的,需要旋转
        if (scale > 1) {
            originAngle[index] = 90;
            e.target.style.transform = 'rotate(90deg)';
            e.target.style.width = '100%';
        } else {
            if (originAngle[index] && originAngle[index] === 180) {
                e.target.style.transform = 'rotate(180deg)';
            } else {
                e.target.style.transform = 'rotate(0deg)';
            }
            e.target.style.height = '100%';
        }
        this.setState({ originAngle }, () => {
            this.hadLoadedNum++;
        });
    }

    handleImageErrored = (e, index) => {
        const { imgLoad } = this.state;
        imgLoad[index] = 'fail';
        this.setState({ imgLoad }, () => {
            this.hadLoadedNum++;
        });
    }

    render() {
        const { loading, percent, printData, imgLoad, printTip } = this.state;
        const { batchPrintResult } = this.props;
        let okText = '确定';
        let cancelText = '取消';
        if (batchPrintResult) {
            okText = '知悉以上信息，继续打印';
            cancelText = '取消打印';
        }
        const {
            boxStyle = {
                breakAfter: 'page',
                height: '100vh',
                width: '100%',
                padding: 10,
                boxSizing: 'border-box',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden'
            }
        } = this.props;
        const percentStyle = {
            position: 'fixed',
            top: 200,
            left: '50%',
            marginLeft: -40,
            zIndex: 999,
            background: '#fff',
            borderRadius: '50%',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
        };
        return (
            <>
                <div id='pwyPrintImgBox' style={{ display: 'none' }}>
                    {
                        printData.map((v, k) => {
                            return (
                                <div style={boxStyle} key={`img-${k}`}>
                                    <img
                                        key={v}
                                        onError={(e) => { this.handleImageErrored(e, k); }}
                                        onLoad={(e) => this.handleImageLoaded(e, k)}
                                        src={v}
                                        style={{
                                            maxHeight: '100%'
                                            // transform: `scale(${scales[k]})`
                                        }}
                                    />
                                    {
                                        imgLoad[k] === 'fail' ? (
                                            <p style={{ padding: '0 3px', color: '#666' }}>发票文件正在生成，请稍后再试</p>
                                        ) : null
                                    }
                                </div>
                            );
                        })
                    }
                </div>
                <iframe id='pwyPrintImgIframe' style={{ position: 'absolute', zIndex: -1, width: 0, height: 0, border: 0, overflow: 'hidden' }} />
                {
                    loading ? (
                        <Progress
                            id='pwyPrintImgProgress'
                            type='circle'
                            percent={percent}
                            width={80}
                            style={percentStyle}
                        />
                    ) : ''
                }
                <Modal
                    visible={this.state.showPrintStatus}
                    title='打印提示'
                    okText={okText}
                    cancelText={cancelText}
                    onOk={() => { this.continuePrint(); }}
                    onCancel={() => { this.setState({ showPrintStatus: false }); this.printEnd(); }}
                >
                    {
                        printTip && !batchPrintResult ? (
                            <span>{printTip}</span>
                        ) : (
                            <>
                                <p style={{ marginBottom: 20, fontSize: 16 }}>
                                    <span>单据包含影像文件</span>
                                    <span style={{ color: '#3598ff', padding: '0 2px' }}>{batchPrintResult?.nums}</span>
                                    份文件，支持批量打印问文件
                                    <span style={{ color: '#3598ff', padding: '0 2px' }}>{batchPrintResult?.success}</span>
                                    份，不支持批量打印的
                                    <span style={{ color: '#3598ff', padding: '0 2px' }}>{batchPrintResult?.fail}</span>份
                                </p>
                                <p style={{ fontWeight: 'bold', marginBottom: 4 }}>1：支持批量打印的影像文件格式如下：</p>
                                <p style={{ textIndent: 22, marginBottom: 4 }}>
                                    <span>PNG、JPG、JPEG等图片文件；</span>
                                </p>
                                <p style={{ fontWeight: 'bold', marginBottom: 4 }}>2：特殊情况支持批量打印的影像文件格式如下：</p>
                                <p style={{ textIndent: 22, marginBottom: 4 }}>
                                    <span>生成了快照的PDF、OFD文件支持批量打印；</span>
                                </p>
                                <p style={{ fontWeight: 'bold', marginBottom: 4 }}>3：不支持打印的影像文件格式如下：</p>
                                <p style={{ textIndent: 22, marginBottom: 4 }}>
                                    <span>HEIC、Excel、XML、TXT、PPT、CSV、Rar；</span>
                                </p>
                            </>
                        )
                    }
                </Modal>
            </>
        );
    }
}

IframePrintImg.propTypes = {
    printData: PropTypes.array,
    printNums: PropTypes.array,
    printEnd: PropTypes.func,
    locale: PropTypes.string,
    boxStyle: PropTypes.object,
    batchPrintResult: PropTypes.string,
    printListOriginAngle: PropTypes.array
};

export default IframePrintImg;