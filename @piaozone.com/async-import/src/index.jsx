import React, { Component } from 'react';
import Spin from '@piaozone.com/spin';
import './style.less';

export default function WrapperAsyncImport(loadComponent, opt = {}) {
    return class AsyncImport extends Component {
        constructor() {
            super(...arguments);
            this.state = {
                loading: false,
                Child: null,
                errDescription: '',
                componentStack: []
            };
            this.unAmount = false;
        }

        componentWillUnmount() {
            this.unAmount = true;
        }

        componentDidMount() {
            this.startLoad(opt.delayTime || 0);
        }

        componentDidCatch(error, info) {
            const componentStack = info.componentStack || '';
            const componentStacks = componentStack.split('\n');
            const errorStacks = [];
            for (let i = 0; i < componentStacks.length; i++) {
                const curStr = componentStacks[i];
                if (curStr.trim() !== '') {
                    errorStacks.push(curStr);
                }
            }
            this.setState({
                loading: false,
                errDescription: error.toString(),
                componentStack: errorStacks
            });
        }

        delayTime = (time) => {
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve(null);
                }, time);
            });
        }

        startLoad = async(delayTime) => {
            if (this.unAmount) {
                return;
            }
            this.setState({
                loading: true,
                errDescription: '',
                errorStacks: []
            });
            let loadRes;
            // 用于控制加载延时，主要用于调试和重试时的效果控制
            if (delayTime) {
                await this.delayTime(delayTime);
            }
            try {
                loadRes = await loadComponent();
            } catch (error) {
                this.setState({
                    loading: false,
                    errDescription: JSON.stringify(error)
                });
                return;
            }

            const { default: Child } = loadRes;
            this.setState({
                loading: false,
                Child
            });
        }

        render() {
            const { Child, errDescription, componentStack, loading } = this.state;
            const { className, Loading, loadingProps = {} } = opt;
            if (loading) {
                return Loading ? (
                    <Loading {...loadingProps} />
                ) : (
                    <div style={{ textAlign: 'center' }}>
                        <Spin />
                    </div>
                );
            } else if (errDescription) {
                let cls = 'asyncComErrBox';
                if (className) {
                    cls += ' ' + className;
                }
                return (
                    <div className={cls}>
                        <div className='stacks'>
                            <p className='title'>{errDescription}</p>
                            {
                                componentStack.map((item, i) => {
                                    return (
                                        <p key={i}>{item}</p>
                                    );
                                })
                            }
                        </div>
                        <div><span onClick={() => this.startLoad(200)} className='reload'>重新加载</span></div>
                    </div>
                );
            } else {
                return Child ? (
                    <Child {...this.props} />
                ) : null;
            }
        }
    };
};


