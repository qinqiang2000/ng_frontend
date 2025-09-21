(function (KDApi, $, _) {
    function MyComponent(model) {
        this._setModel(model);
    }

    var isUpdate = false;
    var model;

    function loadScripts(urls, callback) {
        if (!Array.isArray(urls) || urls.length === 0) {
            console.warn('loadScripts: 无效的 URL 列表', urls);
            callback(false);
            return;
        }

        var index = 0;

        var loadNext = () => {
            if (index >= urls.length) {
                callback(true);
                return;
            }

            var script = document.createElement('script');
            script.src = urls[index];
            script.async = true;
            script.onload = () => {
                index++;
                loadNext();
            };
            script.onerror = (err) => {
                console.error(`loadScripts: 加载失败 ${urls[index]}`, err);
                // index++;
                callback(false);
            };
            document.head.appendChild(script);
        };
        loadNext();
    }


    MyComponent.prototype = {
        _setModel: function (model) {
            this.model = model;
        },
        init: function (props) {
            isUpdate = false;
            model = this.model;
            initHtml(this.model, props);
        },
        update: function (props) {
            isUpdate = true;
            model = this.model;
            updateHtml(this.model, props);
        },
        destoryed: function () {
            if (window.getSmartCustomerInstance) {
                var st2 = window.getSmartCustomerInstance();
                st2.closePageFreshMenu();
            }
        }
    };

    var initHtml = function (model, props) {
        var popsData = {};
        if (props != null && props.data != null) {
            popsData = props.data;
        }
        var eventKey = popsData['eventKey'];
        if (eventKey === 'init') {
            console.log('init data', popsData);
            var env = popsData.env;
            var baseUrl = 'https://img.piaozone.com';
            if (env === 'test') {
                baseUrl = 'https://img-sit.piaozone.com';
            }

            popsData.appText = popsData.appName;
            popsData.moduleText = popsData.caption;

            if (window.getSmartCustomerInstance) {
                var st2 = window.getSmartCustomerInstance();
                st2.init(popsData);
                return;
            }

            var remoteJsUrls = [baseUrl + '/static/public/js/smartCustomer.min.js'];
            var cssUrl = baseUrl + '/static/public/css/smartCustomer.min.css';
            loadScripts(remoteJsUrls, function(loadFlag) {
                if (loadFlag) {
                    var st = window.getSmartCustomerInstance({
                        cssUrl: cssUrl
                    });
                    st.init(popsData);
                }
            });
        }
    };

    var updateHtml = function (model, props) {
        if (window.getSmartCustomerInstance) {
            var st1 = window.getSmartCustomerInstance();
            st1.pageUpdate(model, props);
        }
    };
    KDApi.register('aicustomerservice', MyComponent)
})(window.KDApi);