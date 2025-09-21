// broser js
window.addEventListener('DOMContentLoaded', function () {
    var envInfoArr = [];
    for (var _i = 0, _a = ['chrome', 'node', 'electron']; _i < _a.length; _i++) {
        var dependency = _a[_i];
        envInfoArr.push("<p>".concat(dependency, ": ").concat(process.versions[dependency], "</p>"));
    }
    console.log('envInfoAr', envInfoArr);
});
//# sourceMappingURL=preload.js.map