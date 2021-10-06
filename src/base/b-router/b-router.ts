/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:base/b-router/README.md]]
 * @packageDocumentation
 */

import symbolGenerator from 'core/symbol';
import { deprecated } from 'core/functools/deprecation';

import globalRoutes from 'routes';
import type Async from 'core/async';

import iData, { component, prop, system, computed, hook, wait, watch } from 'super/i-data/i-data';
import engine, * as router from 'core/router';

import { fillRouteParams } from 'base/b-router/modules/normalizers';
import type { StaticRoutes, RouteOption, TransitionMethod } from 'base/b-router/interface';

export * from 'super/i-data/i-data';
export * from 'core/router/const';
export * from 'base/b-router/interface';

export const
	$$ = symbolGenerator();

/**
 * Component to route application pages
 */
@component({
	deprecatedProps: {
		pageProp: 'activeRoute',
		pagesProp: 'routesProp'
	}
})

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
	 * The static schema of application routes.
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
	 * Compiled schema of application routes
	 * @see [[bRouter.routesProp]]
	 */
	@system({
		after: 'engine',
		init: (o) => o.sync.link(<any>o.compileStaticRoutes)
	})

	routes!: router.RouteBlueprints;

	/**
	 * An initial route value.
	 * Usually, you don't need to provide this value manually,
	 * because it is inferring automatically, but sometimes it can be useful.
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
	 * Base route path: all route paths are concatenated with this path
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
	 * If true, the router will intercept all click events on elements with a `href` attribute to emit a transition.
	 * An element with `href` can have additional attributes:
	 *
	 * * `data-router-method` - type of the used router method to emit the transition;
	 * * `data-router-go` - value for the router `go` method;
	 * * `data-router-params`, `data-router-query`, `data-router-meta` - additional parameters for the used router method
	 *   (to provide an object use JSON).
	 */
	@prop(Boolean)
	readonly interceptLinks: boolean = true;

	/**
	 * A factory to create router engine.
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
	 * An internal router engine.
	 * For example, it can be the HTML5 history router or a router based on URL hash values.
	 *
	 * @see [[bRouter.engine]]
	 */
	@system((o) => o.sync.link((v) => (<(v: unknown) => router.Router>v)(o)))
	protected engine!: router.Router;

	/**
	 * Raw value of the active route
	 */
	@system()
	protected routeStore?: router.Route;

	/**
	 * Value of the active route
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
	 * @deprecated
	 * @see [[bRouter.route]]
	 */
	@deprecated({renamedTo: 'route'})
	get page(): CanUndef<this['r']['CurrentPage']> {
		return this.route;
	}

	/**
	 * Default route value
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
	get defaultRoute(): CanUndef<router.RouteBlueprint> {
		let route;

		for (let keys = Object.keys(this.routes), i = 0; i < keys.length; i++) {
			const
				el = this.routes[keys[i]];

			if (el?.meta.default) {
				route = el;
				break;
			}
		}

		return route;
	}

	/**
	 * Pushes a new route to the history stack.
	 * The method returns a promise that is resolved when the transition will be completed.
	 *
	 * @param route - route name or URL
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
	 * Replaces the current route.
	 * The method returns a promise that will be resolved when the transition is completed.
	 *
	 * @param route - route name or URL
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
	 * Switches to a route from the history,
	 * identified by its relative position to the current route (with the current route being relative index 0).
	 * The method returns a promise that will be resolved when the transition is completed.
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
	 * Switches to the next route from the history.
	 * The method returns a promise that will be resolved when the transition is completed.
	 */
	async forward(): Promise<void> {
		const res = this.promisifyOnce('transition');
		this.engine.forward();
		await res;
	}

	/**
	 * Switches to the previous route from the history.
	 * The method returns a promise that will be resolved when the transition is completed.
	 */
	async back(): Promise<void> {
		const res = this.promisifyOnce('transition');
		this.engine.back();
		await res;
	}

	/**
	 * Clears the routes history.
	 * Mind, this method can't work properly with `HistoryAPI` based engines.
	 *
	 * @param [filter] - filter predicate
	 */
	clear(filter?: router.HistoryClearFilter): Promise<void> {
		return this.engine.clear(filter);
	}

	/**
	 * Clears all temporary routes from the history.
	 * The temporary route is a route that has `tmp` flag within its own properties, like, `params`, `query` or `meta`.
	 * Mind, this method can't work properly with `HistoryAPI` based engines.
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
	 * @deprecated
	 * @see [[bRouter.getRoute]]
	 */
	@deprecated({renamedTo: 'getRoute'})
	getPageOpts(ref: string): CanUndef<router.RouteBlueprint> {
		return this.getRoute(ref);
	}

	/**
	 * Emits a new transition to the specified route
	 *
	 * @param ref - route name or URL or `null`, if the route is equal to the previous
	 * @param [opts] - additional transition options
	 * @param [method] - transition method
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
			currentEngineRoute = engine.route ?? engine.page;

		this.emit('beforeChange', ref, opts, method);

		let
			newRouteInfo: CanUndef<router.RouteAPI>;

		const getEngineRoute = () => currentEngineRoute ?
			currentEngineRoute.url ?? router.getRouteName(currentEngineRoute) :
			undefined;

		// Get information about the specified route
		if (ref != null) {
			newRouteInfo = this.getRoute(engine.id(ref));

		// In this case, we don't have the specified ref to a transition,
		// so we try to get information from the current route and use it as a blueprint to the new
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
					x: pageXOffset,
					y: pageYOffset
				}
			}
		};

		// To save scroll position before change to a new route
		// we need to emit system "replace" transition with padding information about the scroll
		if (currentEngineRoute && method !== 'replace') {
			const
				currentRouteWithScroll = Object.mixin(true, undefined, currentEngineRoute, scroll);

			if (!Object.fastCompare(currentEngineRoute, currentRouteWithScroll)) {
				await engine.replace(getEngineRoute()!, currentRouteWithScroll);
			}
		}

		// We haven't found any routes that math to the specified ref
		if (newRouteInfo == null) {
			// The transition was emitted by a user, then we need to save the scroll
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
			currentRoute = this.field.get<router.Route>('routeStore'),
			deepMixin = (...args) => Object.mixin({deep: true, skipUndefs: false}, ...args);

		// If a new route matches by a name with the current,
		// we need to mix a new state with the current
		if (router.getRouteName(currentRoute) === newRouteInfo.name) {
			deepMixin(newRouteInfo, router.getBlankRouteFrom(currentRoute), opts);

		// Simple normalizing of a route state
		} else {
			deepMixin(newRouteInfo, opts);
		}

		const {meta} = newRouteInfo;

		// If a route support filling from the root object or query parameters
		fillRouteParams(newRouteInfo, this);

		// We have two variants of transitions:
		// "soft" - between routes were changed only query or meta parameters
		// "hard" - first and second routes aren't equal by a name

		// Mutations of query and meta parameters of a route shouldn't force re-render of components,
		// that why we placed it to a prototype object by using `Object.create`

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

		// Emits the route transition event
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

		// Checking that a new route is really needed, i.e., it isn't equal to the previous
		let newRouteIsReallyNeeded = !Object.fastCompare(
			router.getComparableRouteParams(currentRoute),
			router.getComparableRouteParams(newRoute)
		);

		// Nothing changes between routes, but there are provided some meta object
		if (!newRouteIsReallyNeeded && currentRoute != null && opts.meta != null) {
			newRouteIsReallyNeeded = !Object.fastCompare(
				Object.select(currentRoute.meta, opts.meta),
				opts.meta
			);
		}

		// The transition is necessary, but now we need to understand should we emit a "soft" or "hard" transition
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

			// If the used engine doesn't support the requested transition method,
			// we should fallback to `replace`
			if (!Object.isFunction(engine[method])) {
				method = 'replace';
			}

			// This transitions is marked as `external`,
			// i.e. it refers to another site
			if (newRouteInfo.meta.external) {
				const u = newRoute.url;
				location.href = u !== '' ? u : '/';
				return;
			}

			await engine[method](newRoute.url, plainInfo);

			const isSoftTransition = Boolean(r.route && Object.fastCompare(
				router.convertRouteToPlainObjectWithoutProto(currentRoute),
				router.convertRouteToPlainObjectWithoutProto(newRoute)
			));

			// In this transition were changed only properties from a prototype,
			// that why it can be emitted as a soft transition, i.e. without forcing of the re-rendering of components
			if (isSoftTransition) {
				this.emit('softChange', newRoute);

				// We get a prototype by using `__proto__` link,
				// because `Object.getPrototypeOf` returns a non-watchable object.
				// This behavior is based on a strategy that every touch to an object property of the watched object
				// will create a child watch object.

				const
					proto = <any>r.route!.__proto__;

				// Correct values from the root route object
				for (let keys = Object.keys(nonWatchRouteValues), i = 0; i < keys.length; i++) {
					const key = keys[i];
					proto[key] = nonWatchRouteValues[key];
				}

			} else {
				hardChange = true;
				this.emit('hardChange', newRoute);
				r.route = newRoute;
			}

			emitTransition();

		// This route is equal to the previous and we don't actually do transition,
		// but for a "push" request we need to emit a "fake" transition event anyway
		} else if (method === 'push') {
			emitTransition();

		// In this case, we don't do transition, but still,
		// we should emit the special event, because some methods, like, `back` or `forward` can wait for it
		} else {
			emitTransition(true);
		}

		// Restoring the scroll position
		if (meta.autoScroll !== false) {
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

				// Restoring of scroll for static height components
				await this.nextTick(label);
				setScroll();

				// Restoring of scroll for dynamic height components
				await this.async.sleep(10, label);
				setScroll();
			})().catch(stderr);
		}

		return newRoute;
	}

	/**
	 * @deprecated
	 * @see [[bRouter.emitTransition]]
	 */
	@deprecated({renamedTo: 'emitTransition'})
	setPage(
		ref: Nullable<string>,
		opts?: router.TransitionOptions,
		method?: TransitionMethod
	): Promise<CanUndef<router.Route>> {
		return this.emitTransition(ref, opts, method);
	}

	/**
	 * Updates the schema of routes
	 *
	 * @param basePath - base route path
	 * @param [routes] - static schema of application routes
	 * @param [activeRoute]
	 */
	updateRoutes(
		basePath: string,
		routes?: StaticRoutes,
		activeRoute?: Nullable<router.InitialRoute>
	): Promise<router.RouteBlueprints>;

	/**
	 * Updates the schema of routes
	 *
	 * @param basePath - base route path
	 * @param activeRoute
	 * @param [routes] - static schema of application routes
	 */
	updateRoutes(
		basePath: string,
		activeRoute: router.InitialRoute,
		routes?: StaticRoutes
	): Promise<router.RouteBlueprints>;

	/**
	 * Updates the schema of routes
	 *
	 * @param routes - static schema of application routes
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
	 * Initializes the router within an application
	 * @emits `$root.initRouter(router:` [[bRouter]]`)`
	 */
	@hook('created')
	protected init(): void {
		this.field.set('routerStore', this, this.$root);
		this.r.emit('initRouter', this);
	}

	/**
	 * Initializes the specified route
	 * @param [route] - route
	 */
	@hook('beforeDataCreate')
	protected initRoute(route: Nullable<router.InitialRoute> = this.initialRoute): Promise<void> {
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
	 * Handler: click on an element with the `href` attribute
	 * @param e
	 */
	@watch({
		field: 'document:click',
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

		const
			l = Object.assign(document.createElement('a'), {href});

		if (a.getAttribute('target') === '_blank' || e.ctrlKey) {
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
