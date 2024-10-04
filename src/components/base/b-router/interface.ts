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

import type bRouter from 'components/base/b-router/b-router';
import type { UnsafeIData } from 'components/super/i-data/i-data';

export { EngineRoute };

export {

	Router,
	StaticRoutes,

	StaticRouteMeta,
	RouteMeta,

	TransitionParams,
	HistoryClearFilter

} from 'core/router/interface';

export type AppliedRoute = EngineAppliedRoute<
	bRouter['PageParams'],
	bRouter['PageQuery'],
	bRouter['PageMeta']
>;

export type AnyRoute =
	AppliedRoute |
	EngineRoute |
	RouteAPI;

export type TransitionType = 'soft' | 'hard';
export type TransitionMethod = 'push' | 'replace' | 'event';

export type ComputeParamFn = (ctx: bRouter) => unknown;
export type RouteOption = Dictionary<unknown | ComputeParamFn>;

export interface UnsafeBRouter<CTX extends bRouter = bRouter> extends UnsafeIData<CTX> {
	// @ts-ignore (access)
	engine: CTX['engine'];

	// @ts-ignore (access)
	routeStore: CTX['routeStore'];

	// @ts-ignore (access)
	initRoute: CTX['initRoute'];

	// @ts-ignore (access)
	compileStaticRoutes: CTX['compileStaticRoutes'];
}
