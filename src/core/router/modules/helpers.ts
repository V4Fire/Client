/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import parsePattern, { parse, compile } from 'path-to-regexp';

import type { Key, RegExpOptions } from 'path-to-regexp';

import { concatURLs, toQueryString, fromQueryString } from 'core/url';
import { deprecate } from 'core/functools/deprecation';

import { qsClearFixRgxp, routeNames, defaultRouteNames, isExternal } from 'core/router/const';

import type {

	Route,
	AppliedRoute,
	RouteAPI,
	InitialRoute,
	StaticRoutes,

	RouteBlueprint,
	RouteBlueprints,

	TransitionOptions,

	AdditionalGetRouteOpts,
	CompileRoutesOpts,

	PathParam

} from 'core/router/interface';

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
 * @param routes - available routes to get the route object by a name or path
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
		{basePath, defaultRoute} = opts;

	const
		routeKeys = Object.keys(routes);

	const
		initialRef = ref,
		initialRefQuery = ref.includes('?') ? fromQueryString(ref) : {};

	let
		resolvedRoute: Nullable<RouteBlueprint> = null,
		initialRoute: Nullable<RouteBlueprint> = null,
		alias: Nullable<RouteBlueprint> = null;

	let
		resolvedRef = ref,
		refIsNormalized = true,
		externalRedirect = false;

	// eslint-disable-next-line no-constant-condition
	while (true) {
		// Reference to a route that passed as ID
		if (resolvedRef in routes) {
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

				// In this case, we have the full matching of a route ref by a name or pattern
				if (getRouteName(route) === resolvedRef || route.pattern === resolvedRef) {
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

		// If we haven't found a route that matches the provided ref or the founded route does not redirect or refer
		// to another route, we can exit from the search loop. Otherwise, we need to resolve the redirect/alias.
		if (meta.redirect == null && meta.alias == null) {
			break;
		}

		if (meta.external) {
			externalRedirect = true;
			break;
		}

		// The alias should preserve the original route name and path
		if (meta.alias != null) {
			if (alias == null) {
				alias = resolvedRoute;
			}

			resolvedRef = meta.alias;

		} else {
			resolvedRef = meta.redirect!;
			ref = resolvedRef;
		}

		initialRoute = resolvedRoute;

		// Continue of resolving
		resolvedRoute = undefined;
	}

	// We haven't found a route by the provided ref,
	// that why we need to find a "default" route as loopback
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

		resolvePath(params: Dictionary = {}): string {
			const
				parameters = resolvePathParameters(resolvedRoute?.pathParams ?? [], params);

			if (externalRedirect) {
				return compile(resolvedRoute?.meta.redirect ?? ref)(parameters);
			}

			const routePattern = resolvedRoute?.pattern;
			const pattern = Object.isFunction(routePattern) ?
				routePattern(routeAPI) :
				routePattern;

			return compile(pattern ?? ref)(parameters);
		},

		toPath(params?: Dictionary): string {
			deprecate({name: 'toPath', type: 'method', renamedTo: 'resolvePath'});
			return this.resolvePath(params);
		}
	});

	Object.assign(routeAPI, {
		name: resolvedRoute.name,
		params: {},
		query: Object.isDictionary(initialRefQuery) ? initialRefQuery : {}
	});

	// Fill route parameters from URL
	const tryFillParams = (route: Nullable<RouteBlueprint<Dictionary>>): void => {
		if (route == null) {
			return;
		}

		const
			queryIndex = initialRef.indexOf('?'),
			params = route.rgxp?.exec(queryIndex >= 0 ? initialRef.slice(0, queryIndex) : initialRef);

		if (params == null) {
			return;
		}

		const
			pattern = Object.isFunction(route.pattern) ? route.pattern(routeAPI) : route.pattern;

		for (let o = parse(pattern ?? ''), i = 0, j = 0; i < o.length; i++) {
			const
				el = o[i];

			if (Object.isSimpleObject(el)) {
				routeAPI.params[el.name] = params[++j];
			}
		}
	};

	tryFillParams(initialRoute);
	tryFillParams(resolvedRoute);

	return routeAPI;
}

/**
 * Returns a path of the specified route with padding of additional parameters
 *
 * @param ref - route name or path
 * @param routes - available routes to get the route object by name or path
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

/**
 * Compiles the specified static routes and returns a new object
 *
 * @param routes
 * @param [opts]
 */
export function compileStaticRoutes(routes: StaticRoutes, opts: CompileRoutesOpts = {}): RouteBlueprints {
	const
		{basePath = ''} = opts,
		compiledRoutes = {};

	for (let keys = Object.keys(routes), i = 0; i < keys.length; i++) {
		const
			name = keys[i],
			route = routes[name] ?? {},
			originalPathParams: Key[] = [];

		if (Object.isString(route)) {
			const
				pattern = concatURLs(basePath, route),
				rgxp = parsePattern(pattern, originalPathParams);

			const pathParams: PathParam[] = originalPathParams.map((param) => ({
				...param,
				aliases: []
			}));

			compiledRoutes[name] = {
				name,
				pattern,
				rgxp,
				pathParams,

				/** @deprecated */
				get page(): string {
					return this.name;
				},

				/** @deprecated */
				get index(): boolean {
					return this.meta.default;
				},

				get default(): boolean {
					return this.meta.default;
				},

				meta: {
					name,
					external: isExternal.test(pattern),

					/** @deprecated */
					page: name
				}
			};

		} else {
			let
				pattern: CanUndef<string>,
				rgxp: CanUndef<RegExp>;

			if (Object.isString(route.path)) {
				pattern = concatURLs(basePath, route.path);
				rgxp = parsePattern(pattern, originalPathParams, <RegExpOptions>route.pathOpts);
			}

			const pathParams: PathParam[] = originalPathParams.map((param) => ({
				...param,
				aliases: route.pathOpts?.aliases?.[param.name] ?? []
			}));

			compiledRoutes[name] = {
				name,
				pattern,
				rgxp,
				pathParams,

				/** @deprecated */
				get page(): string {
					return this.name;
				},

				/** @deprecated */
				get index(): boolean {
					return this.meta.default;
				},

				get default(): boolean {
					return this.meta.default;
				},

				meta: {
					...route,

					name,
					default: Boolean(route.default ?? route.index ?? defaultRouteNames[name]),

					external: route.external ?? (
						isExternal.test(pattern ?? '') ||
						isExternal.test(route.redirect ?? '')
					),

					/** @deprecated */
					page: name
				}
			};
		}
	}

	return compiledRoutes;
}

/**
 * Resolves dynamic parameters from the path based on the parsed from the pattern `pathParams`
 * and the user-provided parameters
 *
 * @see [[RouteBlueprint.pathParams]]
 *
 * @param pathParams - parameters after parsing the path
 * @param params - user-provided parameters with possible aliases
 *
 * @example
 * ```typescript
 * const route = {
 *   path: '/foo/:bar',
 *   pathOpts: {
 *     aliases: {bar: ['Bar']}
 *   }
 * }
 *
 * const pathParams = [];
 * parsePattern(route.path, pathParams, route.pathOpts);
 *
 * const parameters = {Bar: 21};
 * resolvePathParameters(pathParams, parameters); // {Bar: 21, bar: 21}
 * ```
 */
export function resolvePathParameters(pathParams: PathParam[], params: Dictionary): Dictionary {
	const
		parameters = {...params};

	pathParams.forEach((param) => {
		if (parameters.hasOwnProperty(param.name)) {
			return;
		}

		const
			alias = param.aliases.find((e) => parameters.hasOwnProperty(e));

		if (alias != null) {
			parameters[param.name] = parameters[alias];
		}
	});

	return parameters;
}
