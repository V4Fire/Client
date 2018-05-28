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

import { Router, PageSchema, PageInfo } from 'base/b-router/drivers/interface';
import iData, { component, prop, field, system, hook } from 'super/i-data/i-data';

export * from 'super/i-data/i-data';
export * from 'base/b-router/drivers/interface';

export type PageProp<T extends Dictionary = Dictionary> = string | {
	page: string;
	transition?: T;
};

export interface PageParams extends Dictionary {
	params?: Dictionary;
	query?: Dictionary;
}

export type Pages<M extends Dictionary = Dictionary> = Dictionary<{
	page: string;
	pattern: string;
	rgxp: RegExp;
	meta: M;
}>;

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
		watch: (o) => (<any>o).initComponentValues()
	})

	readonly pageProp?: PageProp;

	/**
	 * Initial router paths
	 */
	@prop(Object)
	readonly pagesProp: Dictionary<PageSchema> = {};

	/**
	 * Driver constructor for router
	 */
	@prop({
		type: Function,
		watch: (o) => (<any>o).initComponentValues(),
		default: driver
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
	@system((o) => o.link('driverProp', (v) => v(o)))
	protected driver!: Router;

	/**
	 * Page store
	 */
	@field()
	protected pageStore?: PageInfo;

	/**
	 * Router paths
	 */
	@system({
		after: 'driver',
		init: (o) => o.link('pagesProp', (v) =>
			$C(v || this.driver.routes).map((obj, page) => {
				const
					isStr = Object.isString(obj),
					pattern = isStr ? obj : obj.path;

				return {
					page,
					pattern,
					rgxp: pattern != null ? path(pattern) : undefined,
					meta: isStr ? {} : obj
				};
			})
		)
	})

	protected pages!: Pages;

	/**
	 * Current page
	 */
	get page(): PageInfo | undefined {
		return this.pageStore;
	}

	/**
	 * Pushes a new transition to router
	 *
	 * @param page
	 * @param [params] - additional transition parameters
	 * @param [state] - state object
	 */
	async push(page: string | null, params?: PageParams, state: Dictionary = this): Promise<void> {
		await this.setPage(page, params, 'push', state);
	}

	/**
	 * Replaces the current transition to a new
	 *
	 * @param page
	 * @param [params] - additional transition parameters
	 * @param [state] - state object
	 */
	async replace(page: string | null, params?: PageParams, state: Dictionary = this): Promise<void> {
		await this.setPage(page, params, 'replace', state);
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

			if (obj.pattern) {
				const
					params = obj.rgxp.exec(page);

				$C(path.parse(obj.pattern) as any[]).reduce((map, el: Key, i) => {
					if (Object.isObject(el)) {
						// @ts-ignore
						t.params[el.name] = params[i];
					}
				});
			}

			return t;
		}
	}

	/**
	 * Initializes component values
	 * @param [data] - data object
	 */
	@hook('beforeDataCreate')
	protected async initComponentValues(data: Dictionary = this): Promise<void> {
		const
			page = this.pageProp || this.driver.page;

		if (page) {
			if (Object.isString(page)) {
				await this.replace(page, undefined, data);

			} else {
				await this.replace(page.page, page.transition, data);
			}
		}
	}

	/**
	 * Sets a new page
	 *
	 * @param page
	 * @param [params] - additional page parameters
	 * @param [method] - driver method
	 * @param [state] - state object
	 */
	protected async setPage(
		page: string | null,
		params?: PageParams,
		method: string = 'push',
		state: Dictionary = this
	): Promise<PageInfo | undefined> {
		const d = this.driver;
		page = page || d.page;

		const
			info = this.getPageOpts(d.id(page));

		if (!info) {
			await d[method](page);
			return;
		}

		const
			t = <PageInfo>Object.mixin(true, info, params);

		if (!Object.fastCompare(state.pageStore, t)) {
			state.pageStore = t;
			await d[method](t.toPath(params && params.params), t);
			this.$root.pageInfo = t;
		}

		return t;
	}

	/**
	 * Handler: link trigger
	 * @param e
	 */
	protected async onLink(e: MouseEvent): Promise<void> {
		const
			a = <HTMLElement>e.delegateTarget,
			href = a.getAttribute('href');

		if (!href || /^(.*?:)?\/\//.test(href)) {
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
					await this[method === 'replace' ? 'replace' : 'push'](l.href, {
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
		this.$root.router = this;
		this.async.on(document, 'click', delegate('[href]', this.onLink));
	}
}
