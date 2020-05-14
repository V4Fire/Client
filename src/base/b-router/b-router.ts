/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Async from 'core/async';
import symbolGenerator from 'core/symbol';
import path from 'path-to-regexp';

import { deprecated } from 'core/functools/deprecation';
import { concatUrls, toQueryString } from 'core/url';

import engine, { Router, Route, HistoryClearFilter } from 'core/router';
import iData, { component, prop, system, hook, watch } from 'super/i-data/i-data';

import {

	pageOptsKeys,
	qsClearFixRgxp,
	externalLinkRgxp

} from 'base/b-router/const';

import { initRoutes } from 'base/b-router/modules/initializers';

import {

	RouteAPI,
	ActiveRoute,
	StaticRoutes,

	RouteBlueprint,
	RouteBlueprints,

	SetPageMethod,
	TransitionOptions

} from 'base/b-router/interface';
import {deprecate} from '../../../.yalc/@v4fire/core/src/core/functools/deprecation';

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
	@system<bRouter>({after: 'engine', init: initRoutes})
	protected routes!: RouteBlueprints;

	/**
	 * Value of the active route
	 * @see [[bRouter.routeStore]]
	 */
	get route(): CanUndef<Route> {
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
		await this.setPage(page, opts, 'push');
	}

	/**
	 * Replaces the current route.
	 * The method returns a promise that is resolved when the transition will be completed.
	 *
	 * @param page
	 * @param [opts] - additional options
	 */
	async replace(page: Nullable<string>, opts?: TransitionOptions): Promise<void> {
		await this.setPage(page, opts, 'replace');
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
		const res = this.promisifyOnce('foo');
		this.engine.go(pos);
		await res;
	}

	/**
	 * Switches to the next route from the history.
	 * The method returns a promise that is resolved when the transition will be completed.
	 */
	async forward(): Promise<void> {
		const res = this.promisifyOnce('foo');
		this.engine.forward();
		await res;
	}

	/**
	 * Switches to the previous route from the history.
	 * The method returns a promise that is resolved when the transition will be completed.
	 */
	async back(): Promise<void> {
		const res = this.promisifyOnce('foo');
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
			meta: Object.mixin(true, {}, resolvedRoute.meta),

			get page(): string {
				deprecate({name: 'page', type: 'property', renamedTo: 'name'});
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
	 * Sets a new page
	 *
	 * @param page
	 * @param [opts] - additional transition options
	 * @param [method] - engine method
	 *
	 * @emits beforeChange(page: Nullable<string>, params: CanUndef<PageOptionsProp>, method: string)
	 * @emits change(info: PageOptions)
	 * @emits hardChange(info: PageOptions)
	 * @emits softChange(info: PageOptions)
	 * @emits $root.transition(info: PageOptions, type: string)
	 */
	async setPage(
		page: Nullable<string>,
		opts?: TransitionOptions,
		method: SetPageMethod = 'push'
	): Promise<CanUndef<Route>> {
		const
			{$root: r, engine, engine: {page: currentPage}} = this;

		let
			isEmptyOpts = !opts;

		if (opts) {
			isEmptyOpts = true;

			for (let keys = Object.keys(opts), i = 0; i < keys.length; i++) {
				if (Object.size(opts[keys[i]])) {
					isEmptyOpts = false;
					break;
				}
			}

			if (!isEmptyOpts) {
				opts = Object.mixin<Dictionary>(true, {}, Object.select(opts, pageOptsKeys));

				const normalizeOpts = (obj, key?, data?) => {
					if (!obj) {
						return;
					}

					if (Object.isPlainObject(obj)) {
						for (let keys = Object.keys(obj), i = 0; i < keys.length; i++) {
							const key = keys[i];
							normalizeOpts(obj[key], key, obj);
						}

						return;
					}

					if (Object.isArray(obj)) {
						for (let i = 0; i < (<unknown[]>obj).length; i++) {
							normalizeOpts(obj[i], i, obj);
						}

						return;
					}

					if (data) {
						const
							strVal = String(obj);

						if (/^(?:true|false|null|undefined)$/.test(strVal)) {
							data[key] = Object.isString(obj) ? Object.parse(obj) : obj;

						} else {
							const numVal = Number(obj);
							data[key] = isNaN(obj) || strVal !== String(numVal) ? strVal : numVal;
						}
					}
				};

				normalizeOpts(opts.params);
				normalizeOpts(opts.query);
			}
		}

		if (!page && isEmptyOpts && !this.lfc.isBeforeCreate()) {
			return;
		}

		this.emit('beforeChange', page, opts, method);

		const rejectSystemOpts = (obj) => {
			if (obj) {
				return Object.reject(obj, ['page', 'url']);
			}

			return {};
		};

		const getPlainOpts = (obj, filter?) => {
			const
				res = {};

			if (obj) {
				for (const key in obj) {
					const
						el = obj[key];

					if (filter && !filter(el, key)) {
						continue;
					}

					if (!Object.isFunction(el)) {
						res[key] = el;
					}
				}
			}

			return res;
		};

		const getPlainWatchOpts = (obj) =>
			getPlainOpts(obj, (el, key) => key !== 'meta' && key[0] !== '_');

		let
			info;

		if (page) {
			info = this.getPageOpts(engine.id(page));

		} else if (currentPage) {
			page = currentPage.url || currentPage.page;

			const
				p = this.getPageOpts(page);

			if (p) {
				info = Object.mixin(true, p, rejectSystemOpts(currentPage));
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

		// Attach scroll position
		if (currentPage && method !== 'replace') {
			const
				modCurrentPage = Object.mixin<Route>(true, undefined, currentPage, scroll);

			if (!Object.fastCompare(currentPage, modCurrentPage)) {
				// @ts-ignore
				await engine.replace(currentPage.url || currentPage.page, modCurrentPage);
			}
		}

		if (!info) {
			if (method !== 'event' && page != null) {
				await engine[method](page, scroll);
			}

			return;
		}

		if (!info.page && currentPage && currentPage.page) {
			info.page = currentPage.page;
		}

		const
			current = this.field.get<Route>('pageStore');

		{
			const normalize = (val) => Object.mixin(true, val && rejectSystemOpts(val), {
				query: {},
				params: {},
				meta: {}
			});

			const p = current && current.page === info.page ? current : undefined;
			Object.mixin({deep: true, withUndef: true}, info, normalize(getPlainOpts(p)), normalize(opts));
		}

		const {
			meta,
			query,
			params
		} = info;

		if (meta.paramsFromQuery !== false) {
			const
				paramsFromRoot = meta.paramsFromRoot !== false,
				rootState = r.unsafe.syncRouterState(undefined, 'remoteCheck');

			for (let o = meta.params, i = 0; i < o.length; i++) {
				const
					key = o[i],
					nm = key.name,
					val = query[nm];

				if (params[nm] === undefined) {
					if (val !== undefined && new RegExp(key.pattern).test(val)) {
						params[nm] = val;
						delete query[nm];

					} else if (paramsFromRoot) {
						params[nm] = rootState[nm];
					}

				} else {
					delete query[nm];
				}
			}

			if (paramsFromRoot) {
				const
					rootField = r.unsafe.meta.fields,
					rootSystemFields = r.unsafe.meta.systemFields;

				for (let keys = Object.keys(rootState), i = 0; i < keys.length; i++) {
					const
						key = keys[i],
						rootVal = rootState[key];

					if (query[key] === undefined) {
						const
							field = rootField[key] || rootSystemFields[key];

						if (field && field.meta['router.query']) {
							query[key] = rootVal;

						} else {
							delete query[key];
						}
					}
				}
			}
		}

		const
			nonWatchValues = {query: info.query, meta},
			store = Object.assign(Object.create(nonWatchValues), Object.reject(info, Object.keys(nonWatchValues)));

		let
			hardChange = false;

		const emitTransition = () => {
			this.emit('change', store);
			r.emit('transition', store, hardChange ? 'hard' : 'soft');
		};

		if (!Object.fastCompare(getPlainWatchOpts(current), getPlainWatchOpts(store))) {
			this.field.set('pageStore', store);

			const
				plainInfo = getPlainOpts(info);

			if (
				currentPage &&
				method !== 'replace' &&
				Object.fastCompare(getPlainOpts(currentPage), plainInfo)
			) {
				method = 'replace';
			}

			if (!Object.isFunction(engine[method])) {
				method = 'replace';
			}

			if (info.meta.external) {
				location.href = info.toPath(info.params) || '/';
				return;
			}

			await engine[method](
				info.toPath(info.params),
				plainInfo
			);

			const getPlainOptsWithoutProto = (v) => {
				const
					res = {};

				if (v) {
					for (let keys = Object.keys(v), i = 0; i < keys.length; i++) {
						const
							key = keys[i],
							el = v[key];

						if (key[0] === '_') {
							continue;
						}

						if (!Object.isFunction(el)) {
							res[key] = el;
						}
					}
				}

				return res;
			};

			if (r.route && Object.fastCompare(getPlainOptsWithoutProto(current), getPlainOptsWithoutProto(store))) {
				const
					proto = Object.getPrototypeOf(r.route);

				for (let keys = Object.keys(nonWatchValues), i = 0; i < keys.length; i++) {
					const key = keys[i];
					proto[key] = nonWatchValues[key];
				}

				this.emit('softChange', store);

			} else {
				hardChange = true;
				this.emit('hardChange', store);
				r.route = store;
			}

			emitTransition();

		} else if (method === 'push') {
			emitTransition();
		}

		if (meta.autoScroll !== false) {
			(async () => {
				try {
					const label = {
						label: $$.autoScroll
					};

					if (hardChange) {
						await this.async.wait(() => Object.fastCompare(store, r.route), label);
					}

					await this.nextTick(label);

					const
						s = meta.scroll;

					if (s) {
						this.scrollTo(s.y, s.x);

					} else if (hardChange) {
						this.scrollTo(0, 0);
					}

				} catch (err) {
					stderr(err);
				}
			})();
		}

		this.emit('foo');
		return store;
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

	/**
	 * Handler: link trigger
	 * @param e
	 */
	@watch({
		field: 'document:click',
		wrapper: (o, cb) => o.dom.delegate('[href]', cb)
	})

	protected async onLink(e: MouseEvent): Promise<void> {
		const
			a = <HTMLElement>e.delegateTarget,
			href = a.getAttribute('href');

		if (!href || /^(#|\w+:|\/\/)/.test(href)) {
			return;
		}

		e.preventDefault();

		const
			l = Object.assign(document.createElement('a'), {href});

		if (e.ctrlKey) {
			window.open(l.href, '_blank');

		} else {
			const
				data = a.dataset,
				method = data.method;

			switch (method) {
				case 'back':
					this.back();
					break;

				case 'forward':
					this.back();
					break;

				case 'go':
					this.go(Number(data.pos || -1));
					break;

				default:
					await this[method === 'replace' ? 'replace' : 'push'](href, {
						params: Object.parse(data.params) || {},
						query: Object.parse(data.query) || {}
					});
			}
		}
	}

	/** @override */
	protected initBaseAPI(): void {
		super.initBaseAPI();
		this.setPage = this.instance.setPage.bind(this);
	}

	/**
	 * @emits $root.initRouter(router: bRouter)
	 */
	protected created(): void {
		this.field.set('routerStore', this, this.$root);
		this.r.emit('initRouter', this);
	}
}
