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

import Async from 'core/async';
import symbolGenerator from 'core/symbol';
import path from 'path-to-regexp';

import { deprecate, deprecated } from 'core/functools/deprecation';
import { concatUrls, toQueryString } from 'core/url';

import engine, { Router, Route, HistoryClearFilter } from 'core/router';
import iData, { component, prop, system, hook } from 'super/i-data/i-data';

import { qsClearFixRgxp, externalLinkRgxp } from 'base/b-router/const';
import { initRoutes } from 'base/b-router/modules/initializers';

import {

	purifyRoute,

	getBlankRouteFrom,
	getParamsFromRouteThatNeedWatch,

	convertRouteToPlainObject,
	convertRouteToPlainObjectWithoutProto,

	normalizeTransitionOpts,
	fillRouteParams

} from 'base/b-router/modules/normalizers';

import {

	RouteAPI,
	ActiveRoute,
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
	 * Base root path: all route paths are concatenated with this path
	 */
	@prop()
	readonly basePath: string = '/';

	/**
	 * Active route value.
	 * Usually, you don't need to manually provide of the active route value,
	 * because it can be automatically inferred, but sometimes it can be useful.
	 */
	@prop<bRouter>({
		type: [String, Object],
		required: false,
		watch: (o) => {
			o.initComponentValues().catch(stderr);
		}
	})

	readonly activeRoute?: ActiveRoute;

	/**
	 * Static schema of application routes.
	 * By default, this value is taken from "routes/index.ts".
	 */
	@prop({type: Object, required: false})
	readonly routesProp?: StaticRoutes;

	/**
	 * Factory to create router engine.
	 * By default, this value is taken from "core/router/engines".
	 */
	@prop<bRouter>({
		type: Function,
		default: engine,
		watch: (o) => {
			o.initComponentValues().catch(stderr);
		}
	})

	readonly engineProp!: () => Router;

	/**
	 * Active router engine.
	 * For example, it can be HTML5 history router or router that based on URL Hash value.
	 *
	 * @see [[bRouter.engine]]
	 */
	@system((o) => o.sync.link<(v: unknown) => Router>((v) => <any>v(o)))
	protected engine!: Router;

	/**
	 * Value of the active route
	 */
	@system()
	protected routeStore?: Route;

	/**
	 * Compiled schema of application routes
	 * @see [[bRouter.routesProp]]
	 */
	@system({after: 'engine', init: initRoutes})
	protected routes!: RouteBlueprints;

	/**
	 * Value of the active route
	 * @see [[bRouter.routeStore]]
	 */
	get route(): CanUndef<this['r']['CurrentPage']> {
		return this.field.get('routeStore');
	}

	/**
	 * @deprecated
	 * @see [[bRouter.route]]
	 */
	@deprecated({renamedTo: 'route'})
	get page(): CanUndef<Route> {
		return this.route;
	}

	/**
	 * Link to the root scroll method
	 */
	get scrollTo(): this['r']['scrollTo'] {
		return this.r.scrollTo;
	}

	/**
	 * Pushes a new route to the history stack.
	 * The method returns a promise that is resolved when the transition will be completed.
	 *
	 * @param page
	 * @param [opts] - additional options
	 */
	async push(page: Nullable<string>, opts?: TransitionOptions): Promise<void> {
		await this.emitTransition(page, opts, 'push');
	}

	/**
	 * Replaces the current route.
	 * The method returns a promise that is resolved when the transition will be completed.
	 *
	 * @param page
	 * @param [opts] - additional options
	 */
	async replace(page: Nullable<string>, opts?: TransitionOptions): Promise<void> {
		await this.emitTransition(page, opts, 'replace');
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
	 * Clears the routes history
	 * @param [filter] - filter predicate
	 */
	clear(filter?: HistoryClearFilter): Promise<void> {
		return this.engine.clear(filter);
	}

	/**
	 * Clears all temporary routes from the history.
	 * The temporary route is a route that has "tmp" flag within its own properties, like, "params", "query" or "meta".
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
	 * Returns a route of the specified route with padding of additional parameters
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

			if (q) {
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
	 * this.getRoutePath('/demo').name === 'demo';
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
			resolvedRoute,
			alias;

		let
			resolvedRef = ref,
			refIsNormalized = true;

		while (true) {
			// Reference to a route is passed as ID
			if (resolvedRef in routes) {
				resolvedById = true;
				resolvedRoute = routes[resolvedRef];

				if (!resolvedRoute || resolvedRoute && !resolvedRoute.redirect && !resolvedRoute.alias) {
					break;
				}

			// Reference to a route is passed as a path
			} else {
				if (basePath) {
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
					if (route.name === resolvedRef || route.pattern === resolvedRef) {
						resolvedById = true;
						resolvedRoute = route;
						break;
					}

					// Try to test the passed ref with a route pattern
					if (route.rgxp?.test(resolvedRef)) {
						if (!resolvedRoute) {
							resolvedRoute = route;
							continue;
						}

						// If we have several matches with the provided ref,
						// like routes "/foo" and "/foo/:id" are matched with "/foo/bar",
						// we should prefer that pattern that has more length
						if (route.pattern!.length > resolvedRoute.pattern.length) {
							resolvedRoute = route;
						}
					}
				}
			}

			// If we haven't found a route that matches to the provided ref or the founded route doesn't redirect or refer
			// to another route, we can exit from the search loop, otherwise, we need to resolve the redirect/alias
			if (!resolvedRoute || !resolvedRoute.redirect && !resolvedRoute.alias) {
				break;
			}

			// The alias should preserve an original route name
			if (resolvedRoute.alias) {
				if (alias == null) {
					alias = resolvedRoute;
				}

				resolvedRef = resolvedRoute.alias;

			} else {
				resolvedRef = ref = resolvedRoute.redirect;

				if (alias == null) {
					alias = false;
				}
			}

			const
				{external} = resolvedRoute.meta;

			// If the resolved route is marked as external or looks like external,
			// i.e., it refers to another domain
			if (external || external !== false && externalLinkRgxp.test(resolvedRef)) {
				resolvedRoute.meta.external = true;
				break;
			}

			// Continue of resolving
			resolvedRoute = undefined;
		}

		// We haven't found a route by the provided ref,
		// that why we need to find "default" route as loopback
		if (!resolvedRoute) {
			for (let i = 0; i < routeKeys.length; i++) {
				const
					el = routes[routeKeys[i]];

				if (el && el.default) {
					resolvedRoute = el;
					break;
				}
			}

		// We have found a route by the provided ref, but it contains an alias
		} else if (alias) {
			resolvedRoute = {...resolvedRoute, pattern: alias.pattern};
		}

		if (!resolvedRoute) {
			return;
		}

		const routeAPI: RouteAPI = Object.create({
			...resolvedRoute,
			meta: Object.mixin(true, {}, resolvedRoute.meta),

			get page(): string {
				return this.name;
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

				if (resolvedRoute.meta.external) {
					return path.compile(resolvedRef)(p);
				}

				return path.compile(resolvedRoute.pattern || ref)(p);
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
		if (!resolvedById && resolvedRoute.pattern) {
			const
				url = resolvedRoute.meta.external ? initialRef : resolvedRoute.url || ref,
				params = resolvedRoute.rgxp.exec(url);

			if (params) {
				for (let o = path.parse(resolvedRoute.pattern), i = 0, j = 0; i < o.length; i++) {
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
	 * @param ref - route name or route path or null, if the route is equal to the previous
	 * @param [opts] - additional transition options
	 * @param [method] - transition method
	 *
	 * @emits beforeChange(route: Nullable<string>, params: CanUndef<PageOptionsProp>, method: TransitionMethod)
	 *
	 * @emits change(route: Route)
	 * @emits hardChange(route: Route)
	 * @emits softChange(route: Route)
	 *
	 * @emits transition(route: Route, type: TransitionType)
	 * @emits $root.transition(route: Route, type: TransitionType)
	 */
	async emitTransition(
		ref: Nullable<string>,
		opts?: TransitionOptions,
		method: TransitionMethod = 'push'
	): Promise<CanUndef<Route>> {
		opts = normalizeTransitionOpts(opts);

		if (!ref && !opts && !this.lfc.isBeforeCreate()) {
			return;
		}

		opts = getBlankRouteFrom(opts);

		const {
			r,
			engine,
			engine: {
				route: currentRoute
			}
		} = this;

		this.emit('beforeChange', ref, opts, method);

		// Emits the route transition event
		const emitTransition = (onlyOwnTransition?) => {
			const type = hardChange ? 'hard' : 'soft';

			if (onlyOwnTransition) {
				this.emit('transition', routeStore, type);

			} else {
				this.emit('change', routeStore);
				this.emit('transition', routeStore, type);
				r.emit('transition', routeStore, type);
			}
		};

		let
			routeInfo;

		// Get information about the specified route
		if (ref) {
			routeInfo = this.getRoute(engine.id(ref));

		// Get information about the current route
		} else if (currentRoute) {
			ref = currentRoute.url || currentRoute.name;

			const
				route = this.getRoute(ref);

			if (route) {
				routeInfo = Object.mixin(true, route, purifyRoute(currentRoute));
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
		if (currentRoute && method !== 'replace') {
			const
				currentRouteWithScroll = Object.mixin(true, undefined, currentRoute, scroll);

			if (!Object.fastCompare(currentRoute, currentRouteWithScroll)) {
				await engine.replace(currentRoute.url || currentRoute.name, currentRouteWithScroll);
			}
		}

		// We haven't found any routes that math to the specified ref
		if (!routeInfo) {
			// The transition was emitted by a user, then we need to save the scroll
			if (method !== 'event' && ref != null) {
				await engine[method](ref, scroll);
			}

			return;
		}

		if (!routeInfo.name && currentRoute?.name) {
			routeInfo.name = currentRoute.name;
		}

		const
			current = this.field.get<Route>('routeStore'),
			deepMixin = (...args) => Object.mixin({deep: true, withUndef: true}, ...args);

		// If a new route matches by a name with the current,
		// we need to mix a new state with the current
		if (current?.name === routeInfo.name) {
			deepMixin(routeInfo, getBlankRouteFrom(current), opts);

		// Simple normalizing of a route state
		} else {
			deepMixin(routeInfo, opts);
		}

		const {meta} = routeInfo;

		// If the route support filling from the root object or query parameters
		// @ts-ignore
		fillRouteParams(routeInfo, r);

		// We have two variants of a transition:
		// "soft" - between routes were changed only query or meta parameters
		// "hard" - first and second routes aren't equal by a name

		// Mutations of query and meta parameters of a route shouldn't force re-render of components,
		// that why we placed it to a prototype object by using Object.create

		const
			nonWatchRouteValues = {query: routeInfo.query, meta};

		const routeStore = Object.assign(
			Object.create(nonWatchRouteValues),
			Object.reject(routeInfo, Object.keys(nonWatchRouteValues))
		);

		let
			hardChange = false;

		// Checking that the new route is really needed, i.e. it isn't equal to the previous
		const newRouteIsReallyNeeded = !Object.fastCompare(
			getParamsFromRouteThatNeedWatch(current),
			getParamsFromRouteThatNeedWatch(routeStore)
		);

		// The transition is real needed, but now we need to understand should we emit "soft" or "hard" transition
		if (newRouteIsReallyNeeded) {
			this.field.set('routeStore', routeStore);

			const
				plainInfo = convertRouteToPlainObject(routeInfo);

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
			if (routeInfo.meta.external) {
				location.href = routeInfo.resolvePath(routeInfo.params) || '/';
				return;
			}

			await engine[method](routeInfo.resolvePath(routeInfo.params), plainInfo);

			const isSoftTransition = Boolean(r.route && Object.fastCompare(
				convertRouteToPlainObjectWithoutProto(current),
				convertRouteToPlainObjectWithoutProto(routeStore)
			));

			// In this transition were changed only properties from a prototype,
			// that why it can be emitted as soft transition, i.e. without forcing of re-render of components
			if (isSoftTransition) {
				const
					proto = <any>r!.route!.__proto__;

				// Correct values from the root route object
				for (let keys = Object.keys(nonWatchRouteValues), i = 0; i < keys.length; i++) {
					const key = keys[i];
					proto[key] = nonWatchRouteValues[key];
				}

				this.emit('softChange', routeStore);

			} else {
				hardChange = true;
				this.emit('hardChange', routeStore);
				r.route = routeStore;
			}

			emitTransition();

		// This route is equal to the previous and we don't actually do transition,
		// but for a "push" request we need to emit the "fake" transition event anyway
		} else if (method === 'push') {
			emitTransition();

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
					await this.async.wait(() => Object.fastCompare(routeStore, r.route), label);
				}

				await this.nextTick(label);

				const
					s = meta.scroll;

				if (s) {
					this.scrollTo(s.y, s.x);

				} else if (hardChange) {
					this.scrollTo(0, 0);
				}
			})().catch(stderr);
		}

		return routeStore;
	}

	/**
	 * @deprecated
	 * @see [[bRouter.emitTransition]]
	 *
	 * @param ref
	 * @param opts
	 * @param method
	 */
	@deprecated({renamedTo: 'emitTransition'})
	setPage(ref: Nullable<string>, opts?: TransitionOptions, method?: TransitionMethod): Promise<CanUndef<Route>> {
		return this.emitTransition(ref, opts, method);
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
	 * Initializes component values
	 */
	@hook('beforeDataCreate')
	protected async initComponentValues(): Promise<void> {
		const
			{activeRoute} = this;

		if (activeRoute) {
			if (Object.isString(activeRoute)) {
				await this.replace(activeRoute);

			} else {
				await this.replace(activeRoute.name, Object.reject(activeRoute, ['name', 'page']));
			}

		} else {
			await this.replace(null);
		}
	}

	/** @override */
	protected initBaseAPI(): void {
		super.initBaseAPI();
		this.emitTransition = this.instance.emitTransition.bind(this);
	}
}
