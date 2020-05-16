/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { Key } from 'path-to-regexp';
import { Route as EngineRoute, RouteMeta } from 'core/router';

export { EngineRoute };
export {

	Router,
	StaticRoutes,

	StaticRouteMeta,
	RouteMeta,

	TransitionParams,
	HistoryClearFilter

} from 'core/router/interface';

/**
 * Compiled not applied route
 */
export interface RouteBlueprint<
	PARAMS extends object = Dictionary,
	QUERY extends object = Dictionary,
	META extends object = Dictionary
> {
	/**
	 * Route name
	 */
	name: string;

	/**
	 * @deprecated
	 * @see [[CompiledRoute.name]]
	 */
	page: string;

	/**
	 * @deprecated
	 * @see [[CompiledRoute.meta.default]]
	 */
	index: boolean;

	/**
	 * Pattern of the route path
	 */
	pattern: string;

	/**
	 * RegExp to parse the route path
	 */
	rgxp: RegExp;

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
export type Route<
	PARAMS extends object = Dictionary,
	QUERY extends object = Dictionary,
	META extends object = Dictionary
> = EngineRoute<PARAMS, QUERY, META> & RouteBlueprint<PARAMS, QUERY, META>;

export type AnyRoute =
	Route |
	EngineRoute |
	RouteAPI;

/**
 * Route without system fields
 */
export type PurifiedRoute<T extends AnyRoute> = Partial<Omit<T, 'url' | 'name' | 'page'>>;

/**
 * Plain route object
 */
export type PlainRoute<T extends AnyRoute, FILTER extends string = '_'> = Partial<Omit<
	T extends RouteAPI ? Omit<T, 'resolvePath' | 'toPath'> : T,
	FILTER
>>;

/**
 * Route that support watching
 */
export type WatchableRoute<T extends AnyRoute> = PlainRoute<T, 'meta'>;

export interface RouteParamsFilter {
	(el: unknown, key: string): boolean;
}

/**
 * Public API to work with a route
 */
export interface RouteAPI<
	PARAMS extends object = Dictionary,
	QUERY extends object = Dictionary,
	META extends object = Dictionary
> extends Route<PARAMS, QUERY, META> {
	/**
	 * Applies a dictionary with parameters to the route path and returns the resolved path
	 * @param params
	 */
	resolvePath(params?: Dictionary): string;

	/**
	 * @deprecated
	 * @see [[Route.toPath]]
	 */
	toPath(params?: Dictionary): string;
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
	page: string;
}

export type ActiveRoute = string | RouteParams;

export type TransitionType = 'soft' | 'hard';
export type TransitionMethod = 'push' | 'replace' | 'event';
