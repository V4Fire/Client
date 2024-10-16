/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:components/base/b-router/README.md]]
 * @packageDocumentation
 */

import symbolGenerator from 'core/symbol';

import globalRoutes from 'routes';
import * as router from 'core/router';

import DOM, { delegate } from 'components/friends/dom';

import {

	component,
	system,
	computed,
	hook,
	wait,
	watch,

	UnsafeGetter

} from 'components/super/i-data/i-data';

import type { StaticRoutes, TransitionMethod, UnsafeBRouter } from 'components/base/b-router/interface';

import iRouterProps from 'components/base/b-router/props';
import Transition from 'components/base/b-router/modules/transition';

import * as on from 'components/base/b-router/modules/handlers';

export * from 'core/router/const';
export * from 'components/super/i-data/i-data';

export * from 'components/base/b-router/interface';
export * from 'components/base/b-router/modules/transition';

DOM.addToPrototype({delegate});

const
	$$ = symbolGenerator();

@component()
export default class bRouter extends iRouterProps {
	/** @inheritDoc */
	declare public async: iRouterProps['async'];

	/**
	 * Compiled application route map
	 * {@link bRouter.routesProp}
	 */
	@system<bRouter>({
		after: 'engine',
		init: (o) => o.sync.link(o.compileStaticRoutes)
	})

	routes!: router.RouteBlueprints;

	/** {@link bRouter.basePathProp} */
	@system<bRouter>((o) => o.sync.link())
	basePath!: string;

	/**
	 * The internal engine of the router.
	 * For example, it could be an HTML5 history router or a URL hash router.
	 *
	 * {@link bRouter.engine}
	 */
	@system((o) => o.sync.link((v) => (<(v: unknown) => router.Router>v)(o)))
	protected engine!: router.Router;

	/**
	 * The raw value of the active route
	 */
	@system()
	protected routeStore?: router.Route;

	/**
	 * Parameters of the previous transition.
	 * Used for merging query parameters when replacing null.
	 */
	@system()
	private previousTransitionOptions: Nullable<router.TransitionOptions>;

	override get unsafe(): UnsafeGetter<UnsafeBRouter<this>> {
		return Object.cast(this);
	}

	/**
	 * The active route value
	 * {@link bRouter.routeStore}
	 *
	 * @example
	 * ```js
	 * console.log(route?.query)
	 * ```
	 */
	override get route(): CanUndef<this['r']['CurrentPage']> {
		return this.field.get('routeStore');
	}

	/**
	 * The default route value
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
	 *
	 * ```js
	 * router.defaultRoute.name === 'notFound'
	 * ```
	 */
	@computed({cache: true, dependencies: ['routes']})
	get defaultRoute(): CanNull<router.RouteBlueprint> {
		for (let routes = Object.values(this.routes), i = 0; i < routes.length; i++) {
			const
				route = routes[i];

			if (route?.meta.default) {
				return route;
			}
		}

		return null;
	}

	/**
	 * Pushes a new route onto the history stack.
	 * The method returns a promise that resolves when the transition is complete.
	 *
	 * @param route - the route name or URL
	 * @param [opts] - additional options
	 *
	 * @example
	 * ```js
	 * router.push('main', {query: {foo: 1}});
	 * router.push('/user/:id', {params: {id: 1}});
	 * router.push('https://google.com');
	 * ```
	 */
	async push(route: Nullable<string>, opts?: router.TransitionOptions): Promise<void> {
		await this.emitTransition(route, opts, 'push');
	}

	/**
	 * Replaces the current route with a new one.
	 * The method returns a promise that resolves when the transition is complete.
	 *
	 * @param route - the route name or URL
	 * @param [opts] - additional options
	 *
	 * @example
	 * ```js
	 * router.replace('main', {query: {foo: 1}});
	 * router.replace('/user/:id', {params: {id: 1}});
	 * router.replace('https://google.com');
	 * ```
	 */
	async replace(route: Nullable<string>, opts?: router.TransitionOptions): Promise<void> {
		await this.emitTransition(route, opts, 'replace');
	}

	/**
	 * Switches to a route from history, determined by its relative position with respect to the current route.
	 * The method returns a promise that resolves when the transition is complete.
	 *
	 * @param pos
	 *
	 * @example
	 * ````js
	 * this.go(-1) // this.back();
	 * this.go(1)  // this.forward();
	 * this.go(-2) // this.back(); this.back();
	 * ```
	 */
	async go(pos: number): Promise<void> {
		const res = this.promisifyOnce('transition');
		this.engine.go(pos);
		await res;
	}

	/**
	 * Switches to the next route from history.
	 * The method returns a promise that resolves when the transition is complete.
	 */
	async forward(): Promise<void> {
		const res = this.promisifyOnce('transition');
		this.engine.forward();
		await res;
	}

	/**
	 * Switches to the previous route from history.
	 * The method returns a promise that resolves when the transition is complete.
	 */
	async back(): Promise<void> {
		const res = this.promisifyOnce('transition');
		this.engine.back();
		await res;
	}

	/**
	 * Clears route history.
	 * Be aware that this method may not work properly with HistoryAPI based engines.
	 *
	 * @param [filter] - the filter predicate
	 */
	clear(filter?: router.HistoryClearFilter): Promise<void> {
		return this.engine.clear(filter);
	}

	/**
	 * Clears all temporary routes from history.
	 * A temporary route is a route that has a "tmp" flag in its own properties such as `params`, `query`, or `meta`.
	 * Be aware that this method may not work properly with HistoryAPI based engines.
	 *
	 * @example
	 * ```js
	 * this.push('redeem-money', {
	 *   meta: {
	 *     tmp: true
	 *   }
	 * });
	 *
	 * this.clearTmp();
	 * ```
	 */
	clearTmp(): Promise<void> {
		return this.engine.clearTmp();
	}

	/** {@link router.getRoutePath} */
	getRoutePath(ref: string, opts: router.TransitionOptions = {}): CanUndef<string> {
		return router.getRoutePath(ref, this.routes, opts);
	}

	/** {@link router.getRoute} */
	getRoute(ref: string): CanUndef<router.RouteAPI> {
		const {routes, basePath, defaultRoute} = this;
		return router.getRoute(ref, routes, {basePath, defaultRoute});
	}

	/** {@link Transition.execute} */
	emitTransition(
		ref: Nullable<string>,
		opts?: router.TransitionOptions,
		method: TransitionMethod = 'push'
	): Promise<CanUndef<router.Route>> {
		if (method === 'replace' && ref == null) {
			opts = Object.mixin({
				deep: true,
				skipUndefs: false,
				extendFilter: (el) => !Object.isArray(el)
			}, {}, this.previousTransitionOptions, opts);
		}

		this.previousTransitionOptions = opts;
		return new Transition(this, {ref, opts, method}).execute();
	}

	/**
	 * Updates the route map
	 *
	 * @param basePath - the route base path
	 * @param [routes] - static application route map
	 * @param [activeRoute]
	 */
	updateRoutes(
		basePath: string,
		routes?: StaticRoutes,
		activeRoute?: Nullable<router.InitialRoute>
	): Promise<router.RouteBlueprints>;

	/**
	 * Updates the route map
	 *
	 * @param basePath - the route base path
	 * @param activeRoute - the active route value
	 * @param [routes] - static application route map
	 */
	updateRoutes(
		basePath: string,
		activeRoute: router.InitialRoute,
		routes?: StaticRoutes
	): Promise<router.RouteBlueprints>;

	/**
	 * Updates the route map
	 *
	 * @param routes - static application route map
	 * @param [activeRoute]
	 */
	updateRoutes(
		routes: StaticRoutes,
		activeRoute?: Nullable<router.InitialRoute>
	): Promise<router.RouteBlueprints>;

	@wait('beforeReady')
	async updateRoutes(
		basePathOrRoutes: string | StaticRoutes,
		routesOrActiveRoute?: StaticRoutes | Nullable<router.InitialRoute>,
		activeRouteOrRoutes?: Nullable<router.InitialRoute> | StaticRoutes
	): Promise<router.RouteBlueprints> {
		let
			basePath: string | undefined;

		let
			routes: Nullable<StaticRoutes>,
			activeRoute: Nullable<router.InitialRoute>;

		if (Object.isString(basePathOrRoutes)) {
			basePath = basePathOrRoutes;

			if (Object.isString(routesOrActiveRoute)) {
				routes = <StaticRoutes>activeRouteOrRoutes;
				activeRoute = routesOrActiveRoute;

			} else {
				routes = Object.cast(routesOrActiveRoute);
				activeRoute = <Nullable<router.InitialRoute>>activeRouteOrRoutes;
			}

		} else {
			routes = basePathOrRoutes;
			activeRoute = <Nullable<router.InitialRoute>>routesOrActiveRoute;
		}

		if (basePath != null) {
			this.basePath = basePath;
		}

		if (routes != null) {
			this.routes = this.compileStaticRoutes(routes);
		}

		this.routeStore = undefined;
		await this.initRoute(activeRoute ?? this.initialRoute ?? this.defaultRoute);
		return this.routes;
	}

	protected override initRemoteData(): CanUndef<CanPromise<router.RouteBlueprints | Dictionary>> {
		if (!this.db) {
			return;
		}

		const
			val = this.convertDBToComponent<StaticRoutes>(this.db);

		if (Object.isDictionary(val)) {
			return Promise.all(this.state.set(val)).then(() => val);
		}

		if (Object.isArray(val)) {
			// eslint-disable-next-line prefer-spread
			return this.updateRoutes.apply(this, val);
		}

		return this.routes;
	}

	/**
	 * Initializes the router in the application
	 * @emits `$root.initRouter(router:` [[bRouter]]`)`
	 */
	@hook('created')
	protected init(): void {
		this.field.set('routerStore', this, this.r);
		this.r.emit('initRouter', this);
	}

	/**
	 * Initializes the specified route
	 * @param [route] - the route value
	 */
	@hook('beforeDataCreate')
	protected initRoute(
		route: Nullable<router.InitialRoute> = this.initialRoute ?? (SSR ? this.r.initialRoute : null)
	): Promise<void> {
		if (route != null) {
			if (Object.isString(route)) {
				return this.replace(route);
			}

			return this.replace(router.getRouteName(route), Object.reject(route, router.routeNames));
		}

		return this.replace(null);
	}

	/**
	 * Updates the current route value
	 */
	@wait({defer: true, label: $$.updateCurrentRoute})
	protected updateCurrentRoute(): Promise<void> {
		return this.initRoute();
	}

	/**
	 * Compiles the specified static routes with the current base path and returns a new object
	 * @param [routes]
	 */
	protected compileStaticRoutes(routes: StaticRoutes = this.engine.routes ?? globalRoutes): router.RouteBlueprints {
		return router.compileStaticRoutes(routes, {basePath: this.basePath});
	}

	protected override initBaseAPI(): void {
		super.initBaseAPI();

		const i = (<typeof bRouter>this.constructor).prototype;

		this.compileStaticRoutes = i.compileStaticRoutes.bind(this);
		this.emitTransition = i.emitTransition.bind(this);
	}

	/**
	 * Handler: there was a click on an element with the `href` attribute
	 * @param e
	 */
	@watch({
		path: 'document:click',
		wrapper: (o, cb) => o.dom.delegate('[href]', cb)
	})

	protected onLink(e: MouseEvent): Promise<void> {
		return on.link.call(this, e);
	}
}
