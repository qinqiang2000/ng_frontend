export function getUUId() {
    let d = new Date().getTime();
    const uuid = 'xxxxxxxxxxxxxxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
    return uuid;
}

// 不动产税局增加随机id：specificId
export function generateSpecificId() {
    const binaryDigits = ['0', '1'];
    const currentTimestamp = Number(String(new Date().valueOf()).slice(0x3)).toString(0x2);
    const paddingLength = 0x28 - currentTimestamp.length;
    let binaryPrefix = '1';
    let binarySuffix = '1';
    let randomDigits = 0x0;
    for (randomDigits; randomDigits < paddingLength - 0x1; randomDigits++) {
        binaryPrefix += binaryDigits[Math.round(Math.random())];
    }
    let randomDigits2 = 0x0;
    for (randomDigits2; randomDigits2 < 0x17; randomDigits2++) {
        binarySuffix += binaryDigits[Math.round(Math.random())];
    }
    const hexValue = parseInt(binarySuffix, 0x2).toString(0x10) + parseInt(binaryPrefix + currentTimestamp, 0x2).toString(0x10);
    return 'js' + hexValue;
}