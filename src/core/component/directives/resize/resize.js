"use strict";
/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.$$ = void 0;
var tslib_1 = require("tslib");
var async_1 = tslib_1.__importDefault(require("core/async"));
var symbol_1 = tslib_1.__importDefault(require("core/symbol"));
exports.$$ = symbol_1.default();
var Resize = /** @class */ (function () {
    function Resize() {
        /**
         * Map of observable elements
         */
        this.elements = new Map();
        /**
         * Queue of size calculation tasks
         * (only for environments that aren't support ResizeObserver)
         */
        this.calculateQueue = [];
        /**
         * Async instance
         */
        this.async = new async_1.default(this);
        if (!this.hasResizeObserver) {
            this.initResizeEvent();
        }
    }
    Object.defineProperty(Resize.prototype, "hasResizeObserver", {
        /**
         * True if the environment supports ResizeObserver
         */
        get: function () {
            return 'ResizeObserver' in globalThis;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Starts to observe resizing of the specified element
     *
     * @param el
     * @param params
     */
    Resize.prototype.observe = function (el, params) {
        if (this.elements.has(el)) {
            return false;
        }
        var observable = this.createObservable(el, params);
        if (this.hasResizeObserver) {
            this.createResizeObserver(observable);
        }
        else {
            this.calculateQueue.push(observable);
            this.async.setTimeout(this.calculate.bind(this), 100, { label: exports.$$.calculateTimeout, join: true });
        }
        this.elements.set(el, observable);
        return true;
    };
    /**
     * Stops to observe resizing of the specified element
     * @param el
     */
    Resize.prototype.unobserve = function (el) {
        var _a;
        var observable = this.elements.get(el);
        (_a = observable === null || observable === void 0 ? void 0 : observable.observer) === null || _a === void 0 ? void 0 : _a.disconnect();
        return this.elements.delete(el);
    };
    /**
     * Clears all observers
     */
    Resize.prototype.clear = function () {
        this.elements.forEach(function (_a) {
            var observer = _a.observer;
            observer && observer.disconnect();
        });
        this.elements.clear();
    };
    /**
     * Creates a new observable element
     *
     * @param el
     * @param params
     */
    Resize.prototype.createObservable = function (el, params) {
        return tslib_1.__assign({ node: el }, params);
    };
    /**
     * Creates an instance of ResizeObserver
     * @param observable
     */
    Resize.prototype.createResizeObserver = function (observable) {
        var _this = this;
        var getSize = function (rect) { return ({
            width: Math.floor(rect.width),
            height: Math.floor(rect.height)
        }); };
        observable.observer = new ResizeObserver(function (_a) {
            var _b = tslib_1.__read(_a, 1), contentRect = _b[0].contentRect;
            var newSize = getSize(contentRect);
            if (observable.height === undefined) {
                _this.setInitialSize(observable, newSize);
                return;
            }
            _this.onElementResize(observable, newSize);
        });
        observable.observer.observe(observable.node);
    };
    /**
     * Sets an initial size of the specified observable
     *
     * @param observable
     * @param size
     */
    Resize.prototype.setInitialSize = function (observable, size) {
        Object.assign(observable, size);
        if (observable.immediate) {
            observable.callback(observable, size);
        }
    };
    /**
     * Calculates size of elements
     */
    Resize.prototype.calculate = function () {
        var _this = this;
        if (!this.calculateQueue.length) {
            return;
        }
        this.async.requestAnimationFrame(function () {
            for (var i = 0; i < _this.calculateQueue.length; i++) {
                var observable = _this.calculateQueue[i], newSize = _this.getElSize(observable.node);
                if (observable.height === undefined) {
                    _this.setInitialSize(observable, newSize);
                    continue;
                }
                _this.onElementResize(observable, newSize);
            }
            _this.calculateQueue = [];
        }, { label: exports.$$.calculateSize });
    };
    /**
     * Returns true if the observable callback should be executed
     *
     * @param observable
     * @param newSize
     */
    Resize.prototype.shouldCallCallback = function (observable, newSize) {
        var watchWidth = observable.watchWidth, watchHeight = observable.watchHeight, width = observable.width, height = observable.height;
        var newWidth = newSize.width, newHeight = newSize.height;
        var res = false;
        if (watchWidth) {
            res = width !== newWidth;
        }
        if (watchHeight && !res) {
            res = height !== newHeight;
        }
        return res;
    };
    /**
     * Returns a size of the specified element
     * @param el
     */
    Resize.prototype.getElSize = function (el) {
        return {
            width: el.clientWidth,
            height: el.clientHeight
        };
    };
    /**
     * Initializes a resize event listener
     */
    Resize.prototype.initResizeEvent = function () {
        var _this = this;
        var $a = this.async;
        $a.on(window, 'resize', function () {
            $a.requestIdleCallback(function () {
                _this.calculateQueue = Array.from(_this.elements, function (v) { return v[1]; });
                _this.calculate();
            }, { label: exports.$$.callSubscribers, join: true });
        }, { label: exports.$$.resize });
    };
    /**
     * Handler: element was resized
     *
     * @param observable
     * @param newSize
     */
    Resize.prototype.onElementResize = function (observable, newSize) {
        var oldSize = {
            width: observable.width,
            height: observable.height
        };
        if (this.shouldCallCallback(observable, newSize)) {
            observable.callback(observable, newSize, oldSize);
        }
        Object.assign(observable, newSize);
    };
    return Resize;
}());
exports.default = Resize;
