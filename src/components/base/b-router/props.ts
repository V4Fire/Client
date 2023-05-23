/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import engine from 'core/router';
import type * as router from 'core/router';

import iData, { component, prop } from 'components/super/i-data/i-data';

import type { StaticRoutes, RouteOption } from 'components/base/b-router/interface';
import type bRouter from 'components/base/b-router/b-router';

@component()
export default class bRouterProps extends iData {
	/**
	 * Type: page parameters
	 */
	readonly PageParams!: RouteOption;

	/**
	 * Type: page query
	 */
	readonly PageQuery!: RouteOption;

	/**
	 * Type: page meta
	 */
	readonly PageMeta!: RouteOption;

	/**
	 * Static application route map.
	 * By default, this value is taken from `routes/index.ts`.
	 *
	 * @example
	 * ```
	 * < b-router :routes = { &
	 *   main: {
	 *     path: '/'
	 *   },
	 *
	 *   notFound: {
	 *     default: true
	 *   }
	 * } .
	 * ```
	 */
	@prop<bRouter>({
		type: Object,
		required: false,
		watch: (ctx, val, old) => {
			if (!Object.fastCompare(val, old)) {
				ctx.updateCurrentRoute();
			}
		}
	})

	readonly routesProp?: StaticRoutes;

	/**
	 * The initial route value.
	 * Usually you don't need to specify this value manually,
	 * because it outputs automatically, but sometimes it can be useful.
	 *
	 * @example
	 * ```
	 * < b-router :initialRoute = 'main' | :routes = { &
	 *   main: {
	 *     path: '/'
	 *   },
	 *
	 *   notFound: {
	 *     default: true
	 *   }
	 * } .
	 * ```
	 */
	@prop<bRouter>({
		type: [String, Object],
		required: false,
		watch: 'updateCurrentRoute'
	})

	readonly initialRoute?: router.InitialRoute;

	/**
	 * Route base path: all route paths are concatenated with this path
	 *
	 * @example
	 * ```
	 * < b-router :basePath = '/demo' | :routes = { &
	 *   user: {
	 *     /// '/demo/user'
	 *     path: '/user'
	 *   }
	 * } .
	 * ```
	 */
	@prop({watch: 'updateCurrentRoute'})
	readonly basePathProp: string = '/';

	/**
	 * If true, the router will intercept all click events on elements with a `href` attribute to create a transition.
	 * An element with `href` can have additional attributes:
	 *
	 *   1. `data-router-method` - the type of router method used to send the transition;
	 *   2. `data-router-go` - value for the router `go` method;
	 *   3. `data-router-params`, `data-router-query`, `data-router-meta` - additional parameters for
	 *       the used router method (to provide an object use JSON).
	 */
	@prop(Boolean)
	readonly interceptLinks: boolean = true;

	/**
	 * Factory for creating a router engine.
	 * By default, this value is taken from `core/router/engines`.
	 *
	 * @example
	 * ```
	 * < b-router :engine = myCustomEngine
	 * ```
	 */
	@prop<bRouter>({
		type: Function,
		watch: 'updateCurrentRoute',
		default: engine
	})

	readonly engineProp!: () => router.Router;
}
