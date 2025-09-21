/* eslint-disable */
export function accessInvoiceBatch() {
    if (document.title.indexOf('批量开具') !== -1) {
        return {
            errcode: '0000',
            data: true
        };
    }
    const tipObj = document.querySelector('.t-dialog__ctx');
    if (tipObj) {
        const style = tipObj.getAttribute('style');
        if (style.indexOf('none') === -1) {
            return {
                errcode: '0000',
                data: {
                    errMsg: '身份认证已超时，请先进行实名认证再进行开票操作!'
                }
            };
        }
    }


    if (tipObj && tipObj.innerText.indexOf('身份认证') !== -1) {

    }
    const list = document.querySelectorAll('.invoice-entrance-content .invoice-entrance-choose');
    if (!list || list.length === 0) {
        return false;
    }

    for (let i = 0; i < list.length; i++) {
        const curItem = list[i];
        const text = curItem.innerText || '';
        if (text.indexOf('批量开具') !== -1) {
            curItem.click();
            break;
        }
    }
    return false;
}


export async function randomClick(opt = {}) {
    try {
        const element = document.querySelector(opt.selector);
        if (!element) {
            return false;
        }
        const { x, y, width, height } = element.getBoundingClientRect();
        const clickCount = Math.floor(Math.random() * 4) + 5; // generate random click count between 5 and 8
        for (let i = 0; i < clickCount; i++) {
            const randomX = Math.floor(Math.random() * width) + x;
            const randomY = Math.floor(Math.random() * height) + y;
            const randomDelay = 800 + Math.random() * 200; // generate random delay between 0 and 1 second
            await new Promise(resolve => setTimeout(resolve, randomDelay));
            element.dispatchEvent(new MouseEvent('mousemove', {
                clientX: randomX,
                clientY: randomY,
                bubbles: true,
                cancelable: true
            }));
            element.dispatchEvent(new MouseEvent('click', {
                clientX: randomX,
                clientY: randomY,
                bubbles: true,
                cancelable: true
            }));
        }
        return true;
    } catch (error) {
        return error.message;
    }

}