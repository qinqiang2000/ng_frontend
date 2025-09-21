export function sleep(timeout) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(null);
        }, timeout || 1000);
    });
}