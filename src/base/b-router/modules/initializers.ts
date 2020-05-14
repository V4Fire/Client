/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import globalRoutes from 'routes';
import { deprecate } from 'core/functools/deprecation';

import path, { Key, RegExpOptions } from 'path-to-regexp';
import { concatUrls } from 'core/url';

import bRouter from 'base/b-router';
import { defaultRoutes } from 'base/b-router/const';
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
					default: Boolean(defaultRoutes[name]),

					pattern,
					rgxp: pattern != null ? path(pattern, pathParams) : undefined,

					get pathParams(): Key[] {
						return pathParams;
					},

					get page(): string {
						deprecate({name: 'page', type: 'property', renamedTo: 'name'});
						return this.name;
					},

					get index(): boolean {
						deprecate({name: 'index', type: 'property', renamedTo: 'default'});
						return this.default;
					},

					meta: {
						name,

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
					default: Boolean(route.index || defaultRoutes[name]),

					alias: route.alias,
					redirect: route.redirect,

					pattern,
					rgxp: pattern != null ? path(pattern, pathParams, <RegExpOptions>route.pathOpts) : undefined,

					get pathParams(): Key[] {
						return pathParams;
					},

					get page(): string {
						deprecate({name: 'page', type: 'property', renamedTo: 'name'});
						return this.name;
					},

					get index(): boolean {
						deprecate({name: 'index', type: 'property', renamedTo: 'default'});
						return this.default;
					},

					meta: {
						...route,
						name,

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
