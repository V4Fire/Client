/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/* eslint-disable max-lines-per-function */

import test from 'tests/config/unit/test';

import type {

	EngineRoute,
	TransitionOptions,
	TransitionMethod

} from 'components/base/b-router/b-router';

import { createInitRouter } from 'components/base/b-router/test/helpers';
import type { RouterTestResult } from 'components/base/b-router/test/interface';

test.describe('<b-router> standard transition events', () => {
	test.beforeEach(async ({demoPage}) => {
		await demoPage.goto();
	});

	test(
		'the `beforeChange` event should be fired before any transition occurs',

		async ({page}) => {
			const root = await createInitRouter('history', {
				main: {
					path: '/'
				},

				second: {
					path: '/second'
				}
			})(page);

			const log = await root.evaluate(async (ctx) => {
				const
					router = ctx.router!,
					res: RouterTestResult = {onBeforeChange: []};

				router.on('onBeforeChange', (ref: Nullable<string>, opts: TransitionOptions, method: TransitionMethod) => {
					res.onBeforeChange?.push([ref, Object.fastClone(opts.query), method]);
				});

				await router.push('main');
				await router.replace('main', {query: {foo: 1}});
				await router.replace('main', {query: {bar: 2}});
				await router.push('second');

				return res;
			});

			test.expect(log).toEqual({
				onBeforeChange: [
					['main', {}, 'push'],
					['main', {foo: 1}, 'replace'],
					['main', {bar: 2}, 'replace'],
					['second', {}, 'push']
				]
			});
		}
	);

	test(
		'changes made to the route parameters during handling of the `beforeChange` event should affect the transition',

		async ({page}) => {
			const root = await createInitRouter('history', {
				main: {
					path: '/'
				},

				second: {
					path: '/second'
				}
			})(page);

			const log = await root.evaluate(async (ctx) => {
				const
					router = ctx.router!;

				router.on('onBeforeChange', (ref: Nullable<string>, opts: TransitionOptions) => {
					opts.query = {...opts.query, utm: 'portal'};
				});

				await router.push('main');
				return location.search;
			});

			test.expect(log).toBe('?utm=portal');
		}
	);

	test(
		'the `softChange` event should be fired only in those transitions where the query parameters have been changed',

		async ({page}) => {
			const root = await createInitRouter('history', {
				main: {
					path: '/'
				},

				second: {
					path: '/second'
				}
			})(page);

			const log = await root.evaluate(async (ctx) => {
				const
					router = ctx.router!,
					res: RouterTestResult = {queryChanges: []};

				router.on('onSoftChange', (route: EngineRoute) => {
					if (res.onSoftChange != null) {
						res.onSoftChange.push(Object.fastClone(route.query));

					} else {
						res.onSoftChange = [
							['initial', Object.fastClone(ctx.route?.query)],
							Object.fastClone(route.query)
						];
					}
				});

				await router.push('main');

				await router.push(null, {query: {foo: 1}});
				await router.push(null, {query: {foo: 1}});
				await router.push(null, {query: {foo: 1}});
				await router.push(null, {query: {foo: 1}});
				res.queryChanges?.push(location.search);

				await router.push(null, {query: {bar: 2}});
				res.queryChanges?.push(location.search);

				await router.replace(null, {query: {foo: null, bar: undefined}});
				res.queryChanges?.push(location.search);

				await router.replace(null, {query: {bla: [1, 2]}});
				res.queryChanges?.push(location.search);

				await router.push(null, {query: {bla: [3]}});
				res.queryChanges?.push(location.search);

				await router.push('second');
				return res;
			});

			test.expect(log).toEqual({
				queryChanges: [
					'?foo=1',
					'?bar=2&foo=1',
					'?bar=2',
					'?bar=2&bla=1&bla=2',
					'?bar=2&bla=3'
				],

				onSoftChange: [
					['initial', {}],
					{foo: 1},
					{foo: 1, bar: 2},
					{foo: null, bar: 2},
					{foo: null, bar: 2, bla: [1, 2]},
					{foo: null, bar: 2, bla: [3]}
				]
			});
		}
	);

	test(
		'the `softChange` event should fire when navigating through history',

		async ({page}) => {
			const root = await createInitRouter('history', {
				main: {
					path: '/'
				},

				second: {
					path: '/second'
				}
			})(page);

			const log = await root.evaluate(async (ctx) => {
				const
					router = ctx.router!;

				const res: RouterTestResult = {
					queryChanges: [],
					onSoftChange: []
				};

				router.on('onSoftChange', (route: EngineRoute) => {
					res.onSoftChange?.push(Object.fastClone(route.query));
				});

				await router.push('main');

				await router.push(null, {query: {foo: 1}});
				res.queryChanges?.push(location.search);

				await router.push(null, {query: {foo: 2}});
				res.queryChanges?.push(location.search);

				await router.push(null, {query: {foo: 3}});
				res.queryChanges?.push(location.search);

				await router.back();
				res.queryChanges?.push(location.search);

				await router.back();
				res.queryChanges?.push(location.search);

				await router.forward();
				res.queryChanges?.push(location.search);

				return res;
			});

			test.expect(log).toEqual({
				queryChanges: [
					'?foo=1',
					'?foo=2',
					'?foo=3',
					'?foo=2',
					'?foo=1',
					'?foo=2'
				],

				onSoftChange: [
					{foo: 1},
					{foo: 2},
					{foo: 3},
					{foo: 2},
					{foo: 1},
					{foo: 2}
				]
			});
		}
	);

	test(
		'the `hardChange` event should only be fired in those transitions where the route ID has changed',

		async ({page}) => {
			const root = await createInitRouter('history', {
				main: {
					path: '/'
				},

				second: {
					path: '/second'
				},

				third: {
					path: '/third'
				}
			})(page, {initialRoute: 'main'});

			const log = await root.evaluate(async (ctx) => {
				const
					router = ctx.router!,
					res: RouterTestResult = {pathChanges: []};

				router.on('onHardChange', (route: EngineRoute) => {
					if (res.onHardChange != null) {
						res.onHardChange.push(Object.fastClone(route.query));

					} else {
						res.onHardChange = [
							['initial', Object.fastClone(ctx.route?.query)],
							Object.fastClone(route.query)
						];
					}
				});

				await router.push('second', {query: {foo: 1}});
				res.pathChanges?.push(getPath());

				await router.push('third', {query: {bar: 2}});
				await router.push(null, {query: {bar: 3}});
				await router.push(null, {query: {bar: 4}});
				res.pathChanges?.push(getPath());

				await router.push('main');
				res.pathChanges?.push(getPath());

				return res;

				function getPath() {
					return location.pathname + location.search;
				}
			});

			test.expect(log).toEqual({
				pathChanges: ['/second?foo=1', '/third?bar=4', '/'],
				onHardChange: [['initial', {}], {foo: 1}, {bar: 2}, {}]
			});
		}
	);

	test(
		'the `hardChange` event should fire when navigating through history',

		async ({page}) => {
			const root = await createInitRouter('history', {
				main: {
					path: '/'
				},

				second: {
					path: '/second'
				}
			})(page);

			const log = await root.evaluate(async (ctx) => {
				const
					router = ctx.router!;

				const res: RouterTestResult = {
					pathChanges: [],
					onHardChange: []
				};

				router.on('onHardChange', (route: EngineRoute) => {
					res.onHardChange?.push(Object.fastClone(route.query));
				});

				await router.push('second', {query: {foo: 1}});
				res.pathChanges?.push(getPath());

				await router.push('main', {query: {foo: 2}});
				res.pathChanges?.push(getPath());

				await router.push('second', {query: {foo: 3}});
				res.pathChanges?.push(getPath());

				await router.back();
				res.pathChanges?.push(getPath());

				await router.back();
				res.pathChanges?.push(getPath());

				await router.forward();
				res.pathChanges?.push(getPath());

				return res;

				function getPath() {
					return location.pathname + location.search;
				}
			});

			test.expect(log).toEqual({
				pathChanges: [
					'/second?foo=1',
					'/?foo=2',
					'/second?foo=3',
					'/?foo=2',
					'/second?foo=1',
					'/?foo=2'
				],

				onHardChange: [
					{foo: 1},
					{foo: 2},
					{foo: 3},
					{foo: 2},
					{foo: 1},
					{foo: 2}
				]
			});
		}
	);

	test(
		[
			'the `change` event should be fired whenever there is a transition that changes any parameters',
			'or when the history length changes'
		].join(' '),

		async ({page}) => {
			const root = await createInitRouter('history', {
				main: {
					path: '/'
				},

				second: {
					path: '/second'
				}
			})(page);

			const log = await root.evaluate(async (ctx) => {
				const
					router = ctx.router!,
					res: RouterTestResult = {pathChanges: []};

				router.on('onChange', (route: EngineRoute) => {
					if (res.onChange != null) {
						res.onChange.push(Object.fastClone(route.query));

					} else {
						res.onChange = [
							['initial', Object.fastClone(ctx.route?.query)],
							Object.fastClone(route.query)
						];
					}
				});

				await router.push('main', {query: {foo: 1}});
				res.pathChanges?.push(getPath());

				await router.replace('second', {query: {bar: 2}});
				res.pathChanges?.push(getPath());

				await router.replace('second', {query: {bar: 3}});
				res.pathChanges?.push(getPath());

				await router.push('second', {query: {bar: 4}});
				await router.push(null, {query: {bar: 4}});
				await router.replace(null, {query: {bar: 4}});
				await router.replace(null, {query: {bar: 4}});
				await router.replace(null, {query: {bar: 4}});
				res.pathChanges?.push(getPath());

				await router.push('main');
				res.pathChanges?.push(getPath());

				return res;

				function getPath() {
					return location.pathname + location.search;
				}
			});

			test.expect(log).toEqual({
				pathChanges: [
					'/?foo=1',
					'/second?bar=2',
					'/second?bar=3',
					'/second?bar=4',
					'/'
				],

				onChange: [
					['initial', {foo: 1}],
					{foo: 1},
					{bar: 2},
					{bar: 3},
					{bar: 4},
					{bar: 4},
					{}
				]
			});
		}
	);

	test(
		'the `change` event should fire when navigating through history',

		async ({page}) => {
			const root = await createInitRouter('history', {
				main: {
					path: '/'
				},

				second: {
					path: '/second'
				}
			})(page);

			const log = await root.evaluate(async (ctx) => {
				const
					router = ctx.router!;

				const res: RouterTestResult = {
					pathChanges: [],
					onChange: []
				};

				router.on('onChange', (route: EngineRoute) => {
					res.onChange?.push(Object.fastClone(route.query));
				});

				await router.push('main', {query: {foo: 1}});
				res.pathChanges?.push(getPath());

				await router.push('second', {query: {foo: 2}});
				res.pathChanges?.push(getPath());

				await router.push(null, {query: {bar: 3}});
				res.pathChanges?.push(getPath());

				await router.back();
				res.pathChanges?.push(getPath());

				await router.back();
				res.pathChanges?.push(getPath());

				return res;

				function getPath() {
					return location.pathname + location.search;
				}
			});

			test.expect(log).toEqual({
				pathChanges: [
					'/?foo=1',
					'/second?foo=2',
					'/second?bar=3&foo=2',
					'/second?foo=2',
					'/?foo=1'
				],

				onChange: [
					{foo: 1},
					{foo: 2},
					{foo: 2, bar: 3},
					{foo: 2},
					{foo: 1}
				]
			});
		}
	);

	test(
		'the `transition` event should be fired on any transition',

		async ({page}) => {
			const root = await createInitRouter('history', {
				main: {
					path: '/'
				},

				second: {
					path: '/second'
				}
			})(page);

			const log = await root.evaluate(async (ctx) => {
				const
					router = ctx.router!,
					res: RouterTestResult = {pathChanges: []};

				router.on('onTransition', (route: EngineRoute) => {
					if (res.onTransition != null) {
						res.onTransition.push(Object.fastClone(route.query));

					} else {
						res.onTransition = [
							['initial', Object.fastClone(ctx.route?.query)],
							Object.fastClone(route.query)
						];
					}
				});

				await router.push('main', {query: {foo: 1}});
				res.pathChanges?.push(getPath());

				await router.push('second', {query: {bar: 2}});
				await router.push('second', {query: {bar: 2}});
				await router.replace('second', {query: {bar: 2}});
				await router.replace('second', {query: {bar: 2}});
				await router.replace('second', {query: {bar: 2}});
				res.pathChanges?.push(getPath());

				await router.replace('second', {query: {bar: 3}});
				res.pathChanges?.push(getPath());

				await router.push('second', {query: {bar: 4}});
				res.pathChanges?.push(getPath());

				await router.push('main');
				res.pathChanges?.push(getPath());

				return res;

				function getPath() {
					return location.pathname + location.search;
				}
			});

			test.expect(log).toEqual({
				pathChanges: [
					'/?foo=1',
					'/second?bar=2',
					'/second?bar=3',
					'/second?bar=4',
					'/'
				],

				onTransition: [
					['initial', {foo: 1}],
					{foo: 1},
					{bar: 2},
					{bar: 2},
					{bar: 2},
					{bar: 2},
					{bar: 2},
					{bar: 3},
					{bar: 4},
					{}
				]
			});
		}
	);

	test(
		[
			'the order of triggering events should be as follows:',
			'`beforeChange`, `softChange/hardChange`, `change`, `transition`, `$root.transition`'
		].join(' '),

		async ({page}) => {
			const root = await createInitRouter('history', {
				main: {
					path: '/'
				},

				second: {
					path: '/second'
				}
			})(page, {initialRoute: 'main'});

			const log = await root.evaluate(async (ctx) => {
				const
					router = ctx.router!,
					res: RouterTestResult = {};

				router.once('onBeforeChange', (route, {query}) => {
					res.onBeforeChange = [
						['initial', Object.fastClone(ctx.route!.query)],
						Object.fastClone(query)
					];

					query.bla = 1;
				});

				router.once('onHardChange', (route: EngineRoute) => {
					res.onHardChange = [
						['initial', Object.fastClone(ctx.route!.query)],
						Object.fastClone(route.query)
					];
				});

				router.once('onChange', (route: EngineRoute) => {
					res.onChange = [
						['initial', Object.fastClone(ctx.route!.query)],
						Object.fastClone(route.query)
					];
				});

				router.once('onTransition', (route: EngineRoute, type: string) => {
					res.onTransition = [
						['initial', Object.fastClone(ctx.route!.query)],
						[type, Object.fastClone(route.query)]
					];
				});

				ctx.unsafe.rootEmitter.once('onTransition', (route: EngineRoute) => {
					res.onRootTransition = [
						['initial', Object.fastClone(ctx.route!.query)],
						Object.fastClone(route.query)
					];
				});

				await router.push('second', {query: {foo: 1}});
				res.queryChanges = [location.search];

				return res;
			});

			test.expect(log).toEqual({
				queryChanges: ['?bla=1&foo=1'],
				onBeforeChange: [['initial', {}], {foo: 1}],
				onHardChange: [['initial', {}], {foo: 1, bla: 1}],
				onChange: [['initial', {foo: 1, bla: 1}], {foo: 1, bla: 1}],
				onTransition: [['initial', {foo: 1, bla: 1}], ['hard', {foo: 1, bla: 1}]],
				onRootTransition: [['initial', {foo: 1, bla: 1}], {foo: 1, bla: 1}]
			});
		}
	);
});
