import React, { useEffect, useState } from 'react';
import './index.less';
import EchartsBox from './EchartsBox';
import PropTypes from 'prop-types';

const propTypes = {
    dotList: PropTypes.array,
    lineList: PropTypes.array,
    contentWidth: PropTypes.number,
    isOnChexk: PropTypes.bool,
    classification: PropTypes.array,
    contentHeight: PropTypes.number,
    handleClickDot: PropTypes.func
};
  
export default function Diagram(props) {
    const { dotList, lineList, contentWidth, isOnChexk, classification, contentHeight, handleClickDot } = props;
    const [options, setOptions] = useState('');
    const [dataZoom, setDataZoom] = useState(1.3);
    const rawData = dotList.map((item) => {
        const newItem = {
            ...item,
            id: item.vid,
            value: item.type[0],
            name: dataZoom >= 0.6 && dataZoom < 1.3 ? item.number.slice(0, 7)
                : dataZoom >= 1.3 && dataZoom < 1.8 ? item.number.slice(0, 15)
                    : dataZoom >= 1.8 ? item.number : ''
        };
        if (classification.length > 0 || isOnChexk) {
            if (newItem.check === 2) {
                return {
                    ...newItem,
                    symbolSize: item.isTureType ? 70 : 56,
                    label: {
                        normal: {
                            show: true,
                            position: 'inside',
                            color: '#fff',
                            textBorderWidth: 1,
                            formatter: ['\n', '{b|{c}}', `{a|${item.type || ''}}`, '\n', '{a|{b}}'].join('\n'),
                            rich: {
                                a: {
                                    color: '#000',
                                    height: 0,
                                    align: 'center',
                                    fontSize: 12
                                },
                                b: {
                                    color: '#fff',
                                    align: 'center',
                                    lineHeight: 90,
                                    opacity: 1,
                                    fontSize: 22
                                }
                            }
                        }
                    },
                    itemStyle: {
                        normal: {
                            color: item.isTureType ? '#5582f3' : '#45cdff',
                            borderType: 'solid', // 图形描边类型，默认为实线，支持 'solid'（实线）, 'dashed'(虚线), 'dotted'（点线）。
                            borderColor: item.isTureType ? '#87a9ff' : '#bbedff', // 设置图形边框为淡金色,透明度为0.4
                            borderWidth: item.isTureType ? 4 : 2 // 图形的描边线宽。为 0 时无描边。
                        }
                    }
                };
            } else {
                return {
                    ...newItem,
                    symbolSize: 56,
                    label: {
                        normal: {
                            show: true,
                            position: 'inside',
                            color: '#fff',
                            textBorderWidth: 1,
                            formatter: ['\n', '{b|{c}}', `{a|${item.type || ''}}`, '\n', '{a|{b}}'].join('\n'),
                            rich: {
                                a: {
                                    color: '#000',
                                    height: 0,
                                    opacity: 0.2,
                                    align: 'center',
                                    fontSize: 12
                                },
                                b: {
                                    color: '#fff',
                                    align: 'center',
                                    lineHeight: 90,
                                    opacity: 1,
                                    fontSize: 22
                                }
                            }
                        }
                    },
                    itemStyle: {
                        normal: {
                            color: '#45cdff',
                            opacity: 0.2,
                            borderType: 'solid', // 图形描边类型，默认为实线，支持 'solid'（实线）, 'dashed'(虚线), 'dotted'（点线）。
                            borderColor: '#bbedff', // 设置图形边框为淡金色,透明度为0.4
                            borderWidth: 2 // 图形的描边线宽。为 0 时无描边。
                        }
                    }
                };
            }
        } else { //筛选为空时显示
            if (newItem.check === 1) {
                return {
                    ...newItem,
                    symbolSize: item.isTureType ? 70 : 56,
                    label: {
                        normal: {
                            show: true,
                            position: 'inside',
                            color: '#fff',
                            textBorderWidth: 1,
                            formatter: ['\n', '{b|{c}}', `{a|${item.type || ''}}`, '\n', '{a|{b}}'].join('\n'),
                            rich: {
                                a: {
                                    color: '#000',
                                    height: 0,
                                    opacity: 1,
                                    align: 'center',
                                    fontSize: 12
                                },
                                b: {
                                    color: '#fff',
                                    align: 'center',
                                    lineHeight: 90,
                                    opacity: 1,
                                    fontSize: 22
                                }
                            }
                        }
                    },
                   
                    itemStyle: {
                        normal: {
                            color: '#5582f3',
                            borderType: 'solid', // 图形描边类型，默认为实线，支持 'solid'（实线）, 'dashed'(虚线), 'dotted'（点线）。
                            borderColor: '#87a9ff', // 设置图形边框为淡金色,透明度为0.4
                            borderWidth: 4 // 图形的描边线宽。为 0 时无描边。
                        }
                    }
                    // label: {
                    //   textBorderColor: "#ff575f",
                    // },
                };
            } else {
                return {
                    ...newItem,
                    symbolSize: 56,
                    label: {
                        normal: {
                            show: true,
                            position: 'inside',
                            color: '#fff',
                            textBorderWidth: 1,
                            formatter: ['\n', '{b|{c}}', `{a|${item.type || ''}}`, '\n', '{a|{b}}'].join('\n'),
                            rich: {
                                a: {
                                    color: '#000',
                                    height: 0,
                                    opacity: 1,
                                    align: 'center',
                                    fontSize: 12
                                },
                                b: {
                                    color: '#fff',
                                    align: 'center',
                                    lineHeight: 90,
                                    opacity: 1,
                                    fontSize: 22
                                }
                            }
                        }
                    },
                    itemStyle: {
                        normal: {
                            color: '#45cdff',
                            opacity: 1,
                            borderType: 'solid', // 图形描边类型，默认为实线，支持 'solid'（实线）, 'dashed'(虚线), 'dotted'（点线）。
                            borderColor: '#bbedff', // 设置图形边框为淡金色,透明度为0.4
                            borderWidth: 2 // 图形的描边线宽。为 0 时无描边。
                        }
                    }
                };
            }
        }
    });

    const rawLink = lineList.map((item) => {
        const newItem = {
            ...item,
            source: item.src,
            target: item.dest,
            type: item.edgeType,
            typeName: item.edgeType === 'up_down' ? '上下游关系' : '组合关系' //边类型  synthetic-组合关系，up_down-上下游关系
        };
        if (newItem.type === 'up_down') {
            return {
                ...newItem,
                tooltip: { formatter: newItem.typeName }
            };
        } else if (newItem.type === 'synthetic') {
            return {
                ...newItem,
                tooltip: { formatter: newItem.typeName },
                symbol: ['circle', 'circle'],
                symbolSize: [10, 10]
            };
        } else {
            return {
                ...newItem,
                symbol: ['none', 'arrow']
            };
        }
    });

    const option = {
        // title: {
        //     text: '关系图',
        //     subtext: 'Default layout',
        //     top: 'bottom',
        //     left: 'right',
        // },
        color: ['#45cdff'],
        tooltip: {
            trigger: 'item',
            formatter: '{b}'
        },
        animationDuration: 1000,
        animationEasingUpdate: 'quinticInOut',
        series: [
            {
                name: '',
                type: 'graph',
                layout: 'force',
                draggable: true,
                zoom: dataZoom, // 数据多的情况下控制显示区域大小
                force: {
                    // 布局配置
                    repulsion: 600,
                    edgeLength: 120,
                    layoutAnimation: true,
                    friction: 0.3
                },
                data: rawData,
                links: rawLink,
                roam: true, //是否开启平移缩放
                scaleLimit: { //所属组件的z分层，z值小的图形会被z值大的图形覆盖
                    min: 0.8, //最小的缩放值
                    max: 2.8 //最大的缩放值
                },
                lineStyle: {
                    normal: {
                        color: '#84b9ff',
                        // opacity: 1,
                        curveness: 0,
                        type: 'solid',
                        width: 1
                    }
                },
                emphasis: {
                    // focus: 'adjacency',
                    lineStyle: {
                        width: 5
                    }
                }
            }
        ]
    };

    useEffect(() => {
        setOptions(option);
    }, [dataZoom, dotList]);

    const add = () => {
        const num = dataZoom + 0.1;
        if (num < 2.9) {
            setDataZoom(num);
            roamMap(0);
        }
    };

    const sub = () => {
        const num = dataZoom - 0.1;
        if (num > 0.7) {
            setDataZoom(num);
            roamMap(1);
        }
    };

    const roamMap = (flag) => {
        if (flag === 1) {
            option.series[0].zoom = dataZoom;
        } else {
            option.series[0].zoom = dataZoom;
        }
        option.data = rawData;
        option.links = rawLink;
        setOptions(option);
    };

    const handleClickRoam = (e) => {
        if (e === 1) {
            const num = dataZoom + 0.1;
            if (num < 2.9) {
                setDataZoom(num);
                roamMap(0);
            }
        } else if (e === -1) {
            const num = dataZoom - 0.1;
            if (num > 0.7) {
                setDataZoom(num);
                roamMap(1);
            }
        }
    };
    //const linkList = [
    //     {
    //         name: '关联',
    //         key: 'syntheticRelation',
    //         render: () => (
    //             <div className='synthetic line'></div>
    //         )
    //     },
    //     {
    //         name: '上下游',
    //         key: 'fatherSonRelation',
    //         render: () => (
    //             <div className='line-style'>
    //                 <div className='fatherSon line'></div>
    //                 <div className='arrow'></div>
    //             </div>
    //         )
    //     },
    //     {
    //         name: '组合',
    //         key: 'upDownRelation',
    //         render: () => (
    //             <div className='line-style'>
    //                 <div className='circle'></div>
    //                 <div className='line'></div>
    //                 <div className='circle'></div>
    //             </div>
    //         )
    //     },
    // ]
    return (
        <div style={{ width: contentWidth, height: contentHeight }} className='diagram'>
            {/* <div className='diagram-legend'>
                <div className='diagram-title'>关系筛选：</div>
                {
                    linkList.map(item => (
                        <div key={item.key} className='line-item'>
                            <div className='line-item-name'>{item.name}</div>
                            <div>{item.render()}</div>
                        </div>
                    ))
                }
            </div> */}
            <EchartsBox
                option={options}
                height={contentHeight}
                // isClick={isClick}
                classification={classification}
                handleClick={(e) => { handleClickDot(e); }}
                handleRoamClick={handleClickRoam}
            />
            {
                dotList.length > 0 &&
                <div className='diagram-zoom'>
                    <span className='btn' onClick={sub}>-</span>
                    <span>{Math.ceil(dataZoom.toFixed(2) * 10) * 10 >= 0.8 ? (Math.abs(Math.ceil(dataZoom.toFixed(2) * 10))) * 10 - 80 : 0}%</span>
                    <span className='btn' style={{ lineHeight: '20px' }} onClick={add}>+</span>
                </div>
            }
        </div>
    );
}

Diagram.propTypes = propTypes;