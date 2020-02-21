/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { bindMutationHooks } from 'core/object/watch/wrap';

export function watch(obj: object, cb) {
	function watch(obj, cb, path) {
		if (!obj || typeof obj !== 'object') {
			return;
		}

		if (!Object.isPlainObject(obj)) {
			bindMutationHooks(obj, cb, {path});
		}

		return obj;

		if (typeof Proxy === 'function') {
			if (!Object.isPlainObject(obj) && !Object.isArray(obj)) {
				bindMutationHooks(obj, cb, {path});
			}

			return new Proxy(obj, {
				get: (target, key, receiver) => {
					const
						val = Reflect.get(target, key, receiver);

					if (Object.isPlainObject(val) || Object.isArray(val)) {
						return watch(val, cb, (<unknown[]>[]).concat(path ?? [], key));
					}

					if (Object.isPlainObject(target) || Object.isArray(target)) {
						return val;
					}

					return Object.isFunction(val) ? val.bind(target) : val;
				},

				set: (target, key, val, receiver) => {
					if (Object.isArray(target) && String(Number(key)) === key) {
						key = Number(key);
					}

					const
						oldVal = Reflect.get(target, key, receiver);

					if (oldVal !== val && Reflect.set(target, key, val, receiver)) {
						cb(val, oldVal, (<unknown[]>[]).concat(path ?? [], key));
					}

					return true;
				}
			});
		}
	}

	return watch(obj, cb);
}

let foo = [];

foo = watch(foo, (val, oldVal, key) => {
	console.log(555, val, oldVal, key);
});

foo.push(1, 2);
foo.push(1, 4);
foo.splice(1, 4, 34, 65);
console.log(foo.length);
