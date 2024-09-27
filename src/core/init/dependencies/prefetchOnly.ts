/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { State } from 'core/component';
import routes from 'routes';
import { getRoute, compileStaticRoutes } from 'core/router';

/**
 * Loads the router page required for hydration
 * @param state - the global application state
 */
export async function prefetchOnly(state: State): Promise<void> {
	if (!SSR) {
		return;
	}

	const
		compiledRoutes = compileStaticRoutes(routes),
		defaultRoute = Object.values(compiledRoutes).find((route) => route?.meta.default);

	const
		routePath = state.location.pathname + state.location.search,
		route = getRoute(routePath, compiledRoutes, {defaultRoute});

	if (state.initOnly && route != null) {
		await route.meta.prefetch?.();
	}
}
