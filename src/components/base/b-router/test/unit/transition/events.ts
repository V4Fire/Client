/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import test from 'tests/config/unit/test';

import type { Route } from 'core/router';

import { createInitRouter } from 'components/base/b-router/test/helpers';
import type { RouterTestResult } from 'components/base/b-router/test/interface';

test.describe('<b-router> transition events', () => {
	test.beforeEach(async ({demoPage}) => {
		await demoPage.goto();
	});

	test(
		'the `softChange` event should only be fired in transitions where only query parameters are changed',

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

				router.on('onSoftChange', (route: Route) => {
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

				await router.push('main', {query: {foo: 1}});
				res.queryChanges?.push(location.search);

				await router.push('main', {query: {bar: 2}});
				res.queryChanges?.push(location.search);

				await router.push('main', {query: {foo: null, bar: undefined}});
				res.queryChanges?.push(location.search);

				await router.push('main', {query: {bla: [1, 2]}});
				res.queryChanges?.push(location.search);

				await router.push('main', {query: {bla: [3]}});
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
		'the `hardChange` event should be fired only in those transitions where route IDs are changed',

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

				router.on('onHardChange', (route: Route) => {
					if (res.onHardChange != null) {
						res.onHardChange.push(Object.fastClone(route.query));

					} else {
						res.onHardChange = [
							['initial', Object.fastClone(ctx.route?.query)],
							Object.fastClone(route.query)
						];
					}
				});

				await router.push('main', {query: {foo: 1}});
				res.pathChanges?.push(getPath());

				await router.push('second', {query: {bar: 2}});
				await router.push('second', {query: {bar: 3}});
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
				pathChanges: ['/?foo=1', '/second?bar=4', '/'],
				onHardChange: [['initial', {}], {foo: 1}, {bar: 2}, {}]
			});
		}
	);

	test(
		'the `change` event should be emitted on any transition',

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

				router.on('onChange', (route: Route) => {
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

				await router.push('second', {query: {bar: 2}});
				res.pathChanges?.push(getPath());

				await router.push('second', {query: {bar: 3}});
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

				onChange: [
					['initial', {foo: 1}],
					{foo: 1},
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
			'the order of event triggering should be as follows: ',
			'`beforeChange`, `softChange/hardChange`, `change`, `transition`, `$root.transition`'
		].join(''),

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
					res: RouterTestResult = {};

				router.once('onBeforeChange', (route, {query}) => {
					res.onBeforeChange = [
						['initial', Object.fastClone(ctx.route!.query)],
						Object.fastClone(query)
					];

					query.bla = 1;
				});

				router.once('onHardChange', (route: Route) => {
					res.onHardChange = [
						['initial', Object.fastClone(ctx.route!.query)],
						Object.fastClone(route.query)
					];
				});

				router.once('onChange', (route: Route) => {
					res.onChange = [
						['initial', Object.fastClone(ctx.route!.query)],
						Object.fastClone(route.query)
					];
				});

				router.once('onTransition', (route: Route, type: string) => {
					res.onTransition = [
						['initial', Object.fastClone(ctx.route!.query)],
						[type, Object.fastClone(route.query)]
					];
				});

				ctx.unsafe.rootEmitter.once('onTransition', (route: Route) => {
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
