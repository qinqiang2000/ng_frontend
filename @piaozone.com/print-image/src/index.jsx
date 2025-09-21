import React from 'react';
import PropTypes from 'prop-types';
import { message, Modal, Progress } from 'antd';

const lang = {
    'zh-CN': {
        m1: '待打印资源链接丢失，请检查！',
        m2: '确认打印?',
        m3: (success, fail) => {
            return `待打印的发票中，${fail}张在税局还未生成发票文件，是否继续打印剩余${success}张发票？`;
        },
        m4: '取消',
        m5: '确认',
        m6: (numStr) => {
            return `不可打印的发票号码: ${numStr}`;
        }
    },
    'en-US': {
        m1: 'The resource link to be printed is missing, please check!',
        m2: 'Confirm printing?',
        m3: (success, fail) => {
            return `The resource to be printed contains ${fail} error links! Do you want to continue printing${success}remaining invoices?`;
        },
        m4: 'Cancel',
        m5: 'OK',
        m6: (numStr) => {
            return `Non printable invoice number：${numStr}`;
        }
    },
    printData: []
};

class IframePrintImg extends React.Component {
    constructor(props) {
        super();
        this._isMounted = false;
        this.hadLoadedNum = 0; //已经加载数量
        this.hadLoadedBoxImg = false; //已经加载完成
        this.state = {
            loading: false,
            percent: 0,
            printData: props.printData || [], //待打印图片数组
            t: props.locale || 'zh-CN',
            originAngle: [], // 初始保存旋转角度都是0
            scales: [],
            imgLoad: [] //图片还未生成
        };
    }

    componentDidMount() {
        this._isMounted = true;
        const content = this.beforePrint(this.props.printData, this.props.printNums);
        if (content) {
            Modal.confirm({
                content,
                cancelText: lang[this.state.t].m4,
                okText: lang[this.state.t].m5,
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
                Modal.confirm({
                    content,
                    cancelText: lang[this.state.t].m4,
                    okText: lang[this.state.t].m5,
                    onOk: () => {
                        this.hadLoadedNum = 0;
                        this.hadLoadedBoxImg = false;
                        this.setState({ printData: lang.printData, percent: 0 }, () => {
                            this.printImg();
                        });
                    },
                    onCancel: () => {
                        this.printEnd();
                    }
                });
            }
        }
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
            message.error(lang[this.state.t].m1);
            this.printEnd();
            return '';
        }
        let content = lang[this.state.t].m2;
        if (errNum > 0) {
            content = lang[this.state.t].m3(successNum, errNum);
            const txt = lang[this.state.t].m6(nums.join(',') || '--');
            content += txt;
        }
        lang.printData = printData;
        return content;
    }

    // 打印图片
    printImg() {
        if (!this._isMounted) return;
        const { printData } = this.state;
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
        const originAngle = [];
        printData.forEach(() => {
            originAngle.push(0);
        });
        this.setState({ loading: true, originAngle });

        const length = printData.length;

        this.timer = setInterval(() => {
            this.setState({ percent: Math.floor(this.hadLoadedNum / length / 2 * 100) });
            // 每次都获取新的html片段
            if (this.hadLoadedNum === length && !this.hadLoadedBoxImg) {
                // 渲染iframe
                // 获取最新的dom
                const el = document.getElementById('pwyPrintImgBox');
                doc.body.innerHTML = el.innerHTML;
                doc.close();
                this.hadLoadedBoxImg = true;

                // 浏览器渲染时间
                setTimeout(() => {
                    this.iframeImeLoaded(iframe); // 监听iframe中的图片加载
                }, 1000);
            }
            if (this.hadLoadedNum === length * 2) { // 确保iframe中的图片加载完成
                clearInterval(this.timer);
                setTimeout(() => { // 防止图片绘制不全
                    this.setState({ loading: false }, () => {
                        this.showPrint(iframe);
                    });
                }, 1000);
            }
        }, 500);
    }

    iframeImeLoaded = (iframe) => {
        const length = this.state.printData.length;
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        // 获取 iframe 中的所有图片
        const images = iframeDoc.getElementsByTagName('img');
        for (let i = 0; i < length; i++) {
            if (images[i].complete) {
                this.hadLoadedNum++;
            } else {
                images[i].onload = () => {
                    this.hadLoadedNum++;
                };
                images[i].onerror = () => {
                    this.hadLoadedNum++; // 即使出错也计入，避免无限等待
                };
            }
        }
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
            imgLoad: [] //图片还未生成
        });
        // 主页清空数据，避免一直回调打印
        if (typeof this.props.printEnd === 'function') this.props.printEnd();
    }

    handleImageLoaded = (e, index) => {
        const { originAngle, scales } = this.state;
        const imgW = e.target.width;
        const imgH = e.target.height;
        //width>height说明是横向的,需要旋转
        if (imgW > imgH) {
            originAngle[index] = 90;
            e.target.style.transform = 'rotate(90deg)';
            e.target.style.width = imgH;
            const scale = parseFloat(720 / imgH).toFixed(2);
            scales[index] = scale;
        } else {
            originAngle[index] = 0;
            scales[index] = parseFloat(720 / imgW).toFixed(2);
            e.target.style.transform = 'rotate(0deg)';
            e.target.style.height = imgH;
        }
        this.setState({ originAngle, scales }, () => {
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
        const { loading, percent, printData, originAngle, scales, imgLoad } = this.state;
        const {
            boxStyle = {
                breakAfter: 'page',
                width: '100%',
                height: '100vh',
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
                                        style={{ maxHeight: '100%', transform: `scale(${scales[k]}) rotate(${originAngle[k]}deg)` }}
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
            </>
        );
    }
}

IframePrintImg.propTypes = {
    printData: PropTypes.array,
    printNums: PropTypes.array,
    printEnd: PropTypes.func,
    locale: PropTypes.string,
    boxStyle: PropTypes.object
};

export default IframePrintImg;