/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/* eslint-disable prefer-arrow-callback,no-var */

var global = new Function('return this')();

if (typeof global['setImmediate'] !== 'function') {
	global['setImmediate'] = function (fn) {
		setTimeout(fn, 0);
	}

	global['cleatImmediate'] = clearTimeout;
}

exports.loadToPrototype = loadToPrototype;
exports.loadToConstructor = loadToConstructor;

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
					return fn[1].apply(fn[1], [this].concat(Array.from(arguments)));
				};

			} else {
				for (var key in fn) {
					if (fn.hasOwnProperty(key)) {
						(function (key) {
							obj[0].prototype[key] = function () {
								return fn[key].apply(fn[key], [this].concat(Array.from(arguments)));
							};
						})(key);
					}
				}
			}
		});
	});
}
