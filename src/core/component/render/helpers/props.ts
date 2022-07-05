/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { normalizeClass, normalizeStyle } from 'core/component/render/helpers/normalizers';

export const
	isHandler = /^on[^a-z]/;

/**
 * Merges the specified props into one and returns it
 * @param args
 */
export function mergeProps(...args: Dictionary[]): Dictionary {
	const
		res: Dictionary = {};

	for (let i = 0; i < args.length; i++) {
		const
			toMerge = args[i];

		for (const key in toMerge) {
			if (key === 'class') {
				if (res.class !== toMerge.class) {
					res.class = normalizeClass(Object.cast([res.class, toMerge.class]));
				}

			} else if (key === 'style') {
				res.style = normalizeStyle(Object.cast([res.style, toMerge.style]));

			} else if (isHandler.test(key)) {
				const
					existing = res[key],
					incoming = toMerge[key];

				if (
					existing !== incoming &&
					!(Object.isArray(existing) && existing.includes(incoming))
				) {
					res[key] = Object.isTruly(existing) ? (<unknown[]>[]).concat(existing, incoming) : incoming;
				}

			} else if (key !== '') {
				res[key] = toMerge[key];
			}
		}
	}

	return res;
}
