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
 * Function to compute dynamic values
 */
export type ComputeParamFn = (ctx: bRouter) => unknown;
export type RouteOption = Dictionary<unknown | ComputeParamFn>;

export type TransitionType = 'soft' | 'hard';
export type TransitionMethod = 'push' | 'replace' | 'event';
