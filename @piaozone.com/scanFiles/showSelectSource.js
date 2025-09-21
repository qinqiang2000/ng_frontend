export function showSelectSource(opt = {}) {
    Element.prototype.on = function(type, fn) {
        if(window.addEventListener) { //高级浏览器事件绑定
            this.addEventListener(type, fn,false);
        } else { //IE9以下浏览器
            this.attachEvent('on' + type, fn);
        }
    };
    const {
        scannerSources,
        sourceName,
        onSelect,
        onConfirm,
        onCancel
    } = opt;
    const boxEl = document.getElementById('dialog-selectsourceBox');
    if (!boxEl) {
        const cssStr=`.dialog-selectsourceBox {
                display: none;
                position: absolute;
                width: 100vw;
                height: 100vh;
                left: 0;
                top: 0;
                z-index: 99999999999;
            }
            .dialog-selectsourceBox .mask {
                z-index: 2;
                position: absolute;
                background: #333;
                opacity: .5;
                left: 0;
                top: 0;
                width: 100%;
                height: 100%;
            }

            .dialog-selectsource {
                z-index: 5;
                position: absolute;
                top: 30%;
                left: 0;
                right: 0;
                margin: auto auto;
                font-size: 14px;
                background-color: #eee;
                border: 2px solid #777;
                border-left: 2px solid #ddd;
                border-top: 2px solid #ddd;
                padding: 15px 20px 0 20px;
                width: 300px;
            }

            .dialog-selectsource p {
                padding: 0;
                margin: 0;
                font-weight: bold;
            }

            .dialog-selectsource-sourcelist {
                height: 70px;
                padding: 0;
                background-color: #fff;
                border: 2px solid #777;
                border-right: 2px solid #ddd;
                border-bottom: 2px solid #ddd;
                overflow-y: auto;
                overflow-x: hidden;
                min-width: 240px;
                -webkit-touch-callout: none;
                -webkit-user-select: none;
                -khtml-user-select: none;
                -moz-user-select: none;
                -ms-user-select: none;
                user-select: none;
            }

            .dialog-selectsource-sourcelist ul {
                list-style: none;
                margin: 0;
                padding: 0;
            }

            .dialog-selectsource-sourcelist li {
                padding: 2px 0 2px 2px;
                margin: 0;
                list-style: none;
                cursor: pointer;
                line-height: 18px;
            }

            .dialog-selectsource-sourcelist li:hover {
                background-color: #eff6fd;
            }

            .dialog-selectsource-sourcelist li.dialog-selectsource-sourcelist-li-selected {
                background-color: #c7defc;
            }

            .dialog-selectsource-sourcelist-ul {
                list-style: none;
                margin: 0;
                padding: 0;
            }

            .dialog-selectsource-buttons>input {
                min-width: 80px;
                height: 20px;
                margin: 10px 10px 20px 0;
                line-height: 0;
            }`;
        const styleEl = document.createElement('style');
        styleEl.innerHTML = cssStr;
        document.getElementsByTagName('head')[0].appendChild(styleEl);
        const getLiStr = function(specSourceName) {
            let liArr = [];
            for (let i = 0; i < scannerSources.length; i++) {
                const curName = scannerSources[i];
                let cls = 'dialog-selectsource-sourcelist-li';
                if ((scannerSources.indexOf(specSourceName) === -1 && i === 0) || curName === specSourceName) {
                    cls = 'dialog-selectsource-sourcelist-li-selected dialog-selectsource-sourcelist-li';
                }
                liArr.push(`<li data-value="${curName}" data="${i}" class="${cls}">${curName}</li>`);
            }
            return liArr.join('');
        };
        const liStr = getLiStr(sourceName);
        const boxInnerHtml = `
        <div class="mask"></div>
        <div class="dialog-selectsource">
            <p>选择扫描仪类型</p>
            <div class="dialog-selectsource-sourcelist">
                <ul id="dialog-selectsource-sourcelist-ul">${liStr}</ul>
            </div>
            <div class="dialog-selectsource-buttons">
                <input type="button" value="确定" class="startScanBtn" id="comConfirmScanBtn" />
                <input
                    type="button"
                    value="取消"
                    class="cancelScanBtn"
                    id="cancelScanBtn"
                />
            </div>
        </div>`;
        const newBoxEl = document.createElement('div');
        newBoxEl.id = 'dialog-selectsourceBox';
        newBoxEl.className = 'dialog-selectsourceBox';
        newBoxEl.innerHTML = boxInnerHtml;
        document.body.prepend(newBoxEl, document.body.firstChild);
        newBoxEl.style.display = 'block';

        // 确定开始扫描
        document.getElementById('comConfirmScanBtn').onclick = function() {
            const el = document.getElementsByClassName('dialog-selectsource-sourcelist-li-selected')[0];
            document.getElementById('dialog-selectsourceBox').style.display = 'none';
            onConfirm(el.innerText);
        }

        // 取消选择
        document.getElementById('cancelScanBtn').onclick = async function() {
            document.getElementById('dialog-selectsourceBox').style.display = 'none';
            await onCancel();
        }

        // 扫描仪源选择框添加事件
        const ulBox = document.getElementById('dialog-selectsource-sourcelist-ul');
        const ulBoxListen = function(e) {
            if (e.target.tagName === 'LI') {
                const curName = e.target.innerText;
                ulBox.innerHTML = getLiStr(curName);
                onSelect(curName);
            }
        };
        ulBox.on('click', ulBoxListen);
    } else {
        boxEl.style.display = 'block';
    }
}