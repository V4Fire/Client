"use strict";
/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Resize = void 0;
var tslib_1 = require("tslib");
var resize_1 = tslib_1.__importDefault(require("core/component/directives/resize/resize"));
var engines_1 = require("core/component/engines");
var ResizeInstance = new resize_1.default();
exports.Resize = ResizeInstance;
engines_1.ComponentDriver.directive('resize', {
    inserted: function (el, opts) {
        var p = getOpts(opts);
        if (!p) {
            return;
        }
        ResizeInstance.observe(el, p);
    },
    update: function (el, opts) {
        var oldParams = getOpts(tslib_1.__assign(tslib_1.__assign({}, opts), { value: opts.oldValue })), newParams = getOpts(opts);
        if (Object.fastCompare(oldParams, newParams)) {
            return;
        }
        ResizeInstance.unobserve(el);
        if (newParams) {
            ResizeInstance.observe(el, newParams);
        }
    },
    unbind: function (el) {
        ResizeInstance.unobserve(el);
    }
});
/**
 * Returns a directive options
 *
 * @param options
 * @private
 */
function getOpts(_a) {
    var value = _a.value, modifiers = _a.modifiers;
    if (!value) {
        return;
    }
    var valueDict = Object.isFunction(value) ? {
        callback: value
    } : value;
    if (!valueDict.callback) {
        return;
    }
    var isNoMods = Object.keys(modifiers).length === 0;
    return tslib_1.__assign({ watchWidth: isNoMods || modifiers.width, watchHeight: isNoMods || modifiers.height }, valueDict);
}
