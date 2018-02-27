/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import $C = require('collection.js');
import URI = require('urijs');
import path = require('path-to-regexp');
import { Key } from 'path-to-regexp';

import symbolGenerator from 'core/symbol';
import iData, { component, prop, field } from 'super/i-data/i-data';
import { delegate } from 'core/dom';

export * from 'super/i-data/i-data';
export type PageInfo = Dictionary<string> & {page: string};
export type Pages = Dictionary<{
	page: string;
	pattern: string;
	rgxp: RegExp;
}>;

export const
	$$ = symbolGenerator();

@component()
export default class bRouter extends iData {
	/**
	 * Initial page
	 */
	@prop({type: String, default: () => location.href})
	readonly pageProp!: string;

	/**
	 * Initial router paths
	 */
	@prop(Object)
	readonly pagesProp!: Dictionary<string>;

	/**
	 * Page store
	 */
	@field(String)
	protected pageStore!: string;

	/**
	 * Page load status
	 */
	@field()
	protected status: number = 0;

	/**
	 * Router paths
	 */
	@field((o) => o.link('pagesProp', (val) => $C(val).map((pattern, page) => ({
		page,
		pattern,
		rgxp: path(pattern)
	}))))

	protected pages!: Pages;

	/**
	 * Returns current page
	 */
	page(): string;

	/**
	 * Sets a new page
	 * @param url
	 */
	page(url: string): Promise<PageInfo>;
	page(url?: string): Promise<PageInfo> | string {
		if (!url) {
			return this.pageStore;
		}

		const
			name = new URI(url).pathname();

		return new Promise((resolve) => {
			this.pageStore = name;

			const
				info = this.getPageOpts(name);

			if (info) {
				if (location.href !== url) {
					history.pushState(info, info.page, url);
				}

				let i = 0;
				ModuleDependencies.event.on(`component.${info.page}.loading`, this.async.proxy(
					({packages}) => {
						this.status = (++i * 100) / packages;
						if (i === packages) {
							this.$root.pageInfo = info;
							resolve(info);
						}
					},

					{
						label: $$.component,
						single: false
					}
				));

				if (Object.isArray(ModuleDependencies.get(info.page))) {
					this.$root.pageInfo = info;
					resolve(info);
				}

			} else {
				location.href = url;
			}
		});
	}

	/**
	 * Returns an information object of a page by the specified URL
	 * @param [url]
	 */
	getPageOpts(url: string = location.pathname): PageInfo | null {
		let current = null;
		$C(this.pages).forEach(({pattern, rgxp}, page, data, o) => {
			if (rgxp.test(url)) {
				const
					res = rgxp.exec(url);

				current = $C(path.parse(pattern) as any[]).to({page}).reduce((map, el: Key, i) => {
					if (Object.isObject(el)) {
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
	 * Handler: link trigger
	 * @param e
	 */
	protected async onLink(e: MouseEvent): Promise<void> {
		e.preventDefault();

		const
			{href} = <HTMLAnchorElement>e.delegateTarget;

		if (e.ctrlKey) {
			window.open(href, '_blank');

		} else {
			await this.page(href);
		}
	}

	/**
	 * Handler: popstate
	 */
	protected async onPopState(): Promise<void> {
		await this.page(location.href);
	}

	/** @override */
	protected async created(): Promise<void> {
		super.created();
		this.async.on(document, 'click', delegate('a[href^="/"]', this.onLink));
		this.async.on(window, 'popstate', this.onPopState);
		await this.page(this.pageProp);
	}
}
