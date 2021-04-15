/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import path from 'path-to-regexp';

import { concatURLs, toQueryString } from 'core/url';
import { deprecate } from 'core/functools/deprecation';

import {

	Route,
	AppliedRoute,
	RouteBlueprint,
	RouteBlueprints,
	RouteAPI,
	InitialRoute,
	TransitionOptions,
	AdditionalGetRouteOpts,

	qsClearFixRgxp,
	routeNames

} from 'core/router';

/**
 * Returns a name of the specified route
 * @param [route]
 */
export function getRouteName(route?: AppliedRoute | Route | RouteBlueprint | InitialRoute): CanUndef<string> {
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

/**
 * Returns a route object by the specified name or path
 *
 * @param ref - route name or path
 * @param routes - available routes to get a route object by name or path
 * @param [opts] - additional options
 *
 * @example
 * ```js
 * routes = {
 *   demo: {
 *     route: '/demo'
 *   }
 * };
 *
 *
 * getRoute('/demo', routes).name === 'demo';
 * ```
 */
export function getRoute(ref: string, routes: RouteBlueprints, opts: AdditionalGetRouteOpts = {}): CanUndef<RouteAPI> {
	const
		{basePath, defaultRoute} = opts,
		routeKeys = Object.keys(routes),
		initialRef = ref;

	let
		resolvedById = false,
		resolvedRoute: Nullable<RouteBlueprint> = null,
		alias: Nullable<RouteBlueprint> = null;

	let
		resolvedRef = ref,
		refIsNormalized = true,
		externalRedirect = false;

	// eslint-disable-next-line no-constant-condition
	while (true) {
		// Reference to a route that passed as ID
		if (resolvedRef in routes) {
			resolvedById = true;
			resolvedRoute = routes[resolvedRef];

			if (resolvedRoute == null) {
				break;
			}

			const
				{meta} = resolvedRoute;

			if (meta.redirect == null && meta.alias == null) {
				break;
			}

			if (meta.external) {
				externalRedirect = true;
				break;
			}

			// Reference to a route that passed as a path
		} else {
			if (Object.isString(basePath) && basePath !== '') {
				// Resolve the situation when the passed path already has basePath
				const v = basePath.replace(/(.*)?[\\/]+$/, (str, base) => `${RegExp.escape(base)}/*`);
				resolvedRef = concatURLs(basePath, resolvedRef.replace(new RegExp(`^${v}`), ''));

				// We need to normalize only a user "raw" ref
				if (refIsNormalized) {
					ref = resolvedRef;
					refIsNormalized = false;
				}
			}

			for (let i = 0; i < routeKeys.length; i++) {
				const
					route = routes[routeKeys[i]];

				if (!route) {
					continue;
				}

				// In this case we have full matching of a route ref by a name or pattern
				if (getRouteName(route) === resolvedRef || route.pattern === resolvedRef) {
					resolvedById = true;
					resolvedRoute = route;
					break;
				}

				// Try to test the passed ref with a route pattern
				if (route.rgxp?.test(resolvedRef)) {
					if (resolvedRoute == null) {
						resolvedRoute = route;
						continue;
					}

					// If we have several matches with the provided ref,
					// like routes '/foo" and "/foo/:id" are matched with "/foo/bar",
					// we should prefer that pattern that has more length
					if (route.pattern!.length > (resolvedRoute.pattern?.length ?? 0)) {
						resolvedRoute = route;
					}
				}
			}
		}

		if (resolvedRoute == null) {
			break;
		}

		const
			{meta} = resolvedRoute;

		// If we haven't found a route that matches to the provided ref or the founded route doesn't redirect or refer
		// to another route, we can exit from the search loop, otherwise, we need to resolve the redirect/alias
		if (meta.redirect == null && meta.alias == null) {
			break;
		}

		if (meta.external) {
			externalRedirect = true;
			break;
		}

		// The alias should preserve an original route name and path
		if (meta.alias != null) {
			if (alias == null) {
				alias = resolvedRoute;
			}

			resolvedRef = meta.alias;

		} else {
			resolvedRef = meta.redirect!;
			ref = resolvedRef;
		}

		// Continue of resolving
		resolvedRoute = undefined;
	}

	// We haven't found a route by the provided ref,
	// that why we need to find "default" route as loopback
	if (!resolvedRoute) {
		resolvedRoute = defaultRoute;

		// We have found a route by the provided ref, but it contains an alias
	} else if (alias) {
		resolvedRoute = {
			...resolvedRoute,
			...Object.select(alias, [
				'name',
				'pattern',
				'rgxp',
				'pathParams'
			])
		};
	}

	if (resolvedRoute == null) {
		return;
	}

	const routeAPI: RouteAPI = Object.create({
		...resolvedRoute,
		meta: Object.mixin(true, {}, resolvedRoute.meta),

		get page(): string {
			return resolvedRoute!.name;
		},

		resolvePath(params?: Dictionary): string {
			const
				p = {};

			if (params) {
				for (let keys = Object.keys(params), i = 0; i < keys.length; i++) {
					const
						key = keys[i],
						el = params[key];

					if (el !== undefined) {
						p[key] = String(el);
					}
				}
			}

			if (externalRedirect) {
				return path.compile(resolvedRoute!.meta.redirect ?? ref)(p);
			}

			return path.compile(resolvedRoute!.pattern ?? ref)(p);
		},

		toPath(params?: Dictionary): string {
			deprecate({name: 'toPath', type: 'method', renamedTo: 'resolvePath'});
			return this.resolvePath(params);
		}
	});

	Object.assign(routeAPI, {
		name: resolvedRoute.name,
		params: {},
		query: {}
	});

	// Fill route parameters from URL
	if (!resolvedById && resolvedRoute.rgxp != null) {
		const
			params = resolvedRoute.rgxp.exec(initialRef);

		if (params) {
			for (let o = path.parse(resolvedRoute.pattern!), i = 0, j = 0; i < o.length; i++) {
				const
					el = o[i];

				if (Object.isSimpleObject(el)) {
					routeAPI.params[el.name] = params[++j];
				}
			}
		}
	}

	return routeAPI;
}

/**
 * Returns a path of the specified route with padding of additional parameters
 *
 * @param ref - route name or path
 * @param routes - available routes to get a route object by name or path
 * @param [opts] - additional options
 *
 * @example
 * ```js
 * routes = {
 *   demo: {
 *     route: '/demo'
 *   }
 * };
 *
 * getRoutePath('demo', routes) === '/demo';
 * getRoutePath('/demo', routes, {query: {foo: 'bar'}}) === '/demo?foo=bar';
 * ```
 */
export function getRoutePath(ref: string, routes: RouteBlueprints, opts: TransitionOptions = {}): CanUndef<string> {
	const
		route = getRoute(ref, routes);

	if (!route) {
		return;
	}

	let
		res = route.resolvePath(opts.params);

	if (opts.query) {
		const
			q = toQueryString(opts.query, false);

		if (q !== '') {
			res += `?${q}`;
		}
	}

	return res.replace(qsClearFixRgxp, '');
}
