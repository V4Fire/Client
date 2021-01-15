/* eslint-disable max-lines */

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

import path, { Key, RegExpOptions } from 'path-to-regexp';
import { deprecate, deprecated } from 'core/functools/deprecation';
import { concatUrls, toQueryString } from 'core/url';

import globalRoutes from 'routes';
import Async from 'core/async';

import engine, { Router, Route, HistoryClearFilter } from 'core/router';
import iData, { component, prop, system, computed, hook, wait, watch } from 'super/i-data/i-data';

import { routeNames, defaultRouteNames, isExternal, qsClearFixRgxp } from 'base/b-router/const';
import { getRouteName } from 'base/b-router/modules/helpers';

import {

	purifyRoute,

	getBlankRouteFrom,
	getComparableRouteParams,

	convertRouteToPlainObject,
	convertRouteToPlainObjectWithoutProto,

	normalizeTransitionOpts,
	fillRouteParams

} from 'base/b-router/modules/normalizers';

import {

	RouteAPI,
	InitialRoute,
	PurifiedRoute,
	StaticRoutes,

	RouteBlueprint,
	RouteBlueprints,

	TransitionMethod,
	TransitionOptions

} from 'base/b-router/interface';

export * from 'super/i-data/i-data';
export * from 'base/b-router/const';
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
	/* @override */
	public async!: Async<this>;

	/**
	 * Static schema of application routes.
	 * By default, this value is taken from "routes/index.ts".
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

	routes!: RouteBlueprints;

	/**
	 * Initial route value.
	 * Usually, you don't need to manually provide the initial route value,
	 * because it can be automatically inferred, but sometimes it can be useful.
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

	readonly initialRoute?: InitialRoute;

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
	@prop()
	readonly basePathProp: string = '/';

	/**
	 * Base route path: all route paths are concatenated with this path
	 * @see [[bRouter.basePathProp]]
	 */
	@system<bRouter>({
		init: (o) => o.sync.link(),
		watch: 'updateCurrentRoute'
	})

	basePath!: string;

	/**
	 * If true, the router will intercept all click events on elements with a `href` attribute to emit a transition.
	 * An element with `href` can have additional attributes:
	 *
	 * * `data-router-method` - a type of the used router method to emit the transition;
	 * * `data-router-go` - a value for the router "go" method;
	 * * `data-router-params`, `data-router-query`, `data-router-meta` - additional parameters for the used router method
	 *   (to provide an object use JSON).
	 *
	 */
	@prop(Boolean)
	readonly interceptLinks: boolean = true;

	/**
	 * Factory to create router engine.
	 * By default, this value is taken from "core/router/engines".
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

	readonly engineProp!: () => Router;

	/**
	 * Internal router engine.
	 * For example, it can be the HTML5 history router or a router that based on URL Hash value.
	 *
	 * @see [[bRouter.engine]]
	 */
	@system((o) => o.sync.link((v) => (<(v: unknown) => Router>v)(o)))
	protected engine!: Router;

	/**
	 * Value of the active route
	 */
	@system()
	protected routeStore?: Route;

	/**
	 * Value of the active route
	 * @see [[bRouter.routeStore]]
	 *
	 * @example
	 * ```js
	 * console.log(route?.query)
	 * ```
	 */
	get route(): CanUndef<this['r']['CurrentPage']> {
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
	get defaultRoute(): CanUndef<RouteBlueprint> {
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
	async push(route: Nullable<string>, opts?: TransitionOptions): Promise<void> {
		await this.emitTransition(route, opts, 'push');
	}

	/**
	 * Replaces the current route.
	 * The method returns a promise that is resolved when the transition will be completed.
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
	async replace(route: Nullable<string>, opts?: TransitionOptions): Promise<void> {
		await this.emitTransition(route, opts, 'replace');
	}

	/**
	 * Switches to a route from the history,
	 * identified by its relative position to the current route (with the current route being relative index 0).
	 * The method returns a promise that is resolved when the transition will be completed.
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
	 * The method returns a promise that is resolved when the transition will be completed.
	 */
	async forward(): Promise<void> {
		const res = this.promisifyOnce('transition');
		this.engine.forward();
		await res;
	}

	/**
	 * Switches to the previous route from the history.
	 * The method returns a promise that is resolved when the transition will be completed.
	 */
	async back(): Promise<void> {
		const res = this.promisifyOnce('transition');
		this.engine.back();
		await res;
	}

	/**
	 * Clears the routes history.
	 * Mind, this method can't work properly with HistoryAPI based engines.
	 *
	 * @param [filter] - filter predicate
	 */
	clear(filter?: HistoryClearFilter): Promise<void> {
		return this.engine.clear(filter);
	}

	/**
	 * Clears all temporary routes from the history.
	 * The temporary route is a route that has "tmp" flag within its own properties, like, "params", "query" or "meta".
	 * Mind, this method can't work properly with HistoryAPI based engines.
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

	/**
	 * Returns a path of the specified route with padding of additional parameters
	 *
	 * @param ref - route name or path
	 * @param [opts] - additional options
	 *
	 * @example
	 * ```js
	 * routes = {
	 *   demo: {
	 *     route: '/demo'
	 *   }
	 * };
	 *
	 *
	 * this.getRoutePath('demo') === '/demo';
	 * this.getRoutePath('/demo', {query: {foo: 'bar'}}) === '/demo?foo=bar';
	 * ```
	 */
	getRoutePath(ref: string, opts: TransitionOptions = {}): CanUndef<string> {
		const
			route = this.getRoute(ref);

		if (!route) {
			return;
		}

		let
			res = route.resolvePath(opts.params);

		if (opts.query) {
			const
				q = toQueryString(opts.query, false);

			if (q !== '') {
				res += `?${q}`;
			}
		}

		return res.replace(qsClearFixRgxp, '');
	}

	/**
	 * Returns a route object by the specified name or path
	 *
	 * @param ref - route name or path
	 *
	 * @example
	 * ```js
	 * routes = {
	 *   demo: {
	 *     route: '/demo'
	 *   }
	 * };
	 *
	 *
	 * this.getRoute('/demo').name === 'demo';
	 * ```
	 */
	getRoute(ref: string): CanUndef<RouteAPI> {
		const
			{routes, basePath} = this;

		const
			routeKeys = Object.keys(routes),
			initialRef = ref;

		let
			resolvedById = false,
			resolvedRoute: Nullable<RouteBlueprint> = null,
			alias: Nullable<RouteBlueprint> = null;

		let
			resolvedRef = ref,
			refIsNormalized = true,
			externalRedirect = false;

		// eslint-disable-next-line no-constant-condition
		while (true) {
			// Reference to a route that passed as ID
			if (resolvedRef in routes) {
				resolvedById = true;
				resolvedRoute = routes[resolvedRef];

				if (resolvedRoute == null) {
					break;
				}

				const
					{meta} = resolvedRoute;

				if (meta.redirect == null && meta.alias == null) {
					break;
				}

				if (meta.external) {
					externalRedirect = true;
					break;
				}

			// Reference to a route that passed as a path
			} else {
				if (basePath !== '') {
					// Resolve the situation when the passed path already has basePath
					const v = basePath.replace(/(.*)?[\\/]+$/, (str, base) => `${RegExp.escape(base)}/*`);
					resolvedRef = concatUrls(basePath, resolvedRef.replace(new RegExp(`^${v}`), ''));

					// We need to normalize only a user "raw" ref
					if (refIsNormalized) {
						ref = resolvedRef;
						refIsNormalized = false;
					}
				}

				for (let i = 0; i < routeKeys.length; i++) {
					const
						route = routes[routeKeys[i]];

					if (!route) {
						continue;
					}

					// In this case we have full matching of a route ref by a name or pattern
					if (getRouteName(route) === resolvedRef || route.pattern === resolvedRef) {
						resolvedById = true;
						resolvedRoute = route;
						break;
					}

					// Try to test the passed ref with a route pattern
					if (route.rgxp?.test(resolvedRef)) {
						if (resolvedRoute == null) {
							resolvedRoute = route;
							continue;
						}

						// If we have several matches with the provided ref,
						// like routes "/foo" and "/foo/:id" are matched with "/foo/bar",
						// we should prefer that pattern that has more length
						if (route.pattern!.length > (resolvedRoute.pattern?.length ?? 0)) {
							resolvedRoute = route;
						}
					}
				}
			}

			if (resolvedRoute == null) {
				break;
			}

			const
				{meta} = resolvedRoute;

			// If we haven't found a route that matches to the provided ref or the founded route doesn't redirect or refer
			// to another route, we can exit from the search loop, otherwise, we need to resolve the redirect/alias
			if (meta.redirect == null && meta.alias == null) {
				break;
			}

			if (meta.external) {
				externalRedirect = true;
				break;
			}

			// The alias should preserve an original route name and path
			if (meta.alias != null) {
				if (alias == null) {
					alias = resolvedRoute;
				}

				resolvedRef = meta.alias;

			} else {
				resolvedRef = meta.redirect!;
				ref = resolvedRef;
			}

			// Continue of resolving
			resolvedRoute = undefined;
		}

		// We haven't found a route by the provided ref,
		// that why we need to find "default" route as loopback
		if (!resolvedRoute) {
			resolvedRoute = this.defaultRoute;

		// We have found a route by the provided ref, but it contains an alias
		} else if (alias) {
			resolvedRoute = {
				...resolvedRoute,
				...Object.select(alias, [
					'name',
					'pattern',
					'rgxp',
					'pathParams'
				])
			};
		}

		if (resolvedRoute == null) {
			return;
		}

		const routeAPI: RouteAPI = Object.create({
			...resolvedRoute,
			meta: Object.mixin(true, {}, resolvedRoute.meta),

			get page(): string {
				return resolvedRoute!.name;
			},

			resolvePath(params?: Dictionary): string {
				const
					p = {};

				if (params) {
					for (let keys = Object.keys(params), i = 0; i < keys.length; i++) {
						const
							key = keys[i],
							el = params[key];

						if (el !== undefined) {
							p[key] = String(el);
						}
					}
				}

				if (externalRedirect) {
					return path.compile(resolvedRoute!.meta.redirect ?? ref)(p);
				}

				return path.compile(resolvedRoute!.pattern ?? ref)(p);
			},

			toPath(params?: Dictionary): string {
				deprecate({name: 'toPath', type: 'method', renamedTo: 'resolvePath'});
				return this.resolvePath(params);
			}
		});

		Object.assign(routeAPI, {
			name: resolvedRoute.name,
			params: {},
			query: {}
		});

		// Fill route parameters from URL
		if (!resolvedById && resolvedRoute.rgxp != null) {
			const
				params = resolvedRoute.rgxp.exec(initialRef);

			if (params) {
				for (let o = path.parse(resolvedRoute.pattern!), i = 0, j = 0; i < o.length; i++) {
					const
						el = o[i];

					if (Object.isSimpleObject(el)) {
						routeAPI.params[el.name] = params[++j];
					}
				}
			}
		}

		return routeAPI;
	}

	/**
	 * @deprecated
	 * @see [[bRouter.getRoute]]
	 */
	@deprecated({renamedTo: 'getRoute'})
	getPageOpts(ref: string): CanUndef<RouteBlueprint> {
		return this.getRoute(ref);
	}

	/**
	 * Emits a new transition to the specified route
	 *
	 * @param ref - route name or URL or null, if the route is equal to the previous
	 * @param [opts] - additional transition options
	 * @param [method] - transition method
	 *
	 * @emits `beforeChange(route: Nullable<string>, params: TransitionOptions, method: TransitionMethod)`
	 *
	 * @emits `change(route: Route)`
	 * @emits `hardChange(route: Route)`
	 * @emits `softChange(route: Route)`
	 *
	 * @emits `transition(route: Route, type: TransitionType)`
	 * @emits `$root.transition(route: Route, type: TransitionType)`
	 */
	async emitTransition(
		ref: Nullable<string>,
		opts?: TransitionOptions,
		method: TransitionMethod = 'push'
	): Promise<CanUndef<Route>> {
		opts = getBlankRouteFrom(normalizeTransitionOpts(opts));

		const
			{r, engine} = this;

		const
			currentEngineRoute = engine.route ?? engine.page;

		this.emit('beforeChange', ref, opts, method);

		let
			newRouteInfo: CanUndef<RouteAPI>;

		const getEngineRoute = () => currentEngineRoute ?
			currentEngineRoute.url ?? getRouteName(currentEngineRoute) :
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
				newRouteInfo = Object.mixin(true, route, purifyRoute(currentEngineRoute));
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

		if ((<PurifiedRoute<RouteAPI>>newRouteInfo).name == null) {
			const
				nm = getRouteName(currentEngineRoute);

			if (nm != null) {
				newRouteInfo.name = nm;
			}
		}

		const
			currentRoute = this.field.get<Route>('routeStore'),
			deepMixin = (...args) => Object.mixin({deep: true, withUndef: true}, ...args);

		// If a new route matches by a name with the current,
		// we need to mix a new state with the current
		if (getRouteName(currentRoute) === newRouteInfo.name) {
			deepMixin(newRouteInfo, getBlankRouteFrom(currentRoute), opts);

		// Simple normalizing of a route state
		} else {
			deepMixin(newRouteInfo, opts);
		}

		const {meta} = newRouteInfo;

		// If the route support filling from the root object or query parameters
		fillRouteParams(newRouteInfo, this);

		// We have two variants of a transition:
		// "soft" - between routes were changed only query or meta parameters
		// "hard" - first and second routes aren't equal by a name

		// Mutations of query and meta parameters of a route shouldn't force re-render of components,
		// that why we placed it to a prototype object by using Object.create

		const
			nonWatchRouteValues = {query: newRouteInfo.query, meta};

		const newRoute = Object.assign(
			Object.create(nonWatchRouteValues),
			Object.reject(convertRouteToPlainObject(newRouteInfo), Object.keys(nonWatchRouteValues))
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

		// Checking that the new route is really needed, i.e. it isn't equal to the previous
		const newRouteIsReallyNeeded = !Object.fastCompare(
			getComparableRouteParams(currentRoute),
			getComparableRouteParams(newRoute)
		);

		// The transition is real needed, but now we need to understand should we emit "soft" or "hard" transition
		if (newRouteIsReallyNeeded) {
			this.field.set('routeStore', newRoute);

			const
				plainInfo = convertRouteToPlainObject(newRouteInfo);

			const canRouteTransformToReplace =
				currentRoute &&
				method !== 'replace' &&
				Object.fastCompare(convertRouteToPlainObject(currentRoute), plainInfo);

			if (canRouteTransformToReplace) {
				method = 'replace';
			}

			// If the used engine doesn't support the requested transition method,
			// we should fallback to "replace"
			if (!Object.isFunction(engine[method])) {
				method = 'replace';
			}

			// This transitions is marked as external,
			// i.e. it refers to another site
			if (newRouteInfo.meta.external) {
				const p = newRouteInfo.resolvePath(newRouteInfo.params);
				location.href = p !== '' ? p : '/';
				return;
			}

			await engine[method](newRouteInfo.resolvePath(newRouteInfo.params), plainInfo);

			const isSoftTransition = Boolean(r.route && Object.fastCompare(
				convertRouteToPlainObjectWithoutProto(currentRoute),
				convertRouteToPlainObjectWithoutProto(newRoute)
			));

			// In this transition were changed only properties from a prototype,
			// that why it can be emitted as soft transition, i.e. without forcing of re-render of components
			if (isSoftTransition) {
				this.emit('softChange', newRoute);

				// We get the prototype by using __proto__ link
				// because Object.getPrototypeOf returns non-watchable object.
				// This behavior is based on a strategy that every touch to an object property of a watched object
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
		// but for a "push" request we need to emit the "fake" transition event anyway
		} else if (method === 'push') {
			emitTransition();

		// In this case, we don't do transition, but still,
		// we should emit the special event, because some methods, like, "back" or "forward" can wait for it
		} else {
			emitTransition(true);
		}

		// Restoring the scroll position
		if (meta.autoScroll !== false) {
			(async () => {
				const label = {
					label: $$.autoScroll
				};

				if (hardChange) {
					await this.async.wait(() => Object.fastCompare(newRoute, r.route), label);
				}

				await this.nextTick(label);

				const
					s = meta.scroll;

				if (s != null) {
					this.r.scrollTo(s.x, s.y);

				} else if (hardChange) {
					this.r.scrollTo(0, 0);
				}
			})().catch(stderr);
		}

		return newRoute;
	}

	/**
	 * @deprecated
	 * @see [[bRouter.emitTransition]]
	 */
	@deprecated({renamedTo: 'emitTransition'})
	setPage(ref: Nullable<string>, opts?: TransitionOptions, method?: TransitionMethod): Promise<CanUndef<Route>> {
		return this.emitTransition(ref, opts, method);
	}

	/**
	 * Updates the schema of routes
	 *
	 * @param basePath - base route path
	 * @param [routes] - static schema of application routes
	 * @param [activeRoute]
	 */
	updateRoutes(basePath: string, routes?: StaticRoutes, activeRoute?: Nullable<InitialRoute>): Promise<RouteBlueprints>;

	/**
	 * Updates the schema of routes
	 *
	 * @param basePath - base route path
	 * @param activeRoute
	 * @param [routes] - static schema of application routes
	 */
	updateRoutes(basePath: string, activeRoute: InitialRoute, routes?: StaticRoutes): Promise<RouteBlueprints>;

	/**
	 * Updates the schema of routes
	 *
	 * @param routes - static schema of application routes
	 * @param [activeRoute]
	 */
	updateRoutes(routes: StaticRoutes, activeRoute?: Nullable<InitialRoute>): Promise<RouteBlueprints>;

	/**
	 * @param basePathOrRoutes
	 * @param [routesOrActiveRoute]
	 * @param [activeRouteOrRoutes]
	 */
	@wait('beforeReady')
	async updateRoutes(
		basePathOrRoutes: string | StaticRoutes,
		routesOrActiveRoute?: StaticRoutes | Nullable<InitialRoute>,
		activeRouteOrRoutes?: Nullable<InitialRoute> | StaticRoutes
	): Promise<RouteBlueprints> {
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
				activeRoute = <Nullable<InitialRoute>>activeRouteOrRoutes;
			}

		} else {
			routes = basePathOrRoutes;
			activeRoute = <Nullable<InitialRoute>>routesOrActiveRoute;
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

	/** @override */
	protected initRemoteData(): CanUndef<CanPromise<RouteBlueprints | Dictionary>> {
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
	 * @emits $root.initRouter(router: bRouter)
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
	protected initRoute(route: Nullable<InitialRoute> = this.initialRoute): Promise<void> {
		if (route != null) {
			if (Object.isString(route)) {
				return this.replace(route);
			}

			return this.replace(getRouteName(route), Object.reject(route, routeNames));
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
	 * Compiles the specified static routes and returns a new object
	 * @param [routes]
	 */
	protected compileStaticRoutes(routes: StaticRoutes = this.engine.routes ?? globalRoutes): RouteBlueprints {
		const
			{basePath} = this,
			compiledRoutes = {};

		for (let keys = Object.keys(routes), i = 0; i < keys.length; i++) {
			const
				name = keys[i],
				route = routes[name] ?? {},
				pathParams = [];

			if (Object.isString(route)) {
				const
					pattern = concatUrls(basePath, route);

				compiledRoutes[name] = {
					name,

					pattern,
					rgxp: path(pattern, pathParams),

					get pathParams(): Key[] {
						return pathParams;
					},

					/** @deprecated */
					get page(): string {
						return this.name;
					},

					/** @deprecated */
					get index(): boolean {
						return this.meta.default;
					},

					meta: {
						name,
						external: isExternal.test(pattern),

						/** @deprecated */
						page: name
					}
				};

			} else {
				let
					pattern;

				if (Object.isString(route.path)) {
					pattern = concatUrls(basePath, route.path);
				}

				compiledRoutes[name] = {
					name,

					pattern,
					rgxp: pattern != null ? path(pattern, pathParams, <RegExpOptions>route.pathOpts) : undefined,

					get pathParams(): Key[] {
						return pathParams;
					},

					/** @deprecated */
					get page(): string {
						return this.name;
					},

					/** @deprecated */
					get index(): boolean {
						return this.meta.default;
					},

					meta: {
						...route,

						name,
						default: Boolean(route.default ?? route.index ?? defaultRouteNames[name]),

						external: route.external ?? (
							isExternal.test(pattern) ||
							isExternal.test(route.redirect ?? '')
						),

						/** @deprecated */
						page: name
					}
				};
			}
		}

		return compiledRoutes;
	}

	/** @override */
	protected initBaseAPI(): void {
		super.initBaseAPI();
		this.compileStaticRoutes = this.instance.compileStaticRoutes.bind(this);
		this.emitTransition = this.instance.emitTransition.bind(this);
	}

	/**
	 * Handler: click on an element with a href attribute
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
			isExternal.test(href);

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
