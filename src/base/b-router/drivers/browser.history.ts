/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import symbolGenerator from 'core/symbol';
import bRouter from 'base/b-router/b-router';

import { toQueryString } from 'core/url';
import { EventEmitter2 as EventEmitter } from 'eventemitter2';
import { Router, PageOpts, CurrentPage } from 'base/b-router/drivers/interface';

export const
	$$ = symbolGenerator();

export default function createRouter(ctx: bRouter): Router {
	const
		{async: $a} = ctx;

	function load(page: string, info?: PageOpts, method: string = 'pushState'): Promise<void> {
		if (!page) {
			throw new Error('Page to load is not defined');
		}

		return new Promise((resolve) => {
			if (info) {
				const
					qs = /\?.*/;

				const parse = (s, test?) => {
					if (test && !qs.test(s)) {
						return {};
					}

					return Object.fromQueryString(s, {deep: true});
				};

				info.query = Object.assign(parse(page, true), info.query);
				page = page.replace(qs, '');

				const
					q = toQueryString(info.query);

				if (q) {
					page += `?${q}`;
				}

				if (location.href !== page) {
					history[method](info, info.page, page);
				}

				if (Object.isArray(ModuleDependencies.get(info.page))) {
					resolve();
					return;
				}

				let i = 0;
				ModuleDependencies.event.on(`component.${info.page}.loading`, $a.proxy(
					({packages}) => {
						ctx.setField('status', (++i * 100) / packages);
						(i === packages) && resolve();
					},

					{
						label: $$.component,
						single: false
					}
				));

			} else {
				location.href = page;
			}
		});
	}

	const router = Object.mixin({withAccessors: true}, Object.create(new EventEmitter()), {
		get page(): CurrentPage | undefined {
			const
				url = this.id(location.href);

			return {
				page: url,
				query: Object.fromQueryString(location.search, {deep: true}),
				...history.state,
				url
			};
		},

		id(page: string): string {
			try {
				return new URL(page).pathname;

			} catch (_) {
				return page;
			}
		},

		push(page: string, info?: PageOpts): Promise<void> {
			return load(page, info);
		},

		replace(page: string, info?: PageOpts): Promise<void> {
			return load(page, info, 'replaceState');
		},

		back(): void {
			history.back();
		},

		forward(): void {
			history.forward();
		},

		go(pos: number): void {
			history.go(pos);
		}
	});

	$a.on(window, 'popstate', async () => {
		await ctx.setPage(location.href, history.state, 'event');

	}, {
		label: $$.popstate
	});

	return router;
}
