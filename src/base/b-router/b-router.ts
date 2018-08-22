/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import $C = require('collection.js');
import path = require('path-to-regexp');

import { Key } from 'path-to-regexp';
import { delegate } from 'core/dom';

import Async from 'core/async';
import driver from 'base/b-router/drivers';
import symbolGenerator from 'core/symbol';

import { Router, PageSchema, PageInfo, CurrentPage } from 'base/b-router/drivers/interface';
import iData, { component, prop, system, hook, p } from 'super/i-data/i-data';

export * from 'super/i-data/i-data';
export * from 'base/b-router/drivers/interface';

export interface Meta extends Dictionary {
	autoScroll?: boolean;
	scroll?: {
		x: number;
		y: number;
	};
}

export interface PagePropObj extends CurrentPage {
	meta?: Meta;
}

export type PageProp =
	string |
	PagePropObj;

export interface PageParams extends Dictionary {
	params?: Dictionary;
	query?: Dictionary;
	meta?: Meta;
}

export type Pages = Dictionary<{
	page: string;
	pattern: string;
	rgxp: RegExp;
	meta: Meta;
}>;

export type SetPage =
	'push' |
	'replace' |
	'event';

export const
	$$ = symbolGenerator();

@component()
export default class bRouter<T extends Dictionary = Dictionary> extends iData<T> {
	/* @override */
	public async!: Async<this>;

	/**
	 * Initial page
	 */
	@prop({
		type: [String, Object],
		watch: (o) => {
			const ctx: bRouter = <any>o;
			ctx.initComponentValues().catch(stderr);
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
	@prop({
		type: Function,
		default: driver,
		watch: (o) => {
			const ctx: bRouter = <any>o;
			ctx.initComponentValues().catch(stderr);
		}
	})

	readonly driverProp!: () => Router;

	/**
	 * Page load status
	 */
	@system()
	status: number = 0;

	/**
	 * Driver for remote router
	 */
	@system((o) => o.link((v) => v(o)))
	protected driver!: Router;

	/**
	 * Page store
	 */
	@system()
	protected pageStore?: PageInfo;

	/**
	 * Router paths
	 */
	@system({
		after: 'driver',
		init: (o) => o.link((v) => {
			const ctx: bRouter = <any>o;
			return $C(v || ctx.driver.routes || {}).map((obj, page) => {
				const
					isStr = Object.isString(obj),
					pattern = isStr ? obj : obj.path;

				return {
					page,
					pattern,
					rgxp: pattern != null ? path(pattern) : undefined,
					meta: isStr ? {} : obj
				};
			});
		})
	})

	protected pages!: Pages;

	/**
	 * Current page
	 */
	@p({cache: false})
	get page(): PageInfo | undefined {
		return this.getField('pageStore');
	}

	/**
	 * Scrolls a document to the specified coordinates
	 */
	scrollTo(y?: number, x?: number): void {
		window.scrollTo(x, y);
	}

	/**
	 * Pushes a new transition to router
	 *
	 * @param page
	 * @param [params] - additional transition parameters
	 */
	async push(page: string | null, params?: PageParams): Promise<void> {
		await this.setPage(page, params, 'push');
	}

	/**
	 * Replaces the current transition to a new
	 *
	 * @param page
	 * @param [params] - additional transition parameters
	 */
	async replace(page: string | null, params?: PageParams): Promise<void> {
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
	getPageOpts(page: string): PageInfo | undefined {
		const
			p = this.pages,
			obj = p[page] || $C(p).one.get(({rgxp}) => rgxp && rgxp.test(page));

		if (obj) {
			const meta = Object.create({
				meta: obj.meta || {},
				toPath(p?: Dictionary): string {
					if (p) {
						p = $C(p).filter((el) => el != null).map(String);
						return path.compile(obj.pattern || page)(p);
					}

					return page;
				}
			});

			// tslint:disable-next-line:prefer-object-spread
			const t = Object.assign(meta, {
				page: obj.page,
				params: {},
				query: {}
			});

			if (!p[page] && obj.pattern) {
				const
					params = obj.rgxp.exec(page);

				if (params) {
					$C(path.parse(obj.pattern) as any[]).reduce((map, el: Key, i) => {
						if (Object.isObject(el)) {
							// @ts-ignore
							t.params[el.name] = params[i];
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
	 * @emits beforeChange(page: (string|null), params?: Object, method: string)
	 * @emits change(info: Object)
	 * @emits $root.transition(info: Object)
	 */
	async setPage(
		page: string | null,
		params?: PageParams,
		method: SetPage = 'push'
	): Promise<PageInfo | undefined> {
		const
			{$root: r, driver: d, driver: {page: c}} = this,
			isEmptyParams = !params || $C(params).every((el) => !$C(el).length());

		if (!page && isEmptyParams && !this.isBeforeCreate()) {
			return;
		}

		this.emit('beforeChange', page, params, method);

		const info = page ?
			this.getPageOpts(d.id(page)) :
			c && Object.mixin(true, this.getPageOpts(c.page), Object.reject(c, 'page'));

		const scroll = {
			meta: {
				scroll: {
					x: pageXOffset,
					y: pageYOffset
				}
			}
		};

		if (c && method === 'push') {
			await d.replace(c.page, Object.mixin(true, undefined, c, scroll));
		}

		const
			isNotEvent = method !== 'event';

		if (!info) {
			if (isNotEvent) {
				await d[method](page, scroll);
			}

			return;
		}

		if (!info.page && c && c.page) {
			info.page = c.page;
		}

		Object.mixin({deep: true, withUndef: true}, info, params && Object.reject(params, 'page'));

		const nonWatchValues = {
			query: info.query,
			meta: info.meta
		};

		const store = Object.assign(
			Object.create(nonWatchValues),
			Object.reject(info, Object.keys(nonWatchValues))
		);

		const
			current = this.getField('pageStore'),
			f = (v) => $C(v).filter((el) => !Object.isFunction(el)).object(true).map();

		if (!Object.fastCompare(f(current), f(store))) {
			this.setField('pageStore', store);

			if (isNotEvent) {
				await d[method](info.toPath(params && params.params), info);
			}

			const
				f = (v) => $C(v).filter((el) => !Object.isFunction(el)).map();

			if (Object.fastCompare(f(current), f(store))) {
				const
					proto = Object.getPrototypeOf(r.pageInfo);

				$C(nonWatchValues).forEach((el, key) => {
					proto[key] = el;
				});

			} else {
				r.pageInfo = store;
			}
		}

		this.emit('change', store);
		r.emit('transition', store);

		const
			m = info.meta || {};

		if (m.scroll && m.autoScroll !== false) {
			await this.nextTick({label: $$.autoScroll});
			this.scrollTo(m.scroll.y, m.scroll.x);
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
				await this.replace(page.page, page);
			}

		} else {
			await this.replace(null);
		}
	}

	/**
	 * Handler: link trigger
	 * @param e
	 */
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
		this.async.on(document, 'click', delegate('[href]', this.onLink));
	}
}
