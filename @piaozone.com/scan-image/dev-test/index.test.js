import React from 'react';
import ReactDOM from 'react-dom';
import ScanImage from '../src/';
import './style.css';

class TestScanImage extends React.Component {
    constructor(props) {
        super(...arguments);
        this.state = {
            activeIndex: 0,
            displayFlag: 'markImage',
            disabledBtns: false,
            rotateDeg: 0,
            list: [
                {
                    url: 'https://api-sit.piaozone.com/doc/free/fileInfo/preview/nf1386706483079106560.jpg',
                    "rotateDeg": 0,
                    "pixel": "1440,1080",
                    "region": "[0,0,808,513]",
                    "markColor": "#487BFB"
                },
                {
                    url: 'https://api-sit.piaozone.com/doc/free/fileInfo/preview/nf1386706483079106560.jpg',
                    "rotateDeg": 0,
                    "pixel": "1440,1080",
                    "region": "[0,426,794,1068]",
                    "markColor": "#487BFB"
                },
                {
                    url: 'https://api-sit.piaozone.com/doc/free/fileInfo/preview/nf1386706483079106560.jpg',
                    "rotateDeg": 0,
                    "pixel": "1440,1080",
                    "region": "[666,0,1440,516]",
                    "markColor": "#487BFB"
                },
                // {
                //     url: 'https://api-sit.piaozone.com/doc/free/fileInfo/preview/nf1386706483079106560.jpg',
                //     "rotateDeg": 0,
                //     "pixel": "1440,1080",
                //     "region": "[643,446,1440,1029]",
                //     "markColor": "#487BFB"
                // }
                // {
                //     url: 'https://api-sit.piaozone.com/doc/free/fileInfo/preview/nf1386706483079106560.jpg',
                //     "rotateDeg": 0,
                //     "pixel": "1442.1, 1412.9",
                //     "region": "[726.3, 851.5, 1442.1, 1412.9]",
                //     "markColor": "#487BFB"
                // }
            ]
        }
    }

    next = () => {
        this.setState({
            activeIndex: (this.state.activeIndex + 1) % this.state.list.length
        });
    }

    prev = () => {
        this.setState({
            activeIndex: (this.state.activeIndex + this.state.list.length - 1) % this.state.list.length
        });
    }

    render() {
        const { displayFlag, list, activeIndex, disabledBtns, rotateDeg } = this.state;
        const areaInfo = list[activeIndex];
        return (
            <div>
                <ScanImage
                    id={0}
                    index={activeIndex}
                    width={700}
                    height={900}
                    rotateDeg={rotateDeg}
                    // areaInfo={ displayFlag === 'markImage' ? list : list[activeIndex]}
                    // displayFlag={displayFlag}
                    areaInfo={list}
                    displayFlag="selection"
                    onSelection={(region) => {
                        alert(`选中区域坐标: ${region.join(',')}`);
                    }}
                    visible={true}
                    renderInBody={false}
                    imgSrc={areaInfo.url}
                    disabledBtns={false}
                    showNewBtns={true}
                    showChangePageBtn={true}
                    changeIndex={(t)=>{
                        if (t === 'next') {
                            if (list.length > parseInt(activeIndex) + 1) {
                                this.setState({
                                    activeIndex: parseInt(activeIndex) + 1
                                });
                            } else {
                                alert('已经是最后一页了');
                            }
                        } else {
                            if (parseInt(activeIndex) - 1 >= 0) {
                                this.setState({
                                    activeIndex: parseInt(activeIndex) - 1
                                });
                            } else {
                                alert('已经是第一页了');
                            }
                        }

                    }}
                />
                <p className='buttons'>
                    <a onClick={this.prev}>上一个</a>
                    <a onClick={this.next}>下一个</a>
                    <a onClick={() => this.setState({ disabledBtns: !disabledBtns })}>{disabledBtns? '显示': '隐藏'}底部按钮</a>
                    <a onClick={() => this.setState({ displayFlag: 'showImage'})}>直接显示图像</a>
                    <a onClick={() => this.setState({ displayFlag: 'cuteImage'})}>裁剪图像</a>
                    <a onClick={() => this.setState({ displayFlag: 'markImage'})}>标记图像</a>
                </p>
            </div>
        )
    }
}


ReactDOM.render(<TestScanImage />, document.getElementById('root'));