/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type {

	Route as EngineRoute,
	AppliedRoute as EngineAppliedRoute,
	RouteAPI

} from 'core/router';

import type bRouter from 'base/b-router/b-router';

export { EngineRoute };
export {

	Router,
	StaticRoutes,

	StaticRouteMeta,
	RouteMeta,

	TransitionParams,
	HistoryClearFilter

} from 'core/router/interface';

export type AppliedRoute = EngineAppliedRoute<bRouter['PageParams'], bRouter['PageQuery'], bRouter['PageMeta']>;

export type AnyRoute =
	AppliedRoute |
	EngineRoute |
	RouteAPI;

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

/**
 * Function to compute dynamic values
 */
export type ComputeParamFn = (ctx: bRouter) => unknown;
export type RouteOption = Dictionary<unknown | ComputeParamFn>;

export interface RouteParamsFilter {
	(el: unknown, key: string): boolean;
}

export type TransitionType = 'soft' | 'hard';
export type TransitionMethod = 'push' | 'replace' | 'event';
