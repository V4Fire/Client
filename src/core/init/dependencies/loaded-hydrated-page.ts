/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import routes from 'routes';
import { getRoute, compileStaticRoutes } from 'core/router';

import type { State } from 'core/component';

/**
 * Loads the router page required for hydration
 * @param state - the global application state
 */
export async function loadedHydratedPage(state: State): Promise<void> {
	if (!HYDRATION) {
		return;
	}

	try {
		const
			compiledRoutes = compileStaticRoutes(routes),
			defaultRoute = Object.values(compiledRoutes).find((route) => route?.meta.default);

		const
			routePath = state.location.pathname + state.location.search,
			route = getRoute(routePath, compiledRoutes, {defaultRoute});

		if (route != null) {
			// FIXME: https://github.com/V4Fire/Client/issues/1000
			Object.mixin({propsToCopy: 'new'}, route.meta, route.meta.meta);
			Object.mixin({propsToCopy: 'new'}, route.params, route.meta.params);
			Object.mixin({propsToCopy: 'new'}, route.query, route.meta.query);

			await route.meta.load?.();
			// eslint-disable-next-line require-atomic-updates
			state.route = route;
		}
	} catch {}
}
