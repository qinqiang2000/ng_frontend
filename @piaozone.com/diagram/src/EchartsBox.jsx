import React from 'react';
import PropTypes from 'prop-types';
import * as echarts from 'echarts/lib/echarts.js';
import 'echarts/lib/chart/bar';
import 'echarts/lib/chart/line';
import 'echarts/lib/chart/pie';
import 'echarts/lib/chart/graph';
import 'echarts/lib/component/tooltip';
import 'echarts/lib/component/title';
import 'echarts/lib/component/legend';
import 'echarts/lib/component/legendScroll';
import 'echarts/lib/component/dataZoom';
import 'echarts/lib/component/dataZoomSlider';
import 'echarts/lib/component/toolbox';
import 'echarts/lib/component/markPoint';
import 'echarts/lib/component/markLine';

class EchartsBox extends React.Component {
    static propTypes = {
        option: PropTypes.object,
        height: PropTypes.number,
        handleClick: PropTypes.func,
        handleRoamClick: PropTypes.func
    };

    async componentDidMount() {
        //初始化图表
        await this.initChart(this.el); //将传入的配置(包含数据)注入
        //const { option, isClick, handleClick } = this.props;
        const { option, handleClick } = this.props;
       
        this.setOption(option);
        this.myChart.on('click', (params) => {
            if (params.data.isClick) {
                handleClick && handleClick(params.data);
            } else if (params.data.check === 2) {
                handleClick && handleClick(params.data);
            }
        });
        //监听屏幕缩放，重新绘制echart图表
        window.addEventListener('resize', this.onResize());
        this.myChart.getZr().on('mousewheel', (param) => {
            this.props.handleRoamClick(param.wheelDelta);
        });
    }

    componentDidUpdate() {
        //每次更新组件都重置
        const { option } = this.props;
        this.setOption(option);
    }

    componentWillUnmount() {
        this.dispose();
        window.removeEventListener('resize', this.onResize());
    }

    render() {
        const { height } = this.props;
        return (
            <div
                ref={(el) => (this.el = el)}
                style={{ width: '100%', height }}
            />
        );
    }

    myChart = null;

    onResize = () => {
        this.myChart && this.myChart.resize();
    };
    
    //初始化
    initChart = (el) => {
        this.myChart = echarts.init(el);
    };
    
    //绘制图表
    setOption = (option) => {
        if (!this.myChart) {
            return;
        }
        this.myChart.setOption(option);
    };
    
    //卸载图表
    dispose = () => {
        if (!this.myChart) {
            return;
        }
        this.myChart.dispose();
        this.myChart = null;
    };

    // 放大缩小图表
    // zoom = (rate) => {
    //     this.myChart.setOption({
    //         series: {
    //             zoom: rate
    //         }
    //     })
    // }
}

export default EchartsBox;
