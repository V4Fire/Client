/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * Cache of initialized modules
 */
export const moduleCache: Map<unknown, unknown> = (() => {
	let
		resolve,
		cursor;

	const
		map = new Map(),
		setToMap = map.set.bind(map);

	map.set = (id, module) => {
		setToMap(id, module);

		if (Object.isFunction(resolve)) {
			resolve({id, module});
			resolve = undefined;
		}

		return map;
	};

	// @ts-ignore (invalid type)
	map[Symbol.iterator] = () => {
		const
			iterator = map.entries();

		let
			staticCursor: IteratorResult<unknown>;

		return {
			next: () => {
				staticCursor = iterator.next();

				console.log(staticCursor);

				if (!staticCursor.done) {
					const
						el = <unknown[]>staticCursor.value;

					return {
						done: false,
						value: {
							id: el[0],
							module: el[1]
						}
					};
				}

				if (cursor != null) {
					return cursor;
				}

				cursor = {
					done: false,
					value: new Promise((r) => {
						resolve = (val) => {
							iterator.next();
							r(val);
						};
					})
				};

				return cursor;
			}
		};
	};

	return <any>map;
})();
