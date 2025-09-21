import React from 'react';
import ReactDOM from 'react-dom';
import PwyCarouse from '../src';
import './style.css';
import ScanImage from '@piaozone.com/scan-image';

class Test extends React.Component {
    constructor(props) {
        super(...arguments);
        this.state = {
            activeIndex: 0
        }
    }

    componentWillMount() {
        this.setState({
            clientWidth: 800,
            clientHeight: 600
        })
    }

    render() {
        const list = [{
            url: 'https://api.kingdee.com/kdrive/user/file/thumbnail?client_id=200242&file_id=131716762&quality=100&scode=eEk0b04rZ050ZkxHZWhLV1c3Q1lM&sign=0b110a5470e1f94c78d125f5d149a1779e1278d9&width=800',
            areaInfo: [{
                rotateDeg: 90,
                pixel: '2976,3968',
                region: '[841,71,2976,3968]',
                markColor: '#EB5D5D'
            }, {
                rotateDeg: 90,
                pixel: '2976,3968',
                region: '[86,556,1089,1999]',
                markColor: '#FF933D',
            }, {
                rotateDeg: 90,
                pixel: '2976,3968',
                region: '[0,2067,1294,3920]',
            }]
        }, {
            url: 'https://api.kingdee.com/kdrive/user/file/thumbnail?client_id=200242&file_id=132198886&quality=100&scode=UkhIL0RMRmFLY2FYUUs3L2toTUpy&sign=889bf65db775a7d6cc840c322920e96fb0941f7a&width=800',
            areaInfo: [{
                rotateDeg: 0,
                pixel: '741,849',
                region: '[403,182,654,740]'
            }, {
                rotateDeg: 0,
                pixel: '741,849',
                region: '[69,6,401,231]'
            }, {
                rotateDeg: 0,
                pixel: '741,849',
                region: '[379,11,714,234]'
            }, {
                rotateDeg: 0,
                pixel: '741,849',
                region: '[55,183,401,595]'
            }, {
                rotateDeg: 0,
                pixel: '741,849',
                region: '[75,576,409,803]'
            }]
        }, {
            url: 'https://api.kingdee.com/kdrive/user/file/public?client_id=200242&file_id=132199635&scode=SnlPOGtnMnRTMThyL0JscmxCUDBG&sign=a5a30c3f7f94a92f09f06aa653992fb5332223ec',
            areaInfo: [{
                rotateDeg: 0,
                pixel: '1243,847',
                region: '[662,21,911,559]',
                markColor: '#FF933D'
            }, {
                rotateDeg: 0,
                pixel: '1243,847',
                region: '[906,27,1135,554]'
            }, {
                rotateDeg: 0,
                pixel: '1243,847',
                region: '[53,39,460,308]'
            }, {
                rotateDeg: 0,
                pixel: '1243,847',
                region: '[457,30,695,575]'
            }, {
                rotateDeg: 0,
                pixel: '1243,847',
                region: '[61,278,486,571]'
            }, {
                rotateDeg: 270,
                pixel: '1243,847',
                region: '[42,568,555,795]',
                markColor: '#EB5D5D'
            }]
        }];
        const { activeIndex, clientWidth, clientHeight } = this.state;

        return (
            <PwyCarouse
                index={activeIndex}
                onChangeIndex={(i) => {
                    console.log('index', i);
                    return {
                        errcode: '0000',
                        description: 'description'
                    };
                }}
                style={{ width: clientWidth, height: clientHeight, background: '#ccc' }}
                disabledDots={false}
            >
                {
                    list.map((item, index) => {
                        return (
                            <ScanImage
                                id={index}
                                width={clientWidth}
                                height={clientHeight}
                                areaInfo={item.areaInfo}
                                displayFlag={item.displayFlag || 'markImage'}
                                visible={index === activeIndex}
                                imgSrc={item.url}
                                disabledBtns={true}
                            />
                        )
                    })
                }
            </PwyCarouse>
        )
    }
}


ReactDOM.render(<Test />, document.getElementById('root'));