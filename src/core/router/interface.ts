/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { RegExpOptions, ParseOptions, Key } from 'path-to-regexp';
import type { EventEmitter2 as EventEmitter } from 'eventemitter2';

import type bRouter from 'components/base/b-router/b-router';

/**
 * Route meta information that can be declared statically as a literal
 */
export type StaticRouteMeta<M extends object = Dictionary> = M & {
	/**
	 * Unique route name: can be used for direct transition
	 *
	 * @example
	 * ```js
	 * this.router.push('foo');
	 * ```
	 */
	name?: string;

	/**
	 * Dependencies that are loaded with this route
	 * @param routerCtx
	 */
	load?(routerCtx?: bRouter): Promise<unknown>;

	/**
	 * The path to the route.
	 * Typically, this parameter is used to bind a route to a URL.
	 * You can use some variable binding in the path.
	 * To organize such a binding, the path-to-regexp library is used.
	 *
	 * The values for path interpolation are taken from the route params property.
	 * This parameter can be provided using the `push` or `replace` methods of the router.
	 */
	path?: string;

	/**
	 * Additional Options for path parsing
	 */
	pathOpts?: PathOptions;

	/**
	 * If true, then the route can accept `params` values from the `query` property
	 */
	paramsFromQuery?: boolean;

	/**
	 * True, if this route can be used by default.
	 * The default route is used when the router cannot automatically determine the current route,
	 * for example you have routes for urls "/foo" and "/bar" but if someone tries to enter different paths
	 * which were not described, it will be redirected to the default route.
	 *
	 * There can only be one default route, but if you have defined multiple routes with this flag,
	 * then it will be used by the last one defined.
	 *
	 * @default `false`
	 */
	default?: boolean;

	/**
	 * If the route is an alias of another route, the parameter contains the name of the route we are referring to.
	 * The alias retains the original route name (but the rest of the parameters are taken from the referrer route).
	 * If you want to organize some redirect logic, see the `redirect` option.
	 */
	alias?: string;

	/**
	 * If you need to automatically redirect to another route whenever you switch to the current one,
	 * you can pass this parameter the name of the route to redirect to
	 */
	redirect?: string;

	/**
	 * Marks the route as "external", i.e., transitions to this route will be made using `location.href`
	 */
	external?: boolean;

	/**
	 * Default `query` parameters.
	 * If any parameter value is specified as a function, it will be called with the router instance as an argument.
	 */
	query?: Dictionary;

	/**
	 * Default "`params"` parameters.
	 * If any parameter value is specified as a function, it will be called with the router instance as an argument.
	 */
	params?: Dictionary;

	/**
	 * Default `meta` parameters.
	 * If any parameter value is specified as a function, it will be called with the router instance as an argument.
	 */
	meta?: Dictionary;

	/**
	 * If false, the router does not automatically scroll the page to the coordinates associated with the route.
	 * Keep in mind that if you disable this option, the page scroll position will not be restored when you
	 * tap back or forward.
	 *
	 * @default `true`
	 */
	autoScroll?: boolean;

	/**
	 * Scroll coordinates tied to the route
	 */
	scroll?: {
		x?: number;
		y?: number;
	};
};

/**
 * Decorated path options
 */
export interface PathOptions extends RegExpOptions, ParseOptions {
	/**
	 * Aliases for dynamic parameters in `path`.
	 *
	 * @see [[StaticRouteMeta.path]]
	 *
	 * In the example below you can specify either `bar` itself as a parameter or any of its aliases.
	 * Note that aliases will be used only if the original parameter is not specified.
	 * The priority of aliases is determined "from left to right".
	 *
	 * @example
	 * ```typescript
	 * {
	 *   path: '/foo/:bar',
	 *   pathOpts: {
	 *     aliases: {
	 *       bar: ['_bar', 'Bar']
	 *     }
	 *   }
	 * }
	 *
	 * this.router.push('/foo/:bar', {params: {bar: 'bar'}})               // "/foo/bar"
	 * this.router.push('/foo/:bar', {params: {Bar: 'Bar'}})               // "/foo/Bar"
	 * this.router.push('/foo/:bar', {params: {bar: 'bar', Bar: 'Bar'}})   // "/foo/bar"
	 * this.router.push('/foo/:bar', {params: {Bar: 'Bar', _bar: '_bar'}}) // "/foo/_bar"
	 * ```
	 */
	aliases?: Dictionary<string[]>;
}

/**
 * Static application route map
 */
export type StaticRoutes<M extends object = Dictionary> = Dictionary<
	string |
	StaticRouteMeta<M>
>;

/**
 * Route meta information
 */
export type RouteMeta<M extends object = Dictionary> = StaticRouteMeta<M> & {
	/** {@link StaticRouteMeta.name} */
	name: string;

	/** {@link StaticRouteMeta.default} */
	default: boolean;
};

/**
 * Route object
 */
export interface Route<
	PARAMS extends object = Dictionary,
	QUERY extends object = Dictionary,
	META extends object = Dictionary
> extends Dictionary {
	/**
	 * Route URL
	 */
	url?: string;

	/**
	 * Route name
	 */
	name: string;

	/**
	 * If true, the route can be used as the default one
	 */
	default: boolean;

	/**
	 * Route parameters that can be passed to the route path
	 */
	params: PARAMS;

	/**
	 * Route query parameters
	 */
	query: QUERY;

	/**
	 * Route meta information
	 */
	meta: RouteMeta<META>;
}

export type TransitionParams = {[K in keyof Route]?: Route[K] extends Dictionary<any> ? Partial<Route[K]> : Route[K]};

export interface HistoryClearFilter {
	(page: Route): unknown;
}

/**
 * Router API
 */
export interface Router<
	PARAMS extends object = Dictionary,
	QUERY extends object = Dictionary,
	META extends object = Dictionary
> extends EventEmitter {
	/**
	 * Active route
	 */
	readonly route?: CanUndef<Route<PARAMS, QUERY, META>>;

	/**
	 * History of routes
	 */
	readonly history: Route[];

	/**
	 * Static application route map
	 */
	readonly routes?: StaticRoutes<META>;

	/**
	 * Returns the route ID by name or URL
	 * @param route
	 */
	id(route: string): string;

	/**
	 * Pushes a new route to the history stack
	 *
	 * @param route - the route name or URL
	 * @param params - the route parameters
	 */
	push(route: string, params?: TransitionParams): Promise<void>;

	/**
	 * Replaces the current route
	 *
	 * @param route - the route name or URL
	 * @param params - the route parameters
	 */
	replace(route: string, params?: TransitionParams): Promise<void>;

	/**
	 * Switches to a route from the history, determined by its relative position in relation to the current route
	 * (with the current route having a relative index of 0)
	 *
	 * @param pos
	 */
	go(pos: number): void;

	/**
	 * Switches to the next route from the history
	 */
	forward(): void;

	/**
	 * Switches to the previous route from the history
	 */
	back(): void;

	/**
	 * Clears the routes history
	 * @param filter - a filter predicate
	 */
	clear(filter?: HistoryClearFilter): Promise<void>;

	/**
	 * Clears all temporary routes from the history.
	 * A temporary route is a route that has a `tmp` flag within its own properties, like, `params`, `query` or `meta`.
	 */
	clearTmp(): Promise<void>;
}

/**
 * Compiled not applied route
 */
export interface RouteBlueprint<META extends object = Dictionary> {
	/**
	 * Route name
	 */
	name: string;

	/**
	 * Route path pattern
	 */
	pattern?: string | ((route: RouteAPI) => CanUndef<string>);

	/**
	 * RegExp to parse the route path
	 */
	rgxp?: RegExp;

	/** {@link StaticRouteMeta.default} */
	default: boolean;

	/**
	 * A list of parameters that are passed to the route path
	 *
	 * @example
	 * ```js
	 * {
	 *   path: '/:foo/:bar',
	 *   pathParams: [
	 *     {modifier: '', name: 'foo', pattern: '[^\\/#\\?]+?', prefix: '/', suffix: '', aliases: []},
	 *     {modifier: '', name: 'bat', pattern: '[^\\/#\\?]+?', prefix: '/', suffix: '', aliases: []}
	 *   ]
	 * }
	 * ```
	 */
	pathParams: PathParam[];

	/**
	 * Route meta information
	 */
	meta: RouteMeta<META>;
}

/**
 * Decorated object after parsing the path
 */
export interface PathParam extends Key {
	/**
	 * @see [[StaticRouteMeta.pathOpts.aliases]]
	 */
	aliases: string[];
}

export type RouteBlueprints = Dictionary<RouteBlueprint>;

/**
 * Compiled and applied route
 */
export type AppliedRoute<
	PARAMS extends object = Dictionary,
	QUERY extends object = Dictionary,
	META extends object = Dictionary
> = Route<PARAMS, QUERY, META> & RouteBlueprint<META>;

/**
 * Public API to work with a route
 */
export interface RouteAPI<
	PARAMS extends object = Dictionary,
	QUERY extends object = Dictionary,
	META extends object = Dictionary
> extends AppliedRoute<PARAMS, QUERY, META> {
	/**
	 * Applies a dictionary with parameters to the route path and returns the resolved path
	 * @param params
	 */
	resolvePath(params?: Dictionary): string;
}

export type AnyRoute =
	AppliedRoute |
	Route |
	RouteAPI;

/**
 * Additional options to use on getting a route object
 */
export interface AdditionalGetRouteOpts {
	basePath?: string;
	defaultRoute?: CanNull<RouteBlueprint>;
}

/**
 * Additional options to compile routes
 */
export interface CompileRoutesOpts {
	/**
	 * Route base path: all route paths are concatenated with this path
	 */
	basePath?: string;
}

/**
 * Parameters of a route
 */
export interface RouteParams extends TransitionOptions {
	/**
	 * Route name
	 */
	name: string;
}

/**
 * Options to emit a route transition
 */
export interface TransitionOptions<
	PARAMS extends object = Dictionary,
	QUERY extends object = Dictionary,
	META extends object = Dictionary
> {
	params?: PARAMS;
	query?: QUERY;
	meta?: META;
}

export type InitialRoute = string | RouteParams;

export interface RouteParamsFilter {
	(el: unknown, key: string): boolean;
}

/**
 * Plain route object
 */
export type PlainRoute<T extends AnyRoute, FILTER extends string = '_'> = Partial<Omit<
	T extends RouteAPI ? Omit<T, 'resolvePath' | 'toPath'> : T,
	FILTER
>>;

/**
 * Purified route, i.e., only common parameters
 */
export type PurifiedRoute<T extends AnyRoute> = PlainRoute<T, 'url' | 'name' | 'page'>;

/**
 * Route that support watching
 */
export type WatchableRoute<T extends AnyRoute> = PlainRoute<T, 'meta'>;
