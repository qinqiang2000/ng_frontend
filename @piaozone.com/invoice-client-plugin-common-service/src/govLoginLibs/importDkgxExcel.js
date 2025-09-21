/* global window XMLHttpRequest FormData */
/* eslint-disable func-names */
export function dkgxByImport(opt = {}) {
    return new Promise((resolve) => {
        const path = opt.path;
        const list = opt.list;
        const cols = opt.cols;
        const fileName = opt.fileName;
        const datas = opt.datas || {};
        const field = opt.field || 'file';
        const withCredentials = opt.withCredentials;
        const file = window.pwyNightmare.createXlsxFile(fileName, list, cols);
        const xhr = new XMLHttpRequest();
        if (withCredentials) {
            xhr.withCredentials = true;
        }
        const formDataObj = new FormData();
        formDataObj.append(field, file);
        Object.keys(datas).forEach((key) => {
            formDataObj.append(key, datas[key]);
        });

        xhr.open('POST', path, true);
        xhr.onerror = (event) => {
            resolve({
                errcode: '95001',
                description: '税局请求异常，请稍后再试!'
            });
        };
        xhr.onload = (event) => {
            const status = xhr.status;
            if (status === 302 || status === 301) {
                resolve({
                    errcode: '91300',
                    description: '电子税局登录失效，请重新操作!'
                });
                return;
            }
            const isErrorResponse = status < 200 || status >= 300;
            if (isErrorResponse) {
                resolve({
                    errcode: '95001',
                    description: '税局请求异常，请稍后再试!'
                });
                return;
            }
            const responseBody = xhr.responseText || xhr.response;
            let response;
            try {
                response = JSON.parse(responseBody);
                const resError = response.Response.Error || {};
                if (resError.Message || !response.Response.Data) {
                    resolve({
                        errcode: '95000',
                        description: resError.Message
                    });
                    return;
                }
            } catch (error) {
                resolve({
                    errcode: '95001',
                    description: '税局请求异常，请稍后再试!'
                });
                return;
            }
            resolve({
                errcode: '0000',
                description: '操作成功',
                data: response.Response.Data
            });
        };
        xhr.send(formDataObj);
    });
}