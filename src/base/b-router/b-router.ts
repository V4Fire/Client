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
import { EventEmitterLike } from 'core/async';

import symbolGenerator from 'core/symbol';
import iData, { component, prop, field, system, hook } from 'super/i-data/i-data';
import { delegate } from 'core/dom';
export * from 'super/i-data/i-data';

export type PageProp<T extends Dictionary = Dictionary> = string | {
	page: string;
	transition?: T;
};

export type PageSchema<M extends Dictionary = Dictionary> = string | M & {
	path: string;
};

export type PageInfo<M extends Dictionary = Dictionary> = Dictionary & {
	page: string;
	meta?: M;
};

export type TransitionPageInfo<
	T extends Dictionary = Dictionary,
	M extends Dictionary = Dictionary
> = Readonly<PageInfo<M> & {
	transition?: Dictionary;
}>;

export type Pages<M extends Dictionary = Dictionary> = Dictionary<{
	page: string;
	pattern: string;
	rgxp: RegExp;
	meta: M;
}>;

export interface RemoteRouter extends EventEmitterLike {
	page: PageProp | undefined;
	routes: Dictionary<PageSchema>;
}

export const
	$$ = symbolGenerator();

@component()
export default class bRouter<T extends Dictionary = Dictionary> extends iData<T> {
	/**
	 * Initial page
	 */
	@prop({
		type: [String, Object],
		watch: 'initComponentValues',
		default: () => location.href
	})

	readonly pageProp?: PageProp;

	/**
	 * Initial router paths
	 */
	@prop(Object)
	readonly pagesProp: Dictionary<PageSchema> = {};

	/**
	 * Driver constructor for remote router
	 */
	@prop({type: Function, watch: 'initComponentValues'})
	readonly driverProp?: () => RemoteRouter;

	/**
	 * Driver for remote router
	 */
	@system()
	protected driver?: RemoteRouter;

	/**
	 * Page store
	 */
	@field()
	protected pageStore?: TransitionPageInfo;

	/**
	 * Page load status
	 */
	@field()
	protected status: number = 0;

	/**
	 * Router paths
	 */
	@system()
	protected pages!: Pages;

	/**
	 * Returns current page
	 */
	page(): TransitionPageInfo | undefined;

	/**
	 * Sets a new page by the specified id
	 *
	 * @param id - page id: url or an abstract page id (if using remote router)
	 * @param [params] - additional transition parameters
	 */
	page(id: string, params?: Dictionary): TransitionPageInfo;
	page(id?: string, params?: Dictionary): CanPromise<TransitionPageInfo> | undefined {
		if (!id) {
			return this.pageStore;
		}

		const
			d = this.driver,
			name = d ? id : new URL(id).pathname;

		return new Promise((resolve) => {
			const
				info = this.getPageOpts(name);

			if (info && params) {
				info.transition = params;
			}

			this.pageStore = Object.freeze({
				page: name,
				...info
			});

			const done = () => {
				this.$root.pageInfo = this.pageStore;
				resolve(this.pageStore);
			};

			if (d) {
				done();
				return;
			}

			if (info) {
				if (location.href !== id) {
					history.pushState(info, info.page, id);
				}

				let i = 0;
				ModuleDependencies.event.on(`component.${info.page}.loading`, this.async.proxy(
					({packages}) => {
						this.status = (++i * 100) / packages;
						i === packages && done();
					},

					{
						label: $$.component,
						single: false
					}
				));

				if (Object.isArray(ModuleDependencies.get(info.page))) {
					done();
				}

			} else {
				location.href = id;
			}
		});
	}

	/**
	 * Returns an information object of a page by the specified id
	 * @param [id] - page id: url or an abstract page id (if using remote router)
	 */
	getPageOpts(id: string = location.pathname): PageInfo | undefined {
		let
			current: PageInfo | undefined;

		$C(this.pages).forEach((el, page, data, o) => {
			const
				r = el.rgxp,
				transition = {page, meta: el.meta};

			if (this.driver) {
				if (el.page === id) {
					current = transition;
				}

			} else if (r && r.test(id)) {
				const
					res = r.exec(id);

				current = $C(path.parse(el.pattern) as any[]).to(transition).reduce((map, el: Key, i) => {
					if (Object.isObject(el)) {
						// @ts-ignore
						map[el.name] = res[i];
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
	 */
	@hook('beforeDataCreate')
	protected async initComponentValues(): Promise<void> {
		const initPages = (val) => $C(val).map((obj: PageSchema, page) => {
			const
				isStr = Object.isString(obj),
				pattern = isStr ? obj : (<any>obj).path;

			return {
				page,
				pattern,
				rgxp: pattern != null ? path(pattern) : undefined,
				meta: isStr ? {} : obj
			};
		});

		const
			d = this.driverProp && this.driverProp(),
			flags = {label: $$.transition};

		let
			page = this.pageProp;

		if (d) {
			this.driver = d;
			this.pages = initPages(d.routes);
			page = d.page;

			const fn = (transition) => {
				this.page(transition.name, transition);
			};

			this.async.on(d, 'transition', fn, flags);

		} else {
			this.pages = initPages(this.pageProp);

			const fn = () => {
				this.page.bind(this, location.href, history.state);
			};

			this.async.on(window, 'popstate', fn, flags);
		}

		if (page) {
			if (Object.isString(page)) {
				await this.page(page);

			} else {
				await this.page(page.page, page.transition);
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
			await this.page(a.href, Object.parse(a.dataset.transition));
		}
	}

	/** @override */
	protected created(): void {
		super.created();
		this.async.on(document, 'click', delegate('a[href^="/"]', this.onLink));
	}
}
