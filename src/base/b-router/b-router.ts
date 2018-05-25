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

export type PageParams<
	P extends Dictionary = Dictionary,
	Q extends Dictionary = Dictionary
> = Dictionary & {
	params?: P;
	query?: Q;
};

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
	@system((o) => o.link('driverProp', (v) => {
		const
			ctx: bRouter = <any>o,
			d = v(o);

		const fn = (e) => ctx.setPage(e.page, {
			params: e.params,
			query: e.query
		});

		ctx.async.on(d, 'transition', fn, {
			label: $$.transition
		});

		return d;
	}))

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
	 * Sets a new page
	 *
	 * @param page
	 * @param [params] - additional transition parameters
	 * @param [state] - state object
	 */
	async setPage(page: string, params?: PageParams, state: Dictionary = this): Promise<PageInfo | undefined> {
		const
			name = this.driver.id(page),
			transition = <PageInfo>Object.mixin(true, {page: name, ...this.getPageOpts(name)}, params);

		if (!Object.fastCompare(state.pageStore, transition)) {
			state.pageStore = transition;
			await this.driver.load(page, transition);
			this.r.pageInfo = transition;
		}

		return transition;
	}

	/**
	 * Returns an information object of the specified page
	 * @param [page]
	 */
	getPageOpts(page: string): PageInfo | undefined {
		let
			current: PageInfo | undefined;

		$C(this.pages).forEach((el, name, data, o) => {
			const meta = Object.create({
				meta: el.meta || {}
			});

			// tslint:disable-next-line:prefer-object-spread
			const transition = Object.assign(meta, {
				page: name,
				params: {},
				query: {}
			});

			if (el.page === page) {
				current = transition;
				return o.break;
			}

			const
				{rgxp} = el;

			if (rgxp && rgxp.test(page)) {
				const
					params = rgxp.exec(page);

				current = $C(path.parse(el.pattern) as any[]).to(transition.params).reduce((map, el: Key, i) => {
					if (Object.isObject(el)) {
						// @ts-ignore
						map[el.name] = params[i];
					}

					return map;
				});

				return o.break;
			}
		});

		return current;
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
				await this.setPage(page, undefined, data);

			} else {
				await this.setPage(page.page, page.transition, data);
			}
		}
	}

	/**
	 * Handler: link trigger
	 * @param e
	 */
	protected async onLink(e: MouseEvent): Promise<void> {
		e.preventDefault();

		const
			a = <HTMLAnchorElement>e.delegateTarget;

		if (e.ctrlKey) {
			window.open(a.href, '_blank');

		} else {
			await this.setPage(a.href, Object.parse(a.dataset.transition));
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
		this.r.router = this;
		this.async.on(document, 'click', delegate('a[href^="/"]', this.onLink));
	}
}
