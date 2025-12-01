
var wasmFibFn = null;
var wasmReady = false;

if (typeof Module !== 'undefined') {
    Module.onRuntimeInitialized = function () {
        try {
            wasmFibFn = Module.cwrap('fib', 'number', ['number']);
            wasmReady = true;
            console.log('WASM runtime initialized');

            var runWasmEl = document.getElementById('runWasm');
            var compareEl = document.getElementById('compare');
            var testEl = document.getElementById('test');
            if (runWasmEl) runWasmEl.disabled = false;
            if (compareEl) compareEl.disabled = false;
            if (testEl) testEl.disabled = false;
        } catch (e) {
            console.warn('Failed to cwrap wasm function:', e);
        }
    };
}



// javascript fibonacci implementation
        function jsFib(n) {
            if (n === 1) return 1;
            if (n === 2) return 1;
            return jsFib(n-1) + jsFib(n-2);
        }

        // get wasm function
        function getWasmFibFunction() {
            // i have no idea
            try {
                if (typeof Module !== 'undefined' && Module.cwrap) {
                    try {
                        var wrapped = Module.cwrap('fib', 'number', ['number']);
                        if (typeof wrapped === 'function') return wrapped;
                    } catch(e) {
                        console.log("error:", e.message);
                    }
                }
            } catch(e) {
                console.log("error:", e.message);
            }
        }

        function runTests() {
            var wasmFn = getWasmFibFunction();
            let jsAvg = [];
            let wasmAvg = [];
            let jsSum = 0;
            let wasmSum = 0;
            if(!wasmFn) {
                show('no wasm function found');
                return;
            }
            for(let i = 0; i < 20; i++) {
                let n = 40;
                var j = timeAndRun(jsFib, n);
                var w = timeAndRun(wasmFn, n);
                let equalivalent = (j.result === w.result);
                show(`n=${n}  JS=${j.result} (${j.timeMs.toFixed(0)}ms)  WASM=${w.result} (${w.timeMs.toFixed(0)}ms)  equal=${equalivalent}`);
                jsAvg.push(j);
                wasmAvg.push(w);
            }
            jsAvg.forEach((time) => {
                jsSum += time.timeMs;
            })
            wasmAvg.forEach((time) => {
                wasmSum += time.timeMs;
            })
            show(`javascript average: ${jsSum / 20}ms  wasmAverage: ${wasmSum / 20}ms`)
        }

        function show(msg) {
            var out = document.getElementById('out');
            out.textContent = msg + '\n' + out.textContent;
        }

        function timeAndRun(func, arg) {
            var t0 = performance.now();
            var res = func(arg);
            var t1 = performance.now();
            return { result: res, timeMs: t1 - t0 };
        }

        document.getElementById('runJs').addEventListener('click', function() {
            var n = Number(document.getElementById('fibN').value) || 0;
            var r = timeAndRun(jsFib, n);
            show(`JS fib(${n}) = ${r.result}    time=${r.timeMs.toFixed(3)}ms`);
        });

        document.getElementById('runWasm').addEventListener('click', function() {
            var n = Number(document.getElementById('fibN').value) || 0;
            var fn = getWasmFibFunction();
            if (!fn) {
                show('No exported wasm fib function found.');
                return;
            }
            var r = timeAndRun(fn, n);
            show(`WASM fib(${n}) = ${r.result}    time=${r.timeMs.toFixed(3)}ms`);
        });

        document.getElementById('compare').addEventListener('click', function() {
            var n = Number(document.getElementById('fibN').value) || 0;
            var wasmFn = getWasmFibFunction();
            if (!wasmFn) {
                show('No exported wasm fib function found.');
                return;
            }
            var j = timeAndRun(jsFib, n);
            var w = timeAndRun(wasmFn, n);
            var ok = (j.result === w.result);
            show(`COMPARE n=${n}  JS=${j.result} (${j.timeMs.toFixed(0)}ms)  WASM=${w.result} (${w.timeMs.toFixed(0)}ms)  equal=${ok}`);
        });

        document.getElementById('clear').addEventListener('click', function() {
            var out = document.getElementById('out');
            out.textContent = '';
        });
        document.getElementById('test').addEventListener('click', runTests);