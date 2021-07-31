/* eslint-disable prefer-arrow-callback,no-var,no-new-func,object-shorthand,vars-on-top,prefer-rest-params */

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

var GLOBAL = Function('return this')();
GLOBAL.TPLS = GLOBAL.TPLS || Object.create(null);

if (typeof GLOBAL['setImmediate'] !== 'function') {
	(function setImmediateShim() {
		if (typeof Promise !== 'function') {
			GLOBAL['setImmediate'] = function setImmediate(fn) {
				return setTimeout(fn, 0);
			};

			GLOBAL['clearImmediate'] = clearTimeout;
			return;
		}

		var
			i = 0,
			resolved = 0;

		var
			map = {},
			queue = new Array(16);

		var
			fired = false,
			promise = Promise.resolve();

		function getRandomInt(min, max) {
			return Math.floor(Math.random() * (max - min + 1)) + min;
		}

		function call() {
			var
				track = queue;

			i = 0;
			queue = new Array(16);
			fired = false;

			for (var j = 0; j < track.length; j++) {
				var
					fn = track[j];

				if (fn) {
					fn();
				}
			}

			if (resolved++ % 10 === 0) {
				promise = Promise.resolve();
			}

			track = null;
		}

		GLOBAL['setImmediate'] = function setImmediate(fn) {
			var
				id,
				pos = i++;

			queue[pos] = function exec() {
				delete map[id];
				fn();
			};

			if (!fired) {
				fired = true;
				promise = promise.then(call);
			}

			while (map[id = getRandomInt(0, 10e3)]) {
				// Empty
			}

			map[id] = {queue: queue, pos: pos};
			return id;
		};

		GLOBAL['clearImmediate'] = function clearImmediate(id) {
			var
				obj = map[id];

			if (obj) {
				obj.queue[obj.pos] = null;
				delete map[id];
			}
		};
	}());
}

exports.loadToPrototype = loadToPrototype;
exports.loadToConstructor = loadToConstructor;

function loadToConstructor(list) {
	list.forEach(function cb(obj) {
		obj.slice(1).forEach(function cb(fn) {
			if (Array.isArray(fn)) {
				obj[0][fn[0]] = fn[1];

			} else {
				for (var key in fn) {
					if (fn.hasOwnProperty(key)) {
						(function isolate(key) {
							obj[0][key] = fn[key];
						}(key));
					}
				}
			}
		});
	});
}

function loadToPrototype(list) {
	list.forEach(function cb(obj) {
		obj.slice(1).forEach(function cb(fn) {
			if (Array.isArray(fn)) {
				obj[0].prototype[fn[0]] = function cb() {
					return fn[1].apply(fn[1], [this].concat(Array.from(arguments)));
				};

			} else {
				for (var key in fn) {
					if (fn.hasOwnProperty(key)) {
						(function isolate(key) {
							obj[0].prototype[key] = function cb() {
								return fn[key].apply(fn[key], [this].concat(Array.from(arguments)));
							};
						}(key));
					}
				}
			}
		});
	});
}
