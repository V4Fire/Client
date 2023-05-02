/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { resolvePathParameters } from 'core/router';

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
		params,
		pathParams
	} = route;

	Object.assign(params, resolvePathParameters(pathParams, params));

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

	if (meta.paramsFromQuery !== false && Object.isArray(pathParams)) {
		pathParams.forEach((param) => {
			let
				{name} = param;

			const noAliasesInParams = param.aliases.every(
				(alias) => !Object.hasOwnProperty(params, alias)
			);

			if (!Object.hasOwnProperty(params, name) && noAliasesInParams) {
				let
					queryVal = query[name];

				if (queryVal === undefined) {
					const alias = param.aliases.find(
						(alias) => Object.hasOwnProperty(query, alias)
					);

					if (alias != null) {
						name = alias;
						queryVal = query[alias];
					}
				}

				if (queryVal !== undefined && new RegExp(param.pattern).test(String(queryVal))) {
					params[name] = queryVal;
				}
			}

			delete query[name];
		});
	}
}
