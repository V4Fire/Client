'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Store from 'core/store';
import iData from 'super/i-data/i-data';
import { field, params } from 'super/i-block/i-block';
import { component } from 'core/component';
import { delegate } from 'core/dom';

const
	$C = require('collection.js'),
	URI = require('urijs'),
	path = require('path-to-regexp');

export const
	$$ = new Store();

@component()
export default class bRouter extends iData {
	/**
	 * Initial page
	 */
	@params({default: () => location.href})
	pageProp: ?string;

	/**
	 * Initial router paths
	 */
	pagesProp: Object;

	/**
	 * Page store
	 */
	@field()
	pageStore: string;

	/**
	 * Page load status
	 */
	@field()
	status: number = 0;

	/**
	 * Router paths
	 */
	@field((o) => o.link('pagesProp', (val) => $C(val).map((pattern, page) => ({
		page,
		pattern,
		rgxp: path(pattern)
	}))))

	pages: Object;

	/**
	 * Sets a new page or returns current
	 * @param [url]
	 */
	page(url?: string): Promise | string {
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
	getPageOpts(url?: string = location.pathname): ?Object {
		let current = null;
		$C(this.pages).forEach(({pattern, rgxp}, page, data, o) => {
			if (rgxp.test(url)) {
				const
					res = rgxp.exec(url);

				let i = 0;
				current = $C(path.parse(pattern)).reduce((map, el) => {
					if (Object.isObject(el)) {
						map[el.name] = res[++i];
					}

					return map;

				}, {page});

				return o.break;
			}
		});

		return current;
	}

	/**
	 * Handler: link trigger
	 * @param e
	 */
	onLink(e: MouseEvent) {
		e.preventDefault();

		const
			{href} = e.delegateTarget;

		if (e.ctrlKey) {
			window.open(href, '_blank');

		} else {
			this.page(href);
		}
	}

	/**
	 * Handler: popstate
	 */
	onPopState() {
		this.page(location.href);
	}

	/** @inheritDoc */
	created() {
		this.page(this.pageProp);
		this.async.on(document, 'click', delegate('a[href^="/"]', this.onLink));
		this.async.on(window, 'popstate', this.onPopState);
	}
}
