/*!
 * V4Fire Core
 * https://github.com/V4Fire/Core
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Core/blob/master/LICENSE
 */

export type Instance = WeakMap<object, unknown> |
	WeakSet<object> |
	Map<unknown, unknown> |
	Set<unknown>;

export interface Params {
	/**
	 * Should provide additional parameters, such as which method called the callback
	 */
	info?: boolean;

	/**
	 * Don't call a callback to the list of specified methods
	 *   *) works only without proxy
	 */
	ignore?: string[];

	/**
	 * If true, then a callback will be called using setImmediate
	 */
	deffer?: boolean;
}

/**
 * Creates a specified data structure which will call a specified callback on every mutation
 *
 * @param instance
 *    *) If instance is a dictionary, then a proxy will be used to track changes
 *
 * @param cb
 * @param [params]
 *
 * @example
 * wrapStructure(new Map(), () => console.log(123));
 * const s = wrapStructure(new Set(), () => console.log(123));
 * s.add(1);
 * // 123
 */
export function wrapStructure<T extends Instance>(
	instance: T,
	cb: Function,
	params: Params = {}
): T {
	const {
		ignore,
		info,
		deffer
	} = {deffer: true, ...params};

	let immediateId;

	const wrappedCb = (...args) => {
		if (!immediateId && deffer) {
			immediateId = setImmediate(() => {
				cb(...args);
				immediateId = undefined;
			});

		} else if (!deffer) {
			cb(...args);
		}
	};

	const shimTable = {
		weakMap: {is: Object.isWeakMap, methods: ['set', 'delete']},
		weakSet: {is: Object.isWeakSet, methods: ['add', 'delete']},
		map: {is: Object.isMap, methods: ['set', 'delete', 'clear']},
		set: {is: Object.isSet, methods: ['add', 'delete', 'clear']}
	};

	const shim = (ctx: unknown, method: Function, name: string, ...args: unknown[]) => {
		const
			a = info ? args.concat(name, instance) : [],
			res = method.call(ctx, ...args);

		wrappedCb(...a);
		return res;
	};

	for (let i = 0, keys = Object.keys(shimTable); i < keys.length; i++) {
		const
			k = keys[i],
			{is, methods} = shimTable[k];

		if (!is(instance)) {
			continue;
		}

		for (let j = 0; j < methods.length; j++) {
			const
				method = methods[j],
				fn = instance[method];

			if (ignore && ignore.includes(method)) {
				continue;
			}

			instance[method] = function (...args: unknown[]): unknown {
				return shim(this, fn, method, ...args);
			};
		}

		break;
	}

	return instance;
}
