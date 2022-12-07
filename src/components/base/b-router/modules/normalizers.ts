/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type bRouter from 'components/base/b-router/b-router';
import type { AppliedRoute } from 'components/base/b-router/interface';

/**
 * Fills the route parameters with default values and more
 *
 * @param route - the route to fill
 * @param router - the router instance
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

	defs.forEach(([def, original]) => {
		if (!Object.isDictionary(def)) {
			return;
		}

		Object.entries(def).forEach(([key, val]) => {
			if (Object.isFunction(val)) {
				val = val(router);
				def[key] = val;
			}

			if (val !== undefined && original[key] === undefined) {
				original[key] = val;
			}
		});
	});

	if (meta.paramsFromQuery !== false && Object.isArray(route.pathParams)) {
		route.pathParams.forEach((param) => {
			const
				{name} = param;

			if (params[name] === undefined) {
				const
					queryVal = query[name];

				if (queryVal !== undefined && new RegExp(param.pattern).test(String(queryVal))) {
					params[name] = queryVal;
				}
			}

			delete query[name];
		});
	}
}
