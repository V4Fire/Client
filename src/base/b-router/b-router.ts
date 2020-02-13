/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Async from 'core/async';
import path, { RegExpOptions } from 'path-to-regexp';

import globalRoutes from 'routes';
import engine from 'core/router';
import symbolGenerator from 'core/symbol';

import { concatUrls, toQueryString } from 'core/url';
import { Router, BasePageMeta, PageSchema, CurrentPage, HistoryClearFilter } from 'core/router/interface';
import iData, { component, prop, system, hook, watch, p } from 'super/i-data/i-data';

export * from 'super/i-data/i-data';
export * from 'core/router/interface';

export interface PageOptions<
	PARAMS extends object = Dictionary,
	QUERY extends object = Dictionary,
	META extends object = Dictionary
> extends CurrentPage<PARAMS, QUERY, META> {
	toPath(params?: Dictionary): string;
}

export interface PageOptionsProp {
	meta?: BasePageMeta;
	params?: Dictionary;
	query?: Dictionary;
}

export const pageOptsKeys = [
	'meta',
	'params',
	'query'
];

export interface PagePropObject extends PageOptionsProp {
	page: string;
}

export type PageProp =
	string |
	PagePropObject;

export interface Page {
	page: string;
	pattern?: string;
	rgxp?: RegExp;
	index: boolean;
	alias?: string;
	redirect?: string;
	meta: BasePageMeta;
}

export type Pages = Dictionary<Page>;
export type PageSchemaDict = Dictionary<PageSchema>;
export type SetPage = 'push' | 'replace' | 'event';

export interface RouteParams {
	params?: Dictionary;
	query?: Dictionary;
}

export const
	$$ = symbolGenerator();

@component()
export default class bRouter extends iData {
	/* @override */
	public async!: Async<this>;

	/**
	 * Base route path
	 */
	@prop()
	readonly basePath: string = '/';

	/**
	 * Initial page
	 */
	@prop<bRouter>({
		type: [String, Object],
		required: false,
		watch: (o) => {
			o.initComponentValues().catch(stderr);
		}
	})

	readonly pageProp?: PageProp;

	/**
	 * Initial router paths
	 */
	@prop({type: Object, required: false})
	readonly pagesProp?: PageSchemaDict;

	/**
	 * Engine constructor for router
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
	 * Page load status
	 */
	@system()
	status: number = 0;

	/**
	 * Engine for remote router
	 */
	@system((o) => o.sync.link<(v: unknown) => Router>((v) => <any>v(o)))
	protected engine!: Router;

	/**
	 * Page store
	 */
	@system()
	protected pageStore?: CurrentPage;

	/**
	 * Router paths
	 */
	@system<bRouter>({
		after: 'engine',
		init: (o) => o.sync.link((v) => {
			const
				base = o.basePath,
				routes = <PageSchemaDict>(v || o.engine.routes || globalRoutes),
				pages = {};

			for (let keys = Object.keys(routes), i = 0; i < keys.length; i++) {
				const
					key = keys[i],
					obj = routes[key] || {},
					params = [];

				let
					page = key;

				if (Object.isString(obj)) {
					let
						pattern;

					if (obj && base) {
						pattern = concatUrls(base, obj);
					}

					pages[key] = {
						page,
						pattern,
						index: page === 'index',
						rgxp: pattern != null ? path(pattern, params) : undefined,
						meta: {page, params}
					};

				} else {
					page = String(obj.page || page);

					let
						pattern;

					if (Object.isString(obj.path) && base) {
						pattern = concatUrls(base, obj.path);
					}

					pages[key] = {
						page,
						pattern,
						alias: obj.alias,
						redirect: obj.redirect,
						index: obj.index || page === 'index',
						rgxp: pattern != null ? path(pattern, params, <RegExpOptions>obj.pathOpts) : undefined,
						meta: {...obj, page, params}
					};
				}
			}

			return pages;
		})
	})

	protected pages!: Pages;

	/**
	 * Current page
	 */
	@p({cache: false})
	get page(): CanUndef<CurrentPage> {
		return this.field.get('pageStore');
	}

	/**
	 * Scrolls a document to the specified coordinates
	 */
	scrollTo(y?: number, x?: number): void {
		this.r.scrollTo(x, y);
	}

	/**
	 * Pushes a new transition to the history
	 *
	 * @param page
	 * @param [opts] - additional transition options
	 */
	async push(page: Nullable<string>, opts?: PageOptionsProp): Promise<void> {
		await this.setPage(page, opts, 'push');
	}

	/**
	 * Replaces the current transition from the history to a new
	 *
	 * @param page
	 * @param [opts] - additional transition options
	 */
	async replace(page: Nullable<string>, opts?: PageOptionsProp): Promise<void> {
		await this.setPage(page, opts, 'replace');
	}

	/**
	 * Loads a page from the history, identified by its relative position to the current page
	 * (with the current page being relative index 0)
	 *
	 * @param pos
	 */
	go(pos: number): void {
		this.engine.go(pos);
	}

	/**
	 * Moves forward through the history
	 */
	forward(): void {
		this.engine.forward();
	}

	/**
	 * Moves backward through the history
	 */
	back(): void {
		this.engine.back();
	}

	/**
	 * Clears the history session: if specified filter, then all matched transitions will be cleared
	 * @param [filter]
	 */
	clear(filter?: HistoryClearFilter): Promise<void> {
		return this.engine.clear(filter);
	}

	/**
	 * Clears temporary history transitions
	 */
	clearTmp(): Promise<void> {
		return this.engine.clearTmp();
	}

	/**
	 * Returns a full route path string by the specified parameters
	 *
	 * @param path - base path
	 * @param [opts] - route options
	 */
	getRoutePath(path: string, opts: RouteParams = {}): CanUndef<string> {
		const
			route = this.getPageOpts(path);

		if (!route) {
			return;
		}

		let
			res = route.toPath(opts.params);

		if (opts.query) {
			const
				q = toQueryString(opts.query, false);

			if (q) {
				res += `?${q}`;
			}
		}

		return res.replace(/[#?]\s*$/, '');
	}

	/**
	 * Returns an information object of the specified page
	 * @param [page]
	 */
	getPageOpts(page: string): CanUndef<PageOptions> {
		const
			p = this.pages,
			keys = Object.keys(p),
			base = this.basePath;

		const
			externalLinkRgxp = /^(?:https?:)?\/\/(?:[^\s]*)+$/,
			normalizeBaseRgxp = /(.*)?[\\/]+$/,
			initialPage = page;

		let
			byId = false,
			alias,
			obj;

		let
			pageRef = page,
			basePage = true;

		while (true) {
			if (pageRef in p) {
				byId = true;
				obj = p[pageRef];

				if (!obj || obj && !obj.redirect && !obj.alias) {
					break;
				}

			} else {
				if (base) {
					const v = base.replace(normalizeBaseRgxp, (str, base) => `${RegExp.escape(base)}/*`);
					pageRef = concatUrls(base, pageRef.replace(new RegExp(`^${v}`), ''));

					if (basePage) {
						page = pageRef;
						basePage = false;
					}
				}

				for (let i = 0; i < keys.length; i++) {
					const
						el = p[keys[i]];

					if (!el) {
						continue;
					}

					if (el.page === pageRef || el.pattern === pageRef) {
						byId = true;
						obj = el;
						break;
					}

					if (el.rgxp && el.rgxp.test(pageRef) && (
						!obj ||
						(<string>el.pattern).length > obj.pattern.length
					)) {
						obj = el;
					}
				}
			}

			if (!obj || !obj.redirect && !obj.alias) {
				break;
			}

			if (obj.alias) {
				if (alias == null) {
					alias = obj;
				}

				pageRef = obj.alias;

			} else {
				pageRef = page = obj.redirect;

				if (alias == null) {
					alias = false;
				}
			}

			if (obj.meta.external || obj.meta.external !== false && externalLinkRgxp.test(pageRef)) {
				obj.meta.external = true;
				break;

			} else {
				obj = undefined;
			}
		}

		if (!obj) {
			for (let i = 0; i < keys.length; i++) {
				const
					el = p[keys[i]];

				if (el && el.index) {
					obj = el;
					break;
				}
			}

		} else if (alias) {
			obj = {...obj, pattern: alias.pattern};
		}

		if (obj) {
			const meta = Object.create({
				meta: Object.mixin(true, {}, obj.meta),
				toPath(initParams?: Dictionary): string {
					const
						p = {};

					if (initParams) {
						for (let keys = Object.keys(initParams), i = 0; i < keys.length; i++) {
							const
								key = keys[i],
								el = initParams[key];

							if (el !== undefined) {
								p[key] = String(el);
							}
						}
					}

					if (obj.meta.external) {
						return path.compile(pageRef)(p);
					}

					return path.compile(obj.pattern || page)(p);
				}
			});

			// tslint:disable-next-line:prefer-object-spread
			const t = Object.assign(meta, {
				page: obj.page,
				params: {},
				query: {}
			});

			if (!byId && obj.pattern) {
				const
					url = obj.meta.external ? initialPage : obj.url || page,
					params = obj.rgxp.exec(url);

				if (params) {
					for (let o = path.parse(obj.pattern), i = 0, j = 0; i < o.length; i++) {
						const
							el = o[i];

						if (Object.isSimpleObject(el)) {
							t.params[el.name] = params[++j];
						}
					}
				}
			}

			return t;
		}
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
		opts?: PageOptionsProp,
		method: SetPage = 'push'
	): Promise<CanUndef<CurrentPage>> {
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
						if (/^(?:true|false|null|undefined)$/.test(obj)) {
							data[key] = Object.isString(obj) ? Object.parse(obj) : obj;

						} else {
							const
								strVal = String(obj),
								numVal = Number(obj);

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
				modCurrentPage = Object.mixin<CurrentPage>(true, undefined, currentPage, scroll);

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
			current = this.field.get<CurrentPage>('pageStore');

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
				rootState = r.syncRouterState(undefined, 'remoteCheck');

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
					rootField = r.meta.fields,
					rootSystemFields = r.meta.systemFields;

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

		return store;
	}

	/**
	 * Initializes component values
	 */
	@hook('beforeDataCreate')
	protected async initComponentValues(): Promise<void> {
		const
			page = this.pageProp;

		if (page) {
			if (Object.isString(page)) {
				await this.replace(page);

			} else {
				await this.replace(page.page, Object.reject(page, 'page'));
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
