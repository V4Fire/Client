/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { RegExpOptions, ParseOptions, Key } from 'path-to-regexp';
import type { EventEmitter2 as EventEmitter } from 'eventemitter2';

/**
 * Meta information of a route that can be declared statically as a literal
 */
export type StaticRouteMeta<M extends object = Dictionary> = M & {
	/**
	 * Unique route name: can be used to direct transition
	 *
	 * @example
	 * ```js
	 * this.router.push('foo');
	 * ```
	 */
	name?: string;

	/**
	 * @deprecated
	 * @see [[StaticRouteMeta.name]]
	 */
	page?: string;

	/**
	 * Dependencies that are loaded with this route
	 */
	load?(): Promise<unknown>;

	/**
	 * Path to the route.
	 * Usually, this parameter is used to tie a route with some URL.
	 * You can use some variable binding within the path.
	 * To organize such binding is used "path-to-regexp" library.
	 *
	 * The values to interpolate the path are taken from the "params" property of a route.
	 * This parameter can be provided by using "push" or "replace" methods of the router.
	 */
	path?: string;

	/**
	 * Additional options to parse a path of the route
	 */
	pathOpts?: RegExpOptions & ParseOptions;

	/**
	 * If true, then the route can take "params" values from the "query" property
	 */
	paramsFromQuery?: boolean;

	/**
	 * True, if this route can be used as default.
	 * The default route is used when the router can't automatically detect the current route,
	 * for example, you have routes for URL-s "/foo" and "/bar", but if somebody tries to enter different paths
	 * that weren't described, it will be redirected to the default route.
	 *
	 * There can be only one default route, but if you defined several routes with this flag,
	 * then it will be used the last defined.
	 *
	 * @default `false`
	 */
	default?: boolean;

	/**
	 * @deprecated
	 * @see [[StaticRouteMeta.default]]
	 */
	index?: boolean;

	/**
	 * If the route is an alias to another route, the parameter contains the route name we refer to.
	 * The alias preserves its original name of the route (but rest parameters are taken from a refer route).
	 * If you want to organize some redirect logic, please see the "redirect" parameter.
	 */
	alias?: string;

	/**
	 * If you need to automatically redirect to another route whenever you switch to the current,
	 * you can pass this parameter a name of the route to redirect.
	 */
	redirect?: string;

	/**
	 * Marks the route as "external", i.e. transitions to this route will be produced by using location.href
	 */
	external?: boolean;

	/**
	 * Default "query" parameters.
	 * If some parameter value is specified as a function, it will be invoked with the router instance as an argument.
	 */
	query?: Dictionary;

	/**
	 * Default "params" parameters.
	 * If some parameter value is specified as a function, it will be invoked with the router instance as an argument.
	 */
	params?: Dictionary;

	/**
	 * Default "meta" parameters.
	 * If some parameter value is specified as a function, it will be invoked with the router instance as an argument.
	 */
	meta?: Dictionary;

	/**
	 * If false, the router doesn't automatically scroll a page to coordinates tied with the route.
	 * Mind, if you switch off this parameter, the scroll position of a page won't be restored
	 * on a back or forward tap too.
	 *
	 * @default `true`
	 */
	autoScroll?: boolean;

	/**
	 * Scroll coordinates that tied with the route
	 */
	scroll?: {
		x?: number;
		y?: number;
	};
};

/**
 * Static schema of application routes
 */
export type StaticRoutes<M extends object = Dictionary> = Dictionary<
	string |
	StaticRouteMeta<M>
>;

/**
 * Meta information of a route
 */
export type RouteMeta<M extends object = Dictionary> = StaticRouteMeta<M> & {
	/** @see [[StaticRouteMeta.name]] */
	name: string;

	/** @see [[StaticRouteMeta.default]] */
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
	 * URL of the route
	 */
	url?: string;

	/**
	 * Route name
	 */
	name: string;

	/**
	 * @deprecated
	 * @see [[Route.name]]
	 */
	page?: string;

	/**
	 * If true, the route can be used as default
	 */
	default: boolean;

	/**
	 * @deprecated
	 * @see [[Route.default]]
	 */
	index?: boolean;

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
	 * @deprecated
	 * @see [[Router.route]]
	 */
	readonly page?: CanUndef<Route<PARAMS, QUERY, META>>;

	/**
	 * History of routes
	 */
	readonly history: Route[];

	/**
	 * Static schema of application routes
	 */
	readonly routes?: StaticRoutes<META>;

	/**
	 * Returns an identifier of the route by a name or URL
	 * @param route
	 */
	id(route: string): string;

	/**
	 * Pushes a new route to the history stack
	 *
	 * @param route - route name or URL
	 * @param params - route parameters
	 */
	push(route: string, params?: TransitionParams): Promise<void>;

	/**
	 * Replaces the current route
	 *
	 * @param route - route name or URL
	 * @param params - route parameters
	 */
	replace(route: string, params?: TransitionParams): Promise<void>;

	/**
	 * Switches to a route from the history, identified by its relative position to the current route
	 * (with the current route being relative index 0)
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
	 * @param filter - filter predicate
	 */
	clear(filter?: HistoryClearFilter): Promise<void>;

	/**
	 * Clears all temporary routes from the history.
	 * The temporary route is a route that has "tmp" flag within its own properties, like, "params", "query" or "meta".
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
	 * @deprecated
	 * @see [[RouteBlueprint.name]]
	 */
	page?: string;

	/**
	 * @deprecated
	 * @see [[RouteBlueprint.meta.default]]
	 */
	index?: boolean;

	/**
	 * Pattern of the route path
	 */
	pattern?: string | ((params: Route) => CanUndef<string>);

	/**
	 * RegExp to parse the route path
	 */
	rgxp?: RegExp;

	/**
	 * List of parameters that passed to the route path
	 *
	 * @example
	 * ```js
	 * {
	 *   path: '/:foo/:bar',
	 *   pathParams: [
	 *     {modifier: '', name: 'foo', pattern: '[^\\/#\\?]+?', prefix: '/', suffix: ''},
	 *     {modifier: '', name: 'bat', pattern: '[^\\/#\\?]+?', prefix: '/', suffix: ''}
	 *   ]
	 * }
	 * ```
	 */
	pathParams: Key[];

	/**
	 * Route meta information
	 */
	meta: RouteMeta<META>;
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

	/**
	 * @deprecated
	 * @see [[Route.toPath]]
	 */
	toPath?(params?: Dictionary): string;
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
	defaultRoute?: RouteBlueprint;
}

/**
 * Additional options to use on compiling routes
 */
export interface AdditionalCompileRoutesOpts {
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

	/**
	 * @deprecated
	 * @see [[RouteParams.name]]
	 */
	page?: string;
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
