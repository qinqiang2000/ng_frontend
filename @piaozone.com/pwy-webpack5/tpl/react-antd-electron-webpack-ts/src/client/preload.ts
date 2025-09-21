// broser js

window.addEventListener('DOMContentLoaded', () => {
    var envInfoArr = [];
    for (const dependency of ['chrome', 'node', 'electron']) {
        envInfoArr.push(`<p>${dependency}: ${process.versions[dependency]}</p>`);
    }
    console.log('envInfoAr', envInfoArr);
});
