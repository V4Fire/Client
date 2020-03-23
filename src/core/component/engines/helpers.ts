/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { ignoreLabel } from 'core/component/watch';

const
	toOriginal = Symbol('Link to an original object');

/**
 * Returns a "fake" copy of the specified (weak)map/(weak)set object
 * @param obj
 */
export function fakeMapSetCopy<
	T extends Map<unknown, unknown> | WeakMap<object, unknown> | Set<unknown> | WeakSet<object>
>(obj: T): T {
	obj = obj[toOriginal] || obj;

	const
		Constructor = obj.constructor,
		proto = Constructor.prototype;

	// @ts-ignore
	const wrap = new Constructor();

	for (let keys = Object.getOwnPropertyNames(proto), i = 0; i < keys.length; i++) {
		const
			key = keys[i],
			desc = Object.getOwnPropertyDescriptor(proto, key);

		if (!desc) {
			continue;
		}

		if (Object.isFunction(desc.value)) {
			Object.defineProperty(wrap, key, {
				...desc,
				value: obj[key].bind(obj)
			});

		} else if (Object.isFunction(desc.get)) {
			Object.defineProperty(wrap, key, {
				...desc,
				get: () => obj[key],
				set: desc.set && ((v) => obj[key] = v)
			});
		}
	}

	wrap[toOriginal] = obj;
	wrap[ignoreLabel] = true;

	return wrap;
}
