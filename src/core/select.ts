/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

export interface ProviderSelectParams {
	from?: string | number;
	where?: Dictionary | Dictionary[];
}

/**
 * Finds an element by specified params
 *
 * @param value
 * @param params
 */
export default function select<T extends unknown = unknown>(value: unknown, params: ProviderSelectParams): CanUndef<T> {
	const
		{where, from} = params;

	let
		target = value,
		res;

	if ((Object.isObject(target) || Object.isArray(target)) && from != null) {
		res = target = Object.get(target, String(from));
	}

	const getMatch = (obj, where) => {
		if (!obj) {
			return false;
		}

		if (!where || obj === where) {
			return obj;
		}

		if (!Object.isObject(where) && !Object.isArray(where)) {
			return false;
		}

		let res;

		Object.forEach<string, string>(where, (v, k) => {
			if (Object.isObject(obj) && !(k in obj)) {
				return;
			}

			if (v !== obj[k]) {
				return;
			}

			res = obj;
		});

		return res;
	};

	if (where) {
		const
			whereArray = (<ProviderSelectParams['where'][]>[]).concat(where);

		for (let i = 0; i < whereArray.length; i++) {
			const
				w = whereArray[i];

			if (Object.isObject(target)) {
				const
					match = getMatch(target, w);

				if (match) {
					res = match;
					break;
				}
			}

			if (Object.isArray(target) && target.some((a) => (getMatch(a, w) ? (res = a, true) : false))) {
				break;
			}
		}
	}

	return res;
}
