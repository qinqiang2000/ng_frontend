
import { useEffect } from 'react';
import { wait } from '../utils/tools';
import PropTypes from 'prop-types';

function App(props) {
    useEffect(() => {
        loadZc(props);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    const onResize = async() => {
        const boxEl = document.getElementById(props.targetBoxId);
        // let clientHeight = boxEl.clientHeight < 200 ? 200 : boxEl.clientHeight;
        // clientHeight = clientHeight > 600 ? 600 : clientHeight;
        const clientWidth = boxEl.clientWidth;
        const checkEl = await wait('zc__sdk__container', {
            maxTime: 30000
        });
        checkEl.style.width = clientWidth + 'px';
    };

    const loadZc = () => {
        if (document.getElementById('zc__sdk__container')) {
            return;
        }
        ((w, d, e) => {
            w[e] = function zcInner(...args) {
                w.cbk = w.cbk || [];
                w.cbk.push(args);
            };
            const x = d.createElement('script');
            x.async = true;
            x.id = 'zhichiScript';
            x.src = props.zhichiUrl;
            x.onload = () => {
                props.onLoadZhichi();
                initZc(w);
            };
            d.body.appendChild(x);
        })(window, document, 'zc');
        window.addEventListener('resize', onResize);
    };

    const initZc = (w) => {
        w.zc('config', {
            channelid: props.channelid,
            top_bar_flag: '0',
            full: 1,
            partnerid: props.partnerid,
            enterprise_name: props.enterprise_name,
            auto_expand: true
        });
        w.zc('frame_ready', async() => {
            const checkEl = await wait('zc__sdk__container', {
                maxTime: 30000
            });
            if (checkEl) {
                const boxEl = document.getElementById(props.targetBoxId);
                const clientWidth = boxEl.clientWidth;
                boxEl.appendChild(checkEl);
                w.zc('config', {
                    top_bar_flag: '0',
                    width: clientWidth
                });
                checkEl.style.right = '0px';
                checkEl.style.bottom = '0px';
                checkEl.style.width = clientWidth + 'px';
                checkEl.style.position = 'absolute';
                checkEl.style.display = 'block';
            }
        });
    };
    return null;
}

App.propTypes = {
    targetBoxId: PropTypes.string,
    zhichiUrl: PropTypes.string,
    onLoadZhichi: PropTypes.func,
    channelid: PropTypes.number,
    partnerid: PropTypes.string,
    enterprise_name: PropTypes.string
};

export default App;
