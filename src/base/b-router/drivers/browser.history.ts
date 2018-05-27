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
import { Router, PageInfo } from 'base/b-router/drivers/interface';

export const
	$$ = symbolGenerator();

export default function createRouter(ctx: bRouter): Router {
	const
		{async: $a} = ctx;

	function load(page: string, info?: PageInfo, method: string = 'pushState'): Promise<void> {
		return new Promise((resolve) => {
			if (info) {
				page = [page, toQueryString(info.query) || undefined].join('?');

				const done = () => {
					this.page = page;
					resolve();
				};

				if (Object.isArray(ModuleDependencies.get(info.page))) {
					done();
					return;
				}

				if (location.href !== page) {
					history[method](info, info.page, page);
				}

				let i = 0;
				ModuleDependencies.event.on(`component.${info.page}.loading`, $a.proxy(
					({packages}) => {
						ctx.status = (++i * 100) / packages;
						(i === packages) && done();
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

	const router = Object.assign(Object.create(new EventEmitter()), {
		page: location.href,

		id(page: string): string {
			return new URL(page).pathname;
		},

		push(page: string, info?: PageInfo): Promise<void> {
			return load(page, info);
		},

		replace(page: string, info?: PageInfo): Promise<void> {
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

	$a.on(window, 'popstate', () => {
		router.emit('transition', {
			page: location.href,
			state: history.state
		});
	});

	return router;
}
