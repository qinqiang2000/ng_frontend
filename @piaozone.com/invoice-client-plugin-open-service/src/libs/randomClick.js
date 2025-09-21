/* eslint-disable */
export async function simulateClick(opt = {}) {
    const minDot = opt.minDot || 5;
    const maxDot = opt.maxDot || 8;
    const selector = opt.selector || '';
    const getRandomInt = function(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    };

    const createDiv = function(id) {
        // create a div element
        const div = document.createElement('div');
        div.id = id;

        // set the div style to cover the entire page
        div.style.position = 'fixed';
        div.style.top = '0';
        div.style.left = '0';
        div.style.width = '100%';
        div.style.height = '100%';
        div.style.zIndex = '999999';

        // append the div to the body
        document.body.appendChild(div);
    };

    let element;
    if (!selector) {
        const randDomId = 'clickId' + (+new Date());
        createDiv(randDomId);
        element = document.getElementById(randDomId);
    } else {
        element = document.querySelector(selector);
    }
    if (!element) {
        return false;
    }
    const { x, y, width, height } = element.getBoundingClientRect();
    const clickCount = getRandomInt(minDot, maxDot); // generate random click count between 5 and 8
    const list = [];
    for (let i = 0; i < clickCount; i++) {
        const randomX = Math.floor(Math.random() * width) + x;
        const randomY = Math.floor(Math.random() * height) + y;
        const randomDelay = 700 + Math.random() * 300; // generate random delay between 0 and 1 second
        list.push({
            x: randomX,
            y: randomY
        });
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

    if (!selector) {
        document.body.removeChild(element);
    }
    return list;
}
