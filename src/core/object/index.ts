/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:core/object/README.md]]
 * @packageDocumentation
 */

import { SelectParams } from 'core/object/interface';
export * from 'core/object/interface';

/**
 * Finds an element from an object by the specified parameters
 *
 * @param obj - object for searching
 * @param params - search parameters
 *
 * @example
 * ```js
 * select([{test: 1}], {where: {test: 1}}) // {test: 1}
 * select({test: 1}, {where: {test: 1}}) // {test: 1}
 *
 * // The array is interpreted as "or"
 * select({test: 2}, {where: [{test: 1}, {test: 2}]}) // {test: 2}
 * select([{test: 1}, {test: 2}], {where: {test: 2}}) // {test: 2}
 * select({test: {t: 10}}, {where: {t: 10}, from: 'test'}) // {t: 10}
 * ```
 */
export function select<T = unknown>(obj: unknown, params: SelectParams): CanUndef<T> {
	const
		{where, from} = params;

	let
		target = obj,
		res;

	if ((Object.isPlainObject(target) || Object.isArray(target)) && from != null) {
		res = target = Object.get(target, String(from));
	}

	const getMatch = (obj, where) => {
		if (!obj) {
			return false;
		}

		if (!where || obj === where) {
			return obj;
		}

		if (!Object.isPlainObject(where) && !Object.isArray(where)) {
			return false;
		}

		let
			res;

		Object.forEach<string, string>(where, (v, k) => {
			if (Object.isPlainObject(obj) && !(k in obj)) {
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
		for (let obj = (<SelectParams['where'][]>[]).concat(where || []), i = 0; i < obj.length; i++) {
			const
				where = obj[i];

			if (Object.isPlainObject(target)) {
				const
					match = getMatch(target, where);

				if (match) {
					res = match;
					break;
				}
			}

			if (Object.isArray(target) && target.some((el) => (getMatch(el, where) ? (res = el, true) : false))) {
				break;
			}
		}
	}

	return res;
}
