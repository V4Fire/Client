/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type bRouter from '@src/base/b-router/b-router';
import type { AppliedRoute } from '@src/base/b-router/interface';

/**
 * Fills route parameters with the default values and other stuff
 *
 * @param route
 * @param router - link to a router instance
 */
export function fillRouteParams(route: AppliedRoute, router: bRouter): void {
	const {
		meta,
		query,
		params
	} = route;

	const defs: Array<[CanUndef<Dictionary>, Dictionary]> = [
		[meta.query, query],
		[meta.params, params],
		[meta.meta, meta]
	];

	for (let i = 0; i < defs.length; i++) {
		const
			[def, original] = defs[i];

		if (!Object.isDictionary(def)) {
			continue;
		}

		for (let keys = Object.keys(def), i = 0; i < keys.length; i++) {
			const
				key = keys[i];

			let
				val = def[key];

			if (Object.isFunction(val)) {
				val = val(router);
				def[key] = val;
			}

			if (val !== undefined && original[key] === undefined) {
				original[key] = val;
			}
		}
	}

	if (meta.paramsFromQuery !== false && Object.isArray(route.pathParams)) {
		for (let o = route.pathParams, i = 0; i < o.length; i++) {
			const
				param = o[i],
				{name} = param;

			if (params[name] === undefined) {
				const
					queryVal = query[name];

				if (queryVal !== undefined && new RegExp(param.pattern).test(String(queryVal))) {
					params[name] = queryVal;
				}
			}

			delete query[name];
		}
	}
}
