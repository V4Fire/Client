/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { Key, RegExpOptions, ParseOptions } from 'path-to-regexp';
import { EventEmitter2 as EventEmitter } from 'eventemitter2';

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
	 * Name of an entry point that tied with the route.
	 * This parameter needs to use when you split your application into different chunks and
	 * want to tie a route with some chunk. By default, the value is taken from the route name.
	 *
	 * To create a new entry point you need to create a file within the "core/entries" directory.
	 * The entry point name is taken from this file. Within this file,
	 * you write import imports to dependencies of the chunk.
	 *
	 * @example
	 * *src/entries/index.js*
	 *
	 * ```js
	 * // This entry point provides the core API
	 * import '@v4fire/client/core';
	 * ```
	 *
	 * *src/entries/std.js*
	 *
	 * ```js
	 * // This entry point provides dependencies that will be initialized before the other entry points.
	 * // It uses to attach polyfill libraries or libraries to check performance.
	 * import '@v4fire/client/core/std';
	 * ```
	 *
	 * *src/entries/p-index.js*
	 * ```js
	 * // This entry point provides dependencies for the "p-index" component
	 * import '../pages/p-index';
	 * ```
	 */
	entryPoint?: string;

	/**
	 * If false, then the route doesn't have any dynamic dependencies to download.
	 * This parameter is used when you want to tie a route with some entry point,
	 * but dependencies of this entry point were already initialized statically.
	 *
	 * @default `true`
	 */
	dynamicDependencies?: boolean;

	/**
	 * @deprecated
	 * @see [[StaticRouteMeta.remote]]
	 */
	remote?: boolean;

	/**
	 * Path to the route.
	 * Usually, this parameter is used to tie a route with some URL.
	 * You can use some variable binding within the path.
	 * To organize such binding is used "path-to-regexp" library.
	 *
	 * The values to interpolate the path are taken from the "params" property of a route,
	 * this parameter can be provided by using "push" or "replace" methods of the router.
	 */
	path?: string;

	/**
	 * Additional options to parse a path of the route
	 */
	pathOpts?: RegExpOptions & ParseOptions;

	/**
	 * If true, then the route can take values from a router state of the root application component
	 * and places they as query parameters.
	 *
	 * The router state is an object that returns "syncRouterState" method of a component.
	 */
	paramsFromRoot?: boolean;

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
	 * There is can be only one default route, but if you defined several routes with this flag,
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
	 * If this route just an alias for another route, this parameter contains a name of a route that we refer to.
	 * Mind, the alias preserves its original name of the route (but rest parameters are taken from a refer route),
	 * if you want to organize some redirect logic, please see the "redirect" parameter.
	 */
	alias?: string;

	/**
	 * If you need to automatically redirect to another route every time when you switch to the current,
	 * you can pass to this parameter a name of the route to redirect.
	 */
	redirect?: string;

	/**
	 * If false, the router don't automatically scroll a page to coordinates that tied with the route.
	 * Mind, if you switch off this parameter, the scroll position of a page
	 * won't be restored on a back or forward tap too.
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

	/**
	 * @deprecated
	 * @see [[StaticRouteMeta.name]]
	 */
	page: string;

	/** @see [[StaticRouteMeta.default]] */
	default: boolean;

	/**
	 * @deprecated
	 * @see [[StaticRouteMeta.default]]
	 */
	index: boolean;

	/**
	 * List of parameters that passed to the route path
	 * @deprecated
	 */
	params: Key[];
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
	page: string;

	/**
	 * If true, this route can be used as default
	 */
	default: boolean;

	/**
	 * @deprecated
	 * @see [[Route.default]]
	 */
	index: boolean;

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
