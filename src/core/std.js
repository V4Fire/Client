/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/* eslint-disable prefer-arrow-callback,no-var */

exports.loadToPrototype = loadToPrototype;
exports.loadToConstructor = loadToConstructor;

require('core-js/modules/web.immediate');
require('sugar/locales/ru');

loadToConstructor([
	[
		Object,
		['toQueryString', require('sugar/object/toQueryString')],
		['fromQueryString', require('sugar/object/fromQueryString')],
		['isEqual', require('sugar/object/isEqual')],
		['isObject', require('sugar/object/isObject')],
		['reject', require('sugar/object/reject')],
		['select', require('sugar/object/select')]
	],

	[
		RegExp,
		['escape', require('sugar/regexp/escape')]
	],

	[
		Number,
		['range', require('sugar/number/range')]
	],

	[
		Date,
		['create', require('sugar/date/create')],
		['range', require('sugar/date/range')]
	],

	[
		Range,
		require('sugar/range').Range
	]
]);

loadToPrototype([
	[
		String,
		['dasherize', require('sugar/string/dasherize')],
		['camelize', require('sugar/string/camelize')]
	],

	[
		Number,
		['second', require('sugar/number/second')],
		['seconds', require('sugar/number/seconds')],
		['floor', require('sugar/number/floor')],
		['format', require('sugar/number/format')]
	],

	[
		Function,
		['once', require('sugar/function/once')],
		['memoize', require('sugar/function/memoize')],
		['debounce', require('sugar/function/debounce')],
		['throttle', require('sugar/function/throttle')]
	],

	[
		Array,
		['union', require('sugar/array/union')]
	],

	[
		Date,
		require('sugar/date').Date
	]
]);

function loadToConstructor(list) {
	list.forEach(function (obj) {
		obj.slice(1).forEach(function (fn) {
			if (Array.isArray(fn)) {
				obj[0][fn[0]] = fn[1];

			} else {
				for (var key in fn) {
					if (fn.hasOwnProperty(key)) {
						(function (key) {
							obj[0][key] = fn[key];
						})(key);
					}
				}
			}
		});
	});
}

function loadToPrototype(list) {
	list.forEach(function (obj) {
		obj.slice(1).forEach(function (fn) {
			if (Array.isArray(fn)) {
				obj[0].prototype[fn[0]] = function () {
					return fn[1](this, ...arguments);
				};

			} else {
				for (var key in fn) {
					if (fn.hasOwnProperty(key)) {
						(function (key) {
							obj[0].prototype[key] = function () {
								return fn[key](this, ...arguments);
							};
						})(key);
					}
				}
			}
		});
	});
}
