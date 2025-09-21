## 引入发票云智能客服

```js
    (function (w, d) {
        x = d.createElement("script");
        x.async = true;
        // ***为您的自定义域名
        x.src = 'https://img-sit.piaozone.com/static/public/js/smartCustomer.min.js';
        d.body.appendChild(x);
        x.onload = function() {
            const st = new w.SmartCustomer({
            cssUrl: 'https://img-sit.piaozone.com/static/public/css/smartCustomer.min.css'
            });
            st.init();
        };
    })(window, document);
```