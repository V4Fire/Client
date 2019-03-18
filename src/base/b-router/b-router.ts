/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

// tslint:disable:max-file-line-count

import $C = require('collection.js');
import Async from 'core/async';

import path = require('path-to-regexp');
import { RegExpOptions } from 'path-to-regexp';

import engine from 'base/b-router/drivers';
import symbolGenerator from 'core/symbol';

import { concatUrls } from 'core/url';
import { Router, BasePageMeta, PageSchema, CurrentPage, HistoryCleanFilter } from 'base/b-router/drivers/interface';
import iData, { component, prop, system, hook, watch, p } from 'super/i-data/i-data';

export * from 'super/i-data/i-data';
export * from 'base/b-router/drivers/interface';

export interface PageOpts<
	P extends Dictionary = Dictionary,
	Q extends Dictionary = Dictionary,
	M extends Dictionary = Dictionary
> extends CurrentPage<P, Q, M> {
	toPath(params?: Dictionary): string;
}

export interface PageOptsProp {
	meta?: BasePageMeta;
	params?: Dictionary;
	query?: Dictionary;
}

export interface PagePropObj extends PageOptsProp {
	page: string;
}

export type PageProp =
	string |
	PagePropObj;

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

export const
	$$ = symbolGenerator();

@component()
export default class bRouter<T extends Dictionary = Dictionary> extends iData<T> {
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
	 * If true, then will be shown page load status on transitions
	 */
	@prop(Boolean)
	readonly showStatus: boolean = false;

	/**
	 * Page load status
	 */
	@system()
	status: number = 0;

	/**
	 * Engine for remote router
	 */
	@system((o) => o.link<(v: unknown) => Router>((v) => v(o)))
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
		init: (o) => o.link((v) => {
			const
				base = o.basePath,
				routes = <PageSchemaDict>(v || o.engine.routes || {}),
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
		return this.getField('pageStore');
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
	async push(page: Nullable<string>, opts?: PageOptsProp): Promise<void> {
		await this.setPage(page, opts, 'push');
	}

	/**
	 * Replaces the current transition from the history to a new
	 *
	 * @param page
	 * @param [opts] - additional transition options
	 */
	async replace(page: Nullable<string>, opts?: PageOptsProp): Promise<void> {
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
	 * Cleans the history session: if specified filter, then all matched transitions will be cleared
	 * @param [filter]
	 */
	clean(filter?: HistoryCleanFilter): Promise<void> {
		return this.engine.clean(filter);
	}

	/**
	 * Cleans temporary history transitions
	 */
	cleanTmp(): Promise<void> {
		return this.engine.cleanTmp();
	}

	/**
	 * Returns an information object of the specified page
	 * @param [page]
	 */
	getPageOpts(page: string): CanUndef<PageOpts> {
		const
			p = this.pages,
			keys = Object.keys(p),
			base = this.basePath;

		const
			externalLinkRgxp = /^(?:https?:)?\/\/(?:[^\s]*)+$/,
			normalizeBaseRgxp = /(.*)?[\\/]+$/,
			initialPageString = page;

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
				break;

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

			if (obj.meta.external !== false && externalLinkRgxp.test(pageRef)) {
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

							if (el != null) {
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
					url = obj.meta.external ? initialPageString : obj.url || page,
					params = obj.rgxp.exec(url);

				if (params) {
					for (let o = path.parse(obj.pattern), i = 0, j = 0; i < o.length; i++) {
						const
							el = o[i];

						if (Object.isObject(el)) {
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
	 * @emits beforeChange(page: Nullable<string>, params: CanUndef<PageOptsProp>, method: string)
	 * @emits change(info: PageOpts)
	 * @emits hardChange(info: PageOpts)
	 * @emits softChange(info: PageOpts)
	 * @emits $root.transition(info: PageOpts, type: string)
	 */
	async setPage(
		page: Nullable<string>,
		opts?: PageOptsProp,
		method: SetPage = 'push'
	): Promise<CanUndef<CurrentPage>> {
		const
			{$root: r, engine, engine: {page: currentPage}} = this;

		let
			isEmptyOpts = !opts;

		if (opts) {
			opts = Object.mixin(true, {}, opts);
			isEmptyOpts = true;

			for (let keys = Object.keys(opts), i = 0; i < keys.length; i++) {
				if ($C(opts[keys[i]]).length()) {
					isEmptyOpts = false;
					break;
				}
			}

			if (!isEmptyOpts) {
				const normalizeOpts = (obj, key?, data?) => {
					if (!obj) {
						return;
					}

					if (Object.isObject(obj)) {
						for (let keys = Object.keys(obj), i = 0; i < keys.length; i++) {
							const key = keys[i];
							normalizeOpts(obj[key], key, obj);
						}

						return;
					}

					if (Object.isArray(obj)) {
						for (let i = 0; i < obj.length; i++) {
							normalizeOpts(obj[i], i, obj);
						}

						return;
					}

					if (data) {
						// tslint:disable-next-line:prefer-conditional-expression
						if ({true: true, false: true}[obj]) {
							data[key] = Object.isString(obj) ? Object.parse(obj) : obj;

						} else {
							data[key] = isNaN(obj) ? String(obj) : Number(obj);
						}
					}
				};

				normalizeOpts(opts.params);
				normalizeOpts(opts.query);
			}
		}

		if (!page && isEmptyOpts && !this.isBeforeCreate()) {
			return;
		}

		this.emit('beforeChange', page, opts, method);

		const rejectSystemOpts = (obj) => {
			if (obj) {
				return Object.reject(obj, ['page', 'url']);
			}

			return {};
		};

		const getPlainOpts = (obj) => {
			const
				res = {};

			if (obj) {
				for (const key in obj) {
					const
						el = obj[key];

					if (!Object.isFunction(el)) {
						res[key] = el;
					}
				}
			}

			return res;
		};

		const getPlainWatchOpts = (obj) => {
			const res = <Dictionary>getPlainOpts(obj);
			delete res.meta;
			return res;
		};

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
				modCurrentPage = Object.mixin(true, undefined, currentPage, scroll);

			if (!Object.fastCompare(currentPage, modCurrentPage)) {
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
			current = this.getField<CurrentPage>('pageStore');

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
				rootState = r.convertStateToRouter(undefined, 'remote');

			for (let o = meta.params, i = 0; i < o.length; i++) {
				const
					key = o[i],
					nm = key.name,
					val = query[nm];

				if (params[nm] == null) {
					if (val != null && new RegExp(key.pattern).test(val)) {
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

					if (query[key] == null) {
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
			this.setField('pageStore', store);

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
				location.replace(info.toPath(info.params));
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
	@watch({field: 'document:click', wrapper: (o, cb) => o.delegate('[href]', cb)})
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
	 * @override
	 * @emits $root.initRouter(router: bRouter)
	 */
	protected created(): void {
		super.created();
		this.setField('routerStore', this, this.$root);
		this.r.emit('initRouter', this);
	}
}
