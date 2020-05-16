/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import globalRoutes from 'routes';

import path, { Key, RegExpOptions } from 'path-to-regexp';
import { concatUrls } from 'core/url';

import bRouter from 'base/b-router';
import { defaultRoutes, isExternal } from 'base/b-router/const';
import { StaticRoutes, RouteBlueprints } from 'base/b-router/interface';

/**
 * The initializer of routes: takes static routes and compiles their
 * @param component
 */
export function initRoutes(component: bRouter): RouteBlueprints {
	return component.sync.link(wrapper);

	function wrapper(customRoutes: StaticRoutes): RouteBlueprints {
		const
			basePath = component.basePath,
			routes = customRoutes || component.engine.routes || globalRoutes,
			compiledRoutes = {};

		for (let keys = Object.keys(routes), i = 0; i < keys.length; i++) {
			const
				name = keys[i],
				route = routes[name] || {},
				pathParams = [];

			if (Object.isString(route)) {
				let
					pattern;

				if (route && basePath) {
					pattern = concatUrls(basePath, route);
				}

				compiledRoutes[name] = {
					name,

					pattern,
					rgxp: pattern != null ? path(pattern, pathParams) : undefined,

					get pathParams(): Key[] {
						return pathParams;
					},

					/** @deprecated */
					get page(): string {
						return this.name;
					},

					/** @deprecated */
					get index(): boolean {
						return this.meta.default;
					},

					meta: {
						name,
						external: isExternal.test(pattern),

						/** @deprecated */
						page: name,

						/** @deprecated */
						params: pathParams
					}
				};

			} else {
				let
					pattern;

				if (Object.isString(route.path) && basePath) {
					pattern = concatUrls(basePath, route.path);
				}

				compiledRoutes[name] = {
					name,

					pattern,
					rgxp: pattern != null ? path(pattern, pathParams, <RegExpOptions>route.pathOpts) : undefined,

					get pathParams(): Key[] {
						return pathParams;
					},

					/** @deprecated */
					get page(): string {
						return this.name;
					},

					/** @deprecated */
					get index(): boolean {
						return this.meta.default;
					},

					meta: {
						...route,

						name,
						default: Boolean(route.default || route.index || defaultRoutes[name]),

						external: route.external ??
							isExternal.test(pattern) ||
							isExternal.test(route.redirect),

						/** @deprecated */
						page: name,

						/** @deprecated */
						params: pathParams
					}
				};
			}
		}

		return compiledRoutes;
	}
}
