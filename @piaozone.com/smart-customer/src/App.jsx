
import { useEffect } from 'react';
import { wait, registerHotkey } from './utils/tools';

function App(props) {
    useEffect(() => {
        const hotKeys = props.hotKeys || ['ctrl', 'shift', 'k'];
        registerHotkey(hotKeys, () => {
            console.warn('start pre');
        });
        loadZc();
        const onResize = async() => {
            const clientHeight = document.documentElement.clientHeight;
            const checkEl = await wait('zc__sdk__container', {
                maxTime: 30000
            });
            checkEl.style.height = clientHeight + 'px';
            checkEl.style.maxHeight = clientHeight + 'px';
        };

        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    const loadZc = () => {
        ((w, d, e) => {
            w[e] = function zcInner(...args) {
                w.cbk = w.cbk || [];
                w.cbk.push(args);
            };
            const x = d.createElement('script');
            x.async = true;
            x.id = 'zhichiScript';
            // ***为您的自定义域名
            x.src = 'https://piaozone.soboten.com/chat/frame/v6/entrance.js?sysnum=1617b04db7e945d28a0fca2944f5409b&partnerid=zc001';
            d.body.appendChild(x);
            initZc(w);
        })(window, document, 'zc');
    };

    const initZc = (w) => {
        w.zc('config', {
            top_bar_flag: '0',
            auto_expand: true,
            width: 355
        });

        w.zc('frame_ready', async() => {
            const checkEl = await wait('zc__sdk__container', {
                maxTime: 30000
            });
            if (checkEl) {
                const clientHeight = document.documentElement.clientHeight;
                checkEl.style.right = '0px';
                checkEl.style.bottom = '0px';
                checkEl.style.height = clientHeight + 'px';
                checkEl.style.maxHeight = clientHeight + 'px';
            }
            const iframeDoc = top.iframe.contentDocument || top.iframe.contentWindow?.document;
            if (iframeDoc) {
                console.log('iframeDoc', iframeDoc);
                // const scriptEl = iframeDoc.createElement('script');
                // scriptEl.textContent = script;
                // iframeDoc.head.appendChild(scriptEl);
            }
        });
    };


    return null;
}

export default App;
