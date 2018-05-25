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

export type TransitionPageInfo<
	T extends Dictionary = Dictionary,
	M extends Dictionary = Dictionary
	> = PageInfo<M> & {
	transition?: Dictionary;
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
		watch: 'initComponentValues',
		default: () => driver
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

		ctx.async.on(d, 'transition', (t) => ctx.setPage(t.name, t), {
			label: $$.transition
		});

		return d;
	}))

	protected driver!: Router;

	/**
	 * Page store
	 */
	@field()
	protected pageStore?: TransitionPageInfo;

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
	get page(): TransitionPageInfo | undefined {
		return this.pageStore;
	}

	/**
	 * Sets a new page
	 *
	 * @param page
	 * @param [params] - additional transition parameters
	 * @param [state] - state object
	 */
	async setPage(page: string, params?: Dictionary, state: Dictionary = this): Promise<TransitionPageInfo | undefined> {
		const
			name = this.driver.id(page),
			info = this.getPageOpts(name);

		if (info && params) {
			info.transition = params;
		}

		state.pageStore = Object.create({
			page: name,
			...info
		});

		await this.driver.load(page, info);
		this.r.pageInfo = state.pageStore;
		return info;
	}

	/**
	 * Returns an information object of the specified page
	 * @param [page]
	 */
	getPageOpts(page: string): PageInfo | undefined {
		let
			current: PageInfo | undefined;

		$C(this.pages).forEach((el, name, data, o) => {
			const transition = {
				name,
				meta: el.meta
			};

			if (el.page === page) {
				current = transition;
				return o.break;
			}

			const
				{rgxp} = el;

			if (rgxp && rgxp.test(page)) {
				const
					params = rgxp.exec(page);

				current = $C(path.parse(el.pattern) as any[]).to(transition).reduce((map, el: Key, i) => {
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
