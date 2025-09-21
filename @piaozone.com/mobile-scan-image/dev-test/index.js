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
            clientHeight: 320,
            clientWidth: 320,
            rotateDeg: 0,
            list: [
                {
                    url: 'https://api.kingdee.com/kdrive/user/file/thumbnail?client_id=200242&file_id=131716762&quality=100&scode=eEk0b04rZ050ZkxHZWhLV1c3Q1lM&sign=0b110a5470e1f94c78d125f5d149a1779e1278d9&width=800',
                    rotateDeg: 90,
                    pixel: '2976,3968',
                    region: '[841,71,2976,3968]',
                    markColor: '#EB5D5D',
                },
                {
                    url: 'https://api.kingdee.com/kdrive/user/file/thumbnail?client_id=200242&file_id=131716762&quality=100&scode=eEk0b04rZ050ZkxHZWhLV1c3Q1lM&sign=0b110a5470e1f94c78d125f5d149a1779e1278d9&width=800',
                    rotateDeg: 90,
                    pixel: '2976,3968',
                    region: '[86,556,1089,1999]',
                    markColor: '#FF933D'
                },
                {
                    url: 'https://api.kingdee.com/kdrive/user/file/thumbnail?client_id=200242&file_id=131716762&quality=100&scode=eEk0b04rZ050ZkxHZWhLV1c3Q1lM&sign=0b110a5470e1f94c78d125f5d149a1779e1278d9&width=800',
                    rotateDeg: 90,
                    pixel: '2976,3968',
                    region: '[0,2067,1294,3920]'
                }
            ]
        }
    }

    componentDidMount() {
        this.setState({
            clientHeight: document.body.clientHeight,
            clientWidth: document.body.clientWidth
        })
    }

    changeRotateDeg = () => {
        this.setState({
            rotateDeg: this.state.rotateDeg + 90
        });
    }

    render() {
        const { displayFlag, list, activeIndex, disabledBtns, clientHeight, clientWidth, rotateDeg} = this.state;
        const areaInfo = list[activeIndex];
        return (
            <div>
                <ScanImage
                    id={0}
                    width={clientWidth}
                    height={clientHeight}
                    rotateDeg={rotateDeg}
                    areaInfo={ displayFlag === 'markImage' ? list : list[activeIndex]}
                    displayFlag={displayFlag}
                    visible={true}
                    renderInBody={false}
                    imgSrc={areaInfo.url}
                    disabledBtns={disabledBtns}
                />
                <a href='javascript:;' onClick={this.changeRotateDeg}>修改角度</a>
            </div>
        )
    }
}


ReactDOM.render(<TestScanImage />, document.getElementById('root'));