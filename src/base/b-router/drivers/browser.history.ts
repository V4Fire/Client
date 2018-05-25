/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import symbolGenerator from 'core/symbol';
import bRouter from 'base/b-router/b-router';

import { EventEmitter2 as EventEmitter } from 'eventemitter2';
import { Router, PageInfo } from 'base/b-router/drivers/interface';

export const
	$$ = symbolGenerator();

export default function createRouter(ctx: bRouter): Router {
	const
		{async: $a} = ctx;

	const router = Object.assign(Object.create(new EventEmitter()), {
		page: location.href,

		id(page: string): string {
			return new URL(page).pathname;
		},

		load(page: string, info?: PageInfo): Promise<void> {
			return new Promise((resolve) => {
				if (info) {
					const done = () => {
						this.page = page;
						resolve();
					};

					if (Object.isArray(ModuleDependencies.get(info.name))) {
						done();
						return;
					}

					if (location.href !== page) {
						history.pushState(info, info.name, page);
					}

					let i = 0;
					ModuleDependencies.event.on(`component.${info.name}.loading`, $a.proxy(
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
	});

	$a.on(window, 'popstate', () => {
		router.emit('transition', {
			name: location.href,
			...history.state
		});
	});

	return router;
}
