/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { routeNames } from 'base/b-router/const';
import type { Route, EngineRoute, RouteBlueprint, InitialRoute } from 'base/b-router/interface';

/**
 * Returns a name of the specified route
 * @param route
 */
export function getRouteName(route?: Route | EngineRoute | RouteBlueprint | InitialRoute): CanUndef<string> {
	if (Object.isPlainObject(route)) {
		for (let i = 0; i < routeNames.length; i++) {
			const
				val = route[routeNames[i]];

			if (val != null) {
				return val;
			}
		}

		return undefined;
	}

	return Object.isString(route) ? route : undefined;
}
