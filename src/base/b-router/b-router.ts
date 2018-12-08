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
import { Key } from 'path-to-regexp';

import driver from 'base/b-router/drivers';
import symbolGenerator from 'core/symbol';

import { Router, BasePageMeta, PageSchema, CurrentPage, PageOpts } from 'base/b-router/drivers/interface';
import iData, { component, prop, system, hook, watch, p } from 'super/i-data/i-data';

export * from 'super/i-data/i-data';
export * from 'base/b-router/drivers/interface';

export type RouterMeta = BasePageMeta & {
	autoScroll?: boolean;
	scroll?: {
		x: number;
		y: number;
	};
};

export interface PagePropObj {
	page: string;
	meta?: RouterMeta;
	params?: Dictionary;
	query?: Dictionary;
}

export interface PageParams {
	meta?: RouterMeta;
	params?: Dictionary;
	query?: Dictionary;
}

export type PageProp =
	string |
	PagePropObj;

export interface Page {
	page: string;
	index: boolean;
	pattern: string;
	rgxp: RegExp;
	meta: RouterMeta;
}

export type Pages = Dictionary<Page>;
export type SetPage = 'push' | 'replace' | 'event';

export const
	$$ = symbolGenerator();

@component()
export default class bRouter<T extends Dictionary = Dictionary> extends iData<T> {
	/* @override */
	public async!: Async<this>;

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
	readonly pagesProp?: Dictionary<PageSchema>;

	/**
	 * Driver constructor for router
	 */
	@prop<bRouter>({
		type: Function,
		default: driver,
		watch: (o) => {
			o.initComponentValues().catch(stderr);
		}
	})

	readonly driverProp!: () => Router;

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
	 * Driver for remote router
	 */
	@system((o) => o.link<(v: unknown) => Router>((v) => v(o)))
	protected driver!: Router;

	/**
	 * Page store
	 */
	@system()
	protected pageStore?: CurrentPage;

	/**
	 * Router paths
	 */
	@system<bRouter>({
		after: 'driver',
		init: (o) => o.link((v) => $C(v || o.driver.routes || {}).map((obj, page) => {
			obj = obj || {};

			const
				isStr = Object.isString(obj),
				pattern = isStr ? obj : obj.path,
				params = [];

			page = isStr ?
				page : obj.page || page;

			return {
				page,
				pattern,
				index: !isStr && obj.index || page === 'index',
				rgxp: pattern != null ? path(pattern, params) : undefined,
				meta: {...isStr ? {} : obj, page, params}
			};
		}))
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
	 * Pushes a new transition to router
	 *
	 * @param page
	 * @param [params] - additional transition parameters
	 */
	async push(page: Nullable<string>, params?: PageParams): Promise<void> {
		await this.setPage(page, params, 'push');
	}

	/**
	 * Replaces the current transition to a new
	 *
	 * @param page
	 * @param [params] - additional transition parameters
	 */
	async replace(page: Nullable<string>, params?: PageParams): Promise<void> {
		await this.setPage(page, params, 'replace');
	}

	/**
	 * Router.back
	 */
	back(): void {
		this.driver.back();
	}

	/**
	 * Router.forward
	 */
	forward(): void {
		this.driver.forward();
	}

	/**
	 * Router.go
	 * @param pos
	 */
	go(pos: number): void {
		this.driver.go(pos);
	}

	/**
	 * Returns an information object of the specified page
	 * @param [page]
	 */
	getPageOpts(page: string): CanUndef<PageOpts> {
		let
			byId = false,
			obj;

		const
			p = this.pages;

		if (page in p) {
			byId = true;
			obj = p[page];

		} else {
			obj = $C(p).one.get((el: Page) => {
				if (el.page === page) {
					byId = true;
					return true;
				}

				return el.rgxp && el.rgxp.test(page);
			});
		}

		if (!obj) {
			obj = $C(p).one.get((el: Page) => el.index);
		}

		if (obj) {
			const meta = Object.create({
				meta: Object.mixin(true, {}, obj.meta),
				toPath(p?: Dictionary): string {
					p = $C(p).filter((el) => el != null).map(String);
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
					params = obj.rgxp.exec(obj.url || page);

				if (params) {
					$C(<Key[]>path.parse(obj.pattern)).forEach((el, i) => {
						if (Object.isObject(el)) {
							t.params[el.name] = params[i + 1];
						}
					});
				}
			}

			return t;
		}
	}

	/**
	 * Sets a new page
	 *
	 * @param page
	 * @param [params] - additional page parameters
	 * @param [method] - driver method
	 *
	 * @emits beforeChange(page: Nullable<string>, params: CanUndef<PageParams>, method: string)
	 * @emits change(info: PageOpts)
	 * @emits hardChange(info: PageOpts)
	 * @emits softChange(info: PageOpts)
	 * @emits $root.transition(info: PageOpts, type: string)
	 */
	async setPage(
		page: Nullable<string>,
		params?: PageParams,
		method: SetPage = 'push'
	): Promise<CanUndef<CurrentPage>> {
		const
			{$root: r, driver: d, driver: {page: c}} = this;

		const
			rejectParams = (o) => o && Object.reject(o, ['page', 'url']),
			isEmptyParams = !params || $C(params).every((el) => !$C(el).length());

		if (!page && isEmptyParams && !this.isBeforeCreate()) {
			return;
		}

		this.emit('beforeChange', page, params, method);

		let
			info;

		if (page) {
			info = this.getPageOpts(d.id(page));

		} else if (c) {
			page = c.url || c.page;

			const
				p = this.getPageOpts(page);

			if (p) {
				info = Object.mixin(true, p, rejectParams(c));
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

		const getPageParams = (info) => {
			const
				{meta, params, query} = info;

			if (meta.paramsFromQuery !== false) {
				const
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

						} else if (meta.paramsFromRoot !== false) {
							params[nm] = rootState[nm];
						}
					}
				}
			}

			return params;
		};

		if (c && method === 'push') {
			await d.replace(c.url || c.page, Object.mixin(true, undefined, c, scroll));
		}

		const
			isNotEvent = method !== 'event';

		if (!info) {
			if (isNotEvent && page != null) {
				await d[method](page, scroll);
			}

			return;
		}

		if (!info.page && c && c.page) {
			info.page = c.page;
		}

		const
			current = this.getField<CurrentPage>('pageStore'),
			f = (v) => $C(v).filter((el, key) => !Object.isFunction(el) && key !== 'meta').object(true).map();

		const extend = (parent) => {
			Object.mixin({deep: true, withUndef: true}, info, p ? rejectParams(f(p)) : undefined, rejectParams(params));
		};

		extend(current && current.page === info.page ? current : undefined);

		const
			meta = info.meta,
			nonWatchValues = {query: info.query, meta},
			store = Object.assign(Object.create(nonWatchValues), Object.reject(info, Object.keys(nonWatchValues)));

		let
			hardChange = false;

		const emitTransition = () => {
			this.emit('change', store);
			r.emit('transition', store, hardChange ? 'hard' : 'soft');
		};

		if (!Object.fastCompare(f(current), f(store))) {
			this.setField('pageStore', store);

			if (isNotEvent) {
				await d[method](info.toPath(getPageParams(info)), info);
			}

			const
				f = (v) => $C(v).filter((el) => !Object.isFunction(el)).map();

			if (r.route && Object.fastCompare(f(current), f(store))) {
				const
					proto = Object.getPrototypeOf(r.route);

				$C(nonWatchValues).forEach((el, key) => {
					proto[key] = el;
				});

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
						params: Object.parse(data.params),
						query: Object.parse(data.query)
					});
			}
		}
	}

	/** @override */
	protected initBaseAPI(): void {
		super.initBaseAPI();
		this.setPage = this.instance.setPage.bind(this);
	}

	/** @override */
	protected created(): void {
		super.created();
		this.setField('routerStore', this, this.$root);
	}
}
