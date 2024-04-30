/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/* eslint-disable no-var, vars-on-top, object-shorthand */

import GLOBAL from 'core/shims/global';

if (typeof GLOBAL['setImmediate'] !== 'function') {
	(function setImmediateShim() {
		if (typeof Promise !== 'function') {
			GLOBAL['setImmediate'] = function setImmediate(cb) {
				return setTimeout(cb, 0);
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

		GLOBAL['setImmediate'] = function setImmediate(cb) {
			var
				id,
				pos = i++;

			queue[pos] = function exec() {
				delete map[id];
				cb();
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
