export default class PaperInvoicePrint {
    constructor(opt) {
        // 获取打印信息的方法，promise返回
        this.printFinish = opt.printFinish;
        this.stepFinish = opt.stepFinish;
        this.queryPrintInfo = opt.queryPrintInfo;
        this.printIframeId = opt.printIframeId;
    }

    sendRequest(url, method, data) {
        return new Promise((resolve) => {
            const xhr = new XMLHttpRequest();
            xhr.open(method, url, true); // 异步
            // 设置请求头，声明数据类型是 x-www-form-urlencoded
            xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
            // 定义请求完成的回调
            xhr.onload = () => {
                if (xhr.status === 200) {
                    resolve({
                        errcode: '0000',
                        description: 'success',
                        data: xhr.responseText
                    });
                } else {
                    resolve({
                        errcode: '5000',
                        description: xhr.statusText
                    });
                }
            };

            xhr.onerror = () => {
                resolve({
                    errcode: '5000',
                    description: '税局打印组件请求异常，请检查！'
                });
            };

            xhr.onabort = () => {
                resolve({
                    errcode: '5000',
                    description: '税局打印组件请求异常，请检查！'
                });
            };

            if (data) {
                const urlEncodedData = new URLSearchParams();
                for (const key in data) {
                    if (Object.prototype.hasOwnProperty.call(data, key)) {
                        urlEncodedData.append(key, data[key]);
                    }
                }
                // 发送请求
                xhr.send(urlEncodedData.toString());
            } else {
                xhr.send();
            }
        });
    }

    // 检测税局打印控件是否正常
    async checkGovCom() {
        const res = await this.sendRequest('https://127.0.0.1:18086/v1/print/status?callback=printVersion', 'GET');
        if (res.errcode !== '0000') {
            return {
                errcode: '5000',
                description: '检测税局打印控件异常，请检查是否安装并启动'
            };
        }
        const resData = res.data;
        const matchReg = /^printVersion\('(.*)'\)/;
        const matchList = resData.match(matchReg);
        if (matchList && matchList.length < 2) {
            return {
                errcode: '5000',
                description: '检测税局打印控件异常，请检查是否安装并启动'
            };
        }
        const version = matchList[1];
        if (version === 'stopped') {
            return {
                errcode: '5000',
                description: '检测税局打印控件异常，请检查是否安装并启动'
            };
        }
        if (isNaN(parseFloat(version))) {
            return {
                errcode: '5001',
                description: `检测税局打印控件异常: ${version}`
            };
        }
        return {
            errcode: '0000',
            description: 'success'
        };
    }

    // 通过税局控件打印
    async printByGovCom(info = {}) {
        const res = await this.checkGovCom();
        if (res.errcode !== '0000') {
            return res;
        }
        const printObj = {
            XMLKey: info.XMLKey || info.xmlkey,
            dylx: info.printType, // 发票传0，清单传1
            type: info.invoiceCategory, // 发票传02，清单传xhqd, 机动车销售统一发票传03，二手车销售统一发票
            messageID: (+new Date())
        };
        const url = 'https://127.0.0.1:18086/v1/print/printer?messageID=' + (+new Date());
        const res2 = await this.sendRequest(url, 'POST', printObj);
        if (res2.errcode !== '0000') {
            return res2;
        }

        const resData = res2.data;
        if (!resData.includes('xml')) {
            return {
                errcode: '5002',
                description: `打印异常，异常信息：${resData}`
            };
        }
        try {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(resData, 'text/xml');
            const returnCode = xmlDoc.getElementsByTagName('returncode')[0].textContent;
            const returnMsg = xmlDoc.getElementsByTagName('returnmsg')[0].textContent;
            if (returnCode === '0') {
                return {
                    errcode: '0000',
                    description: returnMsg
                };
            }
            return {
                errcode: '5002',
                description: `打印异常，异常码及异常信息：${returnCode}, ${returnMsg}`
            };
        } catch (error) {
            console.error('error', error, resData);
        }
        return {
            errcode: '5002',
            description: '打印异常'
        };
    }

    printByHtml(htmlStr) {
        return new Promise((resolve) => {
            const iframe = document.getElementById(this.printIframeId);
            const doc = iframe.contentWindow.document;
            const head = doc.querySelectorAll('head')[0];
            const styleHtml = `
                <style media="print">
                    @page { margin: 0mm; }
                    body{ margin: 0, padding: 0; }
                </style>
            `;
            head.innerHTML = styleHtml;
            // 创建一个新的窗口
            doc.body.innerHTML = htmlStr;
            iframe.contentWindow.onafterprint = () => {
                // 打印结束后，执行后续操作
                resolve({
                    errcode: '0000',
                    description: 'success'
                });
            };
            iframe.contentWindow.focus();
            iframe.contentWindow.print();
        });
    }

    async _startPrint(invoices = []) {
        if (invoices.length > 1) {
            return {
                errcode: '3000',
                description: '暂不支持多张发票批量打印，请选择一张发票打印'
            };
        }
        for (let i = 0; i < invoices.length; i++) {
            const curItem = invoices[i];
            const printRes = await this.queryPrintInfo(curItem);
            if (printRes.errcode !== '0000') {
                if (this.stepFinish && typeof this.stepFinish === 'function') {
                    this.stepFinish(curItem, printRes);
                }
                return {
                    errcode: printRes.errcode,
                    description: `获取发票${curItem.invoiceNo}打印信息异常：${printRes.description}`
                };
            }
            const resData = printRes.data || {};
            // 通过税局xml打印
            if (resData.dataType === 1) {
                const res = await this.printByGovCom(resData);
                if (this.stepFinish && typeof this.stepFinish === 'function') {
                    this.stepFinish(curItem, res);
                }
                if (res.errcode !== '0000') {
                    return res;
                }
            } else {
                const res = await this.printByHtml(resData);
                if (this.stepFinish && typeof this.stepFinish === 'function') {
                    this.stepFinish(curItem, res);
                }
                if (res.errcode !== '0000') {
                    return res;
                }
            }
        }
        return {
            errcode: '0000',
            description: 'success'
        };
    }

    async start(invoices) {
        const res = await this._startPrint(invoices);
        if (this.printFinish && typeof this.printFinish === 'function') {
            await this.printFinish(res);
        }
        return res;
    }
};