/*!
 * V4Fire Core
 * https://github.com/V4Fire/Core
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Core/blob/master/LICENSE
 */

export type Instance<K = unknown, V = unknown> =
	WeakMap<object, V> |
	WeakSet<object> |
	Map<K, V> |
	Set<K>;

export interface Params {
	/**
	 * If true, will provide additional parameters to a callback, such as which method called the callback
	 */
	info?: boolean;

	/**
	 * Black list of methods to ignore
	 */
	ignore?: string[];

	/**
	 * If false, then a callback will be called using setImmediate
	 */
	immediate?: boolean;
}

export const shimTable = {
	weakMap: {is: Object.isWeakMap, methods: ['set', 'delete']},
	weakSet: {is: Object.isWeakSet, methods: ['add', 'delete']},
	map: {is: Object.isMap, methods: ['set', 'delete', 'clear']},
	set: {is: Object.isSet, methods: ['add', 'delete', 'clear']}
};

/**
 * Creates a specified data structure which will call a specified callback on every mutation
 *
 * @param instance
 * @param cb
 * @param [params]
 *
 * @example
 * bindMutationHook(new Map(), () => console.log(123));
 * const s = bindMutationHook(new Set(), () => console.log(123));
 * s.add(1);
 * // 123
 */
export function bindMutationHooks<T extends Instance = Instance<unknown, unknown>>(
	instance: T,
	cb: Function,
	params: Params = {}
): T {
	const {
		ignore,
		info,
		immediate
	} = {immediate: false, ...params};

	let
		timerId;

	const wrappedCb = (...args) => {
		if (!timerId && !immediate) {
			timerId = setImmediate(() => {
				cb(...args);
				timerId = undefined;
			});

		} else if (immediate) {
			cb(...args);
		}
	};

	const shim = (ctx, method, name, ...args) => {
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
