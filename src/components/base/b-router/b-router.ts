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
import type Async from 'core/async';

import globalRoutes from 'routes';
import engine, * as router from 'core/router';

import DOM, { delegate } from 'components/friends/dom';
import iData, {

	component,
	prop,
	system,
	computed,
	hook,
	wait,
	watch,

	UnsafeGetter

} from 'components/super/i-data/i-data';

import { fillRouteParams } from 'components/base/b-router/modules/normalizers';
import type { StaticRoutes, RouteOption, TransitionMethod, UnsafeBRouter } from 'components/base/b-router/interface';

export * from 'components/super/i-data/i-data';

export * from 'core/router/const';
export * from 'components/base/b-router/interface';

DOM.addToPrototype({delegate});

const
	$$ = symbolGenerator();

@component()
export default class bRouter extends iData {
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

	public override async!: Async<this>;

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
	 * Compiled application route map
	 * @see [[bRouter.routesProp]]
	 */
	@system<bRouter>({
		after: 'engine',
		init: (o) => o.sync.link(o.compileStaticRoutes)
	})

	routes!: router.RouteBlueprints;

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

	/** @see [[bRouter.basePathProp]] */
	@system<bRouter>((o) => o.sync.link())
	basePath!: string;

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

	/**
	 * The internal engine of the router.
	 * For example, it could be an HTML5 history router or a URL hash router.
	 *
	 * @see [[bRouter.engine]]
	 */
	@system((o) => o.sync.link((v) => (<(v: unknown) => router.Router>v)(o)))
	protected engine!: router.Router;

	/**
	 * The raw value of the active route
	 */
	@system()
	protected routeStore?: router.Route;

	override get unsafe(): UnsafeGetter<UnsafeBRouter<this>> {
		return Object.cast(this);
	}

	/**
	 * The active route value
	 * @see [[bRouter.routeStore]]
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
	// eslint-disable-next-line getter-return
	@computed({cache: true, dependencies: ['routes']})
	get defaultRoute(): CanUndef<router.RouteBlueprint> {
		for (let routes = Object.values(this.routes), i = 0; i < routes.length; i++) {
			const
				route = routes[i];

			if (route?.meta.default) {
				return route;
			}
		}
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
	 * A temporary route is a route that has a "tmp" flag in its own properties such as "params", "query", or "meta".
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

	/** @see [[router.getRoutePath]] */
	getRoutePath(ref: string, opts: router.TransitionOptions = {}): CanUndef<string> {
		return router.getRoutePath(ref, this.routes, opts);
	}

	/** @see [[router.getRoute]] */
	getRoute(ref: string): CanUndef<router.RouteAPI> {
		const {routes, basePath, defaultRoute} = this;
		return router.getRoute(ref, routes, {basePath, defaultRoute});
	}

	/**
	 * Emits a new transition to the specified route
	 *
	 * @param ref - the route name or URL or `null`, if the route is equal to the previous
	 * @param [opts] - additional transition options
	 * @param [method] - the transition method
	 *
	 * @emits `beforeChange(route: Nullable<string>, params:` [[TransitionOptions]]`, method:` [[TransitionMethod]]`)`
	 *
	 * @emits `change(route:` [[Route]]`)`
	 * @emits `hardChange(route:` [[Route]]`)`
	 * @emits `softChange(route:` [[Route]]`)`
	 *
	 * @emits `transition(route:` [[Route]]`, type:` [[TransitionType]]`)`
	 * @emits `$root.transition(route:` [[Route]]`, type:` [[TransitionType]]`)`
	 */
	async emitTransition(
		ref: Nullable<string>,
		opts?: router.TransitionOptions,
		method: TransitionMethod = 'push'
	): Promise<CanUndef<router.Route>> {
		opts = router.getBlankRouteFrom(router.normalizeTransitionOpts(opts));

		const
			{r, engine} = this;

		const
			currentEngineRoute = engine.route;

		this.emit('beforeChange', ref, opts, method);

		let
			newRouteInfo: CanUndef<router.RouteAPI>;

		const getEngineRoute = () => currentEngineRoute ?
			currentEngineRoute.url ?? router.getRouteName(currentEngineRoute) :
			undefined;

		// Get information about the specified route
		if (ref != null) {
			newRouteInfo = this.getRoute(engine.id(ref));

		// In this case, we don't have a ref specified,
		// so we're trying to get the information from the current route and use it as a blueprint to the new one
		} else if (currentEngineRoute) {
			ref = getEngineRoute()!;

			const
				route = this.getRoute(ref);

			if (route) {
				newRouteInfo = Object.mixin(true, route, router.purifyRoute(currentEngineRoute));
			}
		}

		const scroll = {
			meta: {
				scroll: {
					x: typeof scrollX === 'undefined' ? 0 : scrollX,
					y: typeof scrollY === 'undefined' ? 0 : scrollY
				}
			}
		};

		// To save the scroll position before switch to a new route,
		// we need to emit a system "replace" transition with padding information about the scroll
		if (!SSR && currentEngineRoute && method !== 'replace') {
			const
				currentRouteWithScroll = Object.mixin(true, undefined, currentEngineRoute, scroll);

			if (!Object.fastCompare(currentEngineRoute, currentRouteWithScroll)) {
				await engine.replace(getEngineRoute()!, currentRouteWithScroll);
			}
		}

		// We didn't find any route matching the given ref
		if (newRouteInfo == null) {
			// The transition was user-generated, then we need to save the scroll
			if (method !== 'event' && ref != null) {
				await engine[method](ref, scroll);
			}

			return;
		}

		if ((<router.PurifiedRoute<router.RouteAPI>>newRouteInfo).name == null) {
			const
				nm = router.getRouteName(currentEngineRoute);

			if (nm != null) {
				newRouteInfo.name = nm;
			}
		}

		const
			currentRoute = this.field.get<router.Route>('routeStore');

		const deepMixin = (...args) => Object.mixin(
			{
				deep: true,
				skipUndefs: false,
				extendFilter: (el) => !Object.isArray(el)
			},
			...args
		);

		// If the new route has the same name as the current one,
		// we need to mix the new state with the current one
		if (router.getRouteName(currentRoute) === newRouteInfo.name) {
			deepMixin(newRouteInfo, router.getBlankRouteFrom(currentRoute), opts);

		} else {
			deepMixin(newRouteInfo, opts);
		}

		const {meta} = newRouteInfo;

		// If the route supports padding from the root object or query parameters
		fillRouteParams(newRouteInfo, this);

		// We have two variants of transitions:
		// "soft" - only query parameters or meta changed between routes
		// "hard" - the first and second routes do not match in name

		// Query and route meta-parameter mutations should not cause components to re-render,
		// so we put it in a prototype object with `Object.create`

		const nonWatchRouteValues = {
			url: newRouteInfo.resolvePath(newRouteInfo.params),
			query: newRouteInfo.query,
			meta
		};

		const newRoute = Object.assign(
			Object.create(nonWatchRouteValues),
			Object.reject(router.convertRouteToPlainObject(newRouteInfo), Object.keys(nonWatchRouteValues))
		);

		let
			hardChange = false;

		const emitTransition = (onlyOwnTransition?: boolean) => {
			const type = hardChange ? 'hard' : 'soft';

			if (onlyOwnTransition) {
				this.emit('transition', newRoute, type);

			} else {
				this.emit('change', newRoute);
				this.emit('transition', newRoute, type);
				r.emit('transition', newRoute, type);
			}
		};

		// Checking that the new route is really needed, i.e. not equal to the previous one
		let newRouteIsReallyNeeded = !Object.fastCompare(
			router.getComparableRouteParams(currentRoute),
			router.getComparableRouteParams(newRoute)
		);

		// Nothing changes between routes, but there is a certain meta object
		if (!newRouteIsReallyNeeded && currentRoute != null && opts.meta != null) {
			newRouteIsReallyNeeded = !Object.fastCompare(
				Object.select(currentRoute.meta, opts.meta),
				opts.meta
			);
		}

		// The transition is necessary, but now we need to understand whether we should emit a "soft" or "hard" transition
		if (newRouteIsReallyNeeded) {
			this.field.set('routeStore', newRoute);

			const
				plainInfo = router.convertRouteToPlainObject(newRouteInfo);

			const canRouteTransformToReplace =
				currentRoute &&
				method !== 'replace' &&
				Object.fastCompare(router.convertRouteToPlainObject(currentRoute), plainInfo);

			if (canRouteTransformToReplace) {
				method = 'replace';
			}

			// If the engine being used does not support the requested transition method, we must use `replace`
			if (!Object.isFunction(engine[method])) {
				method = 'replace';
			}

			// This transition is marked as "external", i.e. refers to another site
			if (newRouteInfo.meta.external) {
				const u = newRoute.url;
				location.href = u !== '' ? u : '/';
				return;
			}

			await engine[method](newRoute.url, plainInfo).then(() => {
				const isSoftTransition = Boolean(r.route && Object.fastCompare(
					router.convertRouteToPlainObjectWithoutProto(currentRoute),
					router.convertRouteToPlainObjectWithoutProto(newRoute)
				));

				// Only the properties from the prototype have been changed in this transition,
				// so it can be done as a soft transition, i.e. without forcing re-rendering of components.
				if (isSoftTransition) {
					this.emit('softChange', newRoute);

					// We get a prototype by using the `__proto__` property,
					// because `Object.getPrototypeOf` returns a non-watchable object.

					const
						proto = r.route?.__proto__;

					if (Object.isDictionary(proto)) {
						Object.keys(nonWatchRouteValues).forEach((key) => {
							proto[key] = nonWatchRouteValues[key];
						});
					}

				} else {
					hardChange = true;
					this.emit('hardChange', newRoute);
					r.route = newRoute;
				}

				emitTransition();
			});

		// This route is similar to the previous one, and we don't actually make the transition,
		// but for the `push` request, we still need to fire the "fake" transition event
		} else if (method === 'push') {
			emitTransition();

		// In this case, we don't do transition, but we still need to fire a special event because some methods,
		// such as `back' or `forward', may be waiting for it
		} else {
			emitTransition(true);
		}

		// Restoring the scroll position
		if (!SSR && meta.autoScroll !== false) {
			(async () => {
				const label = {
					label: $$.autoScroll
				};

				const setScroll = () => {
					const
						s = meta.scroll;

					if (s != null) {
						this.r.scrollTo(s.x, s.y);

					} else if (hardChange) {
						this.r.scrollTo(0, 0);
					}
				};

				await this.nextTick(label);
				setScroll();

				// Restoring the scroll for dynamic height components
				await this.async.sleep(10, label);
				setScroll();
			})().catch(stderr);
		}

		return newRoute;
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

	/**
	 * @param basePathOrRoutes
	 * @param [routesOrActiveRoute]
	 * @param [activeRouteOrRoutes]
	 */
	@wait('beforeReady')
	async updateRoutes(
		basePathOrRoutes: string | StaticRoutes,
		routesOrActiveRoute?: StaticRoutes | Nullable<router.InitialRoute>,
		activeRouteOrRoutes?: Nullable<router.InitialRoute> | StaticRoutes
	): Promise<router.RouteBlueprints> {
		let
			basePath,
			routes,
			activeRoute;

		if (Object.isString(basePathOrRoutes)) {
			basePath = basePathOrRoutes;

			if (Object.isString(routesOrActiveRoute)) {
				routes = <StaticRoutes>activeRouteOrRoutes;
				activeRoute = routesOrActiveRoute;

			} else {
				routes = routesOrActiveRoute;
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
		this.field.set('routerStore', this, this.$root);
		this.r.emit('initRouter', this);
	}

	/**
	 * Initializes the specified route
	 * @param [route] - the route value
	 */
	@hook('beforeDataCreate')
	protected initRoute(route: Nullable<router.InitialRoute> = this.initialRoute ?? this.r.initialRoute): Promise<void> {
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

		const
			i = this.instance;

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

	protected async onLink(e: MouseEvent): Promise<void> {
		const
			a = <HTMLElement>e.delegateTarget,
			href = a.getAttribute('href')?.trim();

		const cantPrevent =
			!this.interceptLinks ||
			href == null ||
			href === '' ||
			href.startsWith('#') ||
			href.startsWith('javascript:') ||
			router.isExternal.test(href);

		if (cantPrevent) {
			return;
		}

		e.preventDefault();

		if (<boolean>Object.parse(a.getAttribute('data-router-prevent-transition'))) {
			return;
		}

		const
			l = Object.assign(document.createElement('a'), {href});

		if (a.getAttribute('target') === '_blank' || e.ctrlKey || e.metaKey) {
			globalThis.open(l.href, '_blank');
			return;
		}

		const
			method = a.getAttribute('data-router-method');

		switch (method) {
			case 'back':
				this.back().catch(stderr);
				break;

			case 'forward':
				this.back().catch(stderr);
				break;

			case 'go': {
				const go = Object.parse(a.getAttribute('data-router-go'));
				this.go(Object.isNumber(go) ? go : -1).catch(stderr);
				break;
			}

			default: {
				const
					params = Object.parse(a.getAttribute('data-router-params')),
					query = Object.parse(a.getAttribute('data-router-query')),
					meta = Object.parse(a.getAttribute('data-router-meta'));

				await this[method === 'replace' ? 'replace' : 'push'](href, {
					params: Object.isDictionary(params) ? params : {},
					query: Object.isDictionary(query) ? query : {},
					meta: Object.isDictionary(meta) ? meta : {}
				});
			}
		}
	}
}
