/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type Friend from 'components/friends/friend';

/**
 * Retrieves the given object values and stores them in the current component state
 * (you can pass a complex property path using dots as delimiters).
 *
 * If a key from an object matches a bean method by name, that method will be called with arguments taken from the value
 * of that key. If the value is an array, then the elements of the array will be passed as arguments to the method.
 *
 * The function returns an array of promises of performed operations: results of functions, etc.
 *
 * @param data
 *
 * @example
 * ```js
 * await Promise.all(this.state.set({
 *   someProperty: 1,
 *   'mods.someMod': true,
 *   someMethod: [1, 2, 3],
 *   anotherMethod: {}
 * }));
 * ```
 */
export function set(this: Friend, data: Nullable<Dictionary>): Array<Promise<unknown>> {
	console.log('client set');
	console.log(Object.fastClone(data));

	if (data == null) {
		return [];
	}

	const
		promises: Array<Promise<unknown>> = [];

	Object.entries(data).forEach(([key, newVal]) => {
		const
			p = key.split('.'),
			originalVal = this.field.get(key);

		// Is property setter
		if (Object.isFunction(originalVal)) {
			const
				res = originalVal.call(this.ctx, ...Array.concat([], newVal));

			if (Object.isPromise(res)) {
				promises.push(res);
			}

		// Modifier
		} else if (p[0] === 'mods') {
			let
				res;

			if (newVal == null) {
				res = this.ctx.removeMod(p[1]);

			} else {
				res = this.ctx.setMod(p[1], newVal);
			}

			if (Object.isPromise(res)) {
				promises.push(res);
			}

		// Field
		} else if (!Object.fastCompare(newVal, originalVal)) {
			this.field.set(key, newVal);
		}

		this.ctx.hydrationStore?.set(this.componentId, key, Object.cast(newVal));
	});

	return promises;
}
