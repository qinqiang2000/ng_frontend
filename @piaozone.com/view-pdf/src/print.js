(function() {
    if ('mozPrintCallback' in document.createElement('canvas')) {
        return;
    }
    if ('onbeforeprint' in window) {
        var stopPropagationIfNeeded = function(event) {
            if (event.detail !== 'custom' && event.stopImmediatePropagation) {
                event.stopImmediatePropagation();
            }
        };
        window.addEventListener('beforeprint', stopPropagationIfNeeded, false);
        window.addEventListener('afterprint', stopPropagationIfNeeded, false);
    }
    HTMLCanvasElement.prototype.mozPrintCallback = undefined;
    var canvases;
    var index;
    var print = window.print;
    window.print = function print() {
        if (canvases) {
            console.warn('Ignored window.print() because of a pending print job.');
            return;
        }
        try {
            dispatchEvent('beforeprint');
        } finally {
            canvases = document.querySelectorAll('canvas');
            index = -1;
            next();
        }
    };

    function dispatchEvent(eventType) {
        var event = document.createEvent('CustomEvent');
        event.initCustomEvent(eventType, false, false, 'custom');
        window.dispatchEvent(event);
    }

    function next() {
        if (!canvases) {
            return;
        }
        renderProgress();
        if (++index < canvases.length) {
            var canvas = canvases[index];
            if (typeof canvas.mozPrintCallback === 'function') {
                canvas.mozPrintCallback({
                    context: canvas.getContext('2d'),
                    abort: abort,
                    done: next
                });
            } else {
                next();
            }
        } else {
            renderProgress();
            setTimeout(function() {
                if (!canvases) {
                    return;
                }
                print.call(window);
                setTimeout(abort, 20);
            }, 0);
        }
    }

    function abort() {
        if (canvases) {
            canvases = null;
            renderProgress();
            dispatchEvent('afterprint');
        }
    }

    function renderProgress() {
        var progressContainer = document.getElementById('mozPrintCallback-shim');

        if (canvases && canvases.length) {
            var progress = Math.round(100 * index / canvases.length);
            var progressBar = progressContainer.querySelector('progress');
            var progressPerc = progressContainer.querySelector('.relative-progress');
            progressBar.value = progress;
            progressPerc.textContent = progress + '%';
            progressContainer.removeAttribute('hidden');
            progressContainer.onclick = abort;
        } else {
            progressContainer.setAttribute('hidden', '');
        }
    }
})();

