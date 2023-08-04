/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import test from 'tests/config/unit/test';

import { renderDummy } from 'components/super/i-block/event/test/helpers';

import type bDummy from 'components/dummies/b-dummy/b-dummy';

test.describe('<i-block> event API', () => {
	const componentName = 'b-dummy';

	test.beforeEach(async ({demoPage, page}) => {
		await demoPage.goto();
		await page.evaluate((componentName) => {
			globalThis.componentName = componentName;
		}, componentName);
	});

	test('the event passed to `emit` should be normalized to camelCase', async ({page}) => {
		const target = await renderDummy(page);

		const scan = await target.evaluate((ctx) => {
			const res: any[] = [];

			ctx.on('onFoo_bar', (...args) => {
				res.push(...args);
			});

			ctx.on('onFoo-bar', (...args) => {
				res.push(...args);
			});

			ctx.on('onFooBar', (...args) => {
				res.push(...args);
			});

			ctx.emit('foo bar', 1);

			return res;
		});

		test.expect(scan).toEqual([1, 1, 1]);
	});

	test('the `emit` method should fire 3 events', async ({page}) => {
		const target = await renderDummy(page);

		const scan = await target.evaluate((ctx) => {
			const res: any[] = [];

			ctx.on('foo', (ctx, ...args) => {
				res.push(['foo', (<bDummy>ctx).componentName, ...args]);
			});

			ctx.on('foo:component', (ctx, ...args) => {
				res.push(['foo:component', (<bDummy>ctx).componentName, ...args]);
			});

			ctx.on('onFoo', (...args) => {
				res.push(['onFoo', ...args]);
			});

			ctx.emit('foo', 1, {a: 1});

			return res;
		});

		test.expect(scan).toEqual([
			[
				'foo',
				componentName,
				1,
				{a: 1}
			],

			[
				'foo:component',
				componentName,
				1,
				{a: 1}
			],

			[
				'onFoo',
				1,
				{a: 1}
			]
		]);
	});

	test('should remove all event listeners when `off` is invoked without a handler', async ({page}) => {
		const target = await renderDummy(page);

		const scan = await target.evaluate((ctx) => {
			const res: any[] = [];

			ctx.on('foo', (ctx, ...args) => {
				res.push((<bDummy>ctx).componentName, ...args);
			});

			ctx.on('onFoo', (...args) => {
				res.push(...args);
			});

			ctx.off('onFoo');

			ctx.off('foo', () => {
				// Loopback
			});

			ctx.emit('foo', 1, {a: 1});

			return res;
		});

		test.expect(scan).toEqual([componentName, 1, {a: 1}]);
	});

	test('matching event listeners should be removed via `async.off`', async ({page}) => {
		const target = await renderDummy(page);

		const scan = await target.evaluate((ctx) => {
			const res: any[] = [];

			ctx.on('foo', (ctx, ...args) => {
				res.push((<bDummy>ctx).componentName, ...args);
			});

			ctx.on('onFoo', (...args) => {
				res.push(...args);
			}, {group: 'bar'});

			ctx.unsafe.async.off({group: 'bar'});
			ctx.emit('foo', 1, {a: 1});

			return res;
		});

		test.expect(scan).toEqual([componentName, 1, {a: 1}]);
	});

	test('the listener should be called once when it was set using `once` method', async ({page}) => {
		const target = await renderDummy(page);

		const scan = await target.evaluate((ctx) => {
			const res: any[] = [];

			ctx.on('foo', (ctx, ...args) => {
				res.push((<bDummy>ctx).componentName, ...args);
			});

			ctx.once('onFoo', (...args) => {
				res.push(...args);
			});

			ctx.emit('foo', 1, {a: 1});
			ctx.emit('foo', 2, {a: 2});

			return res;
		});

		test.expect(scan).toEqual([
			componentName,
			1,
			{a: 1},

			1,
			{a: 1},

			componentName,
			2,
			{a: 2}
		]);
	});

	test('`promisifyOnce` should return a promise which resolves when the event is emitted', async ({page}) => {
		const target = await renderDummy(page);

		const scan = await target.evaluate((ctx) => {
			const res = ctx.promisifyOnce('onFoo');
			ctx.emit('foo', 1, {a: 1});

			return res;
		});

		test.expect(scan).toEqual(1);
	});

	test.describe('event dispatching', () => {
		test('should dispatch events on the `rootEmitter` prefixed with the component name', async ({page}) => {
			const target = await renderDummy(page, {
				dispatching: true
			});

			const scan = await target.evaluate((ctx) => {
				const res: any[] = [];

				ctx.on('onFoo', (...args) => {
					res.push(...args);
				});

				ctx.unsafe.rootEmitter.on(`${componentName}::foo`, (ctx, ...args) => {
					res.push((<bDummy>ctx).componentName, ...args);
				});

				ctx.unsafe.rootEmitter.on(`${componentName}::onFoo`, (...args) => {
					res.push(...args);
				});

				ctx.emit('foo', 1, {a: 1});

				return res;
			});

			test.expect(scan).toEqual([1, {a: 1}, componentName, 1, {a: 1}, 1, {a: 1}]);
		});

		test('should dispatch events on the `rootEmitter` prefixed with the specified `globalName`', async ({page}) => {
			const globalName = 'baz';

			const target = await renderDummy(page, {
				dispatching: true,
				globalName
			});

			const scan = await target.evaluate((ctx, globalName) => {
				const res: any[] = [];

				ctx.on('onFoo', (...args) => {
					res.push(...args);
				});

				ctx.unsafe.rootEmitter.on(`${componentName}::foo`, (ctx, ...args) => {
					res.push((<bDummy>ctx).componentName, ...args);
				});

				ctx.unsafe.rootEmitter.on(`${componentName}::onFoo`, (...args) => {
					res.push(...args);
				});

				ctx.unsafe.rootEmitter.on(`${globalName}::foo`, (ctx, ...args) => {
					res.push((<bDummy>ctx).componentName, ...args);
				});

				ctx.unsafe.rootEmitter.on(`${globalName}::onFoo`, (...args) => {
					res.push(...args);
				});

				ctx.emit('foo', 1, {a: 1});

				return res;
			}, globalName);

			test.expect(scan).toEqual([
				1,
				{a: 1},

				componentName,
				1,
				{a: 1},

				1,
				{a: 1},

				componentName,
				1,
				{a: 1},

				1,
				{a: 1}
			]);
		});

		test([
			'should dispatch events on the `rootEmitter` without any prefixes',
			'when the root component has `selfDispatching = true`'
		].join(' '), async ({page}) => {
			const target = await renderDummy(page, {
				dispatching: true
			});

			const scan = await target.evaluate((ctx) => {
				const res: any[] = [];

				Object.set(ctx.r, 'selfDispatching', true);

				ctx.on('onFoo', (...args) => {
					res.push(...args);
				});

				ctx.unsafe.rootEmitter.on('foo', (ctx, ...args) => {
					res.push((<bDummy>ctx).componentName, ...args);
				});

				ctx.unsafe.rootEmitter.on('onFoo', (...args) => {
					res.push(...args);
				});

				ctx.emit('foo', 1, {a: 1});
				Object.set(ctx.r, 'selfDispatching', false);

				return res;
			});

			test.expect(scan).toEqual([1, {a: 1}, componentName, 1, {a: 1}, 1, {a: 1}]);
		});

		test(
			[
				'shouldn\'t dispatch hook events on the `rootEmitter`',
				'when the root component has `selfDispatching = true`'
			].join(' '),

			async ({page}) => {
				const target = await renderDummy(page, {
					dispatching: true
				});

				const scan = await target.evaluate((ctx) => {
					const res: any[] = [];

					Object.set(ctx.r, 'selfDispatching', true);

					ctx.on('onHook:beforeDestroy', (...args) => {
						res.push(...args);
					});

					ctx.on('onComponentStatus:destroyed', (...args) => {
						res.push(...args);
					});

					ctx.unsafe.rootEmitter.on('onHook:beforeDestroy', (ctx, ...args) => {
						res.push((<bDummy>ctx).componentName, ...args);
					});

					ctx.unsafe.rootEmitter.on('onComponentStatus:destroyed', (ctx, ...args) => {
						res.push((<bDummy>ctx).componentName, ...args);
					});

					ctx.unsafe.$destroy();
					Object.set(ctx.r, 'selfDispatching', false);

					return res;
				});

				test.expect(scan).toEqual(['beforeDestroy', 'mounted', 'destroyed', 'ready']);
			}
		);
	});
});
