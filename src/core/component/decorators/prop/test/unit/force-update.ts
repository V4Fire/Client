/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { JSHandle, Page } from '@playwright/test';
import test from 'tests/config/unit/test';

import { Component } from 'tests/helpers';

import type { WatchHandlerParams } from 'components/super/i-block/i-block';

import type bEffectPropWrapperDummy from 'core/component/decorators/prop/test/b-effect-prop-wrapper-dummy/b-effect-prop-wrapper-dummy';

test.describe('contracts for props effects', () => {
	test.beforeEach(async ({demoPage}) => {
		await demoPage.goto();
	});

	test.describe('pros with the `forceUpdate: false` flag', () => {
		let target: JSHandle<bEffectPropWrapperDummy>;

		test.beforeEach(async ({page}) => {
			target = await Component.createComponent(page, 'b-effect-prop-wrapper-dummy', {
				stage: 'without effect'
			});
		});

		test('should support `validator` and `default` options', async () => {
			const res = target.evaluate((ctx) =>
				ctx.child.propWithDefault);

			await test.expect(res).resolves.toBe(42);
		});

		test.describe('an accessor error', () => {
			test.beforeEach(async ({consoleTracker}) => {
				await consoleTracker.setMessageFilters({
					'No accessors are defined for the prop "dataProp".': (msg) => msg.args()[3].evaluate((err) => err.message)
				});
			});

			test('should be thrown if the value is not an accessor', async ({consoleTracker}) => {
				await target.evaluate((ctx) => {
					const vnode = ctx.vdom.create('b-non-effect-prop-dummy', {attrs: {dataProp: {a: 1}}});
					ctx.vdom.render(vnode);
				});

				await test.expect(consoleTracker.getMessages()).resolves.toHaveLength(1);
			});

			test('should not be thrown if the value is `undefined`', async ({consoleTracker}) => {
				await target.evaluate((ctx) => {
					const vnode = ctx.vdom.create('b-non-effect-prop-dummy', {attrs: {dataProp: undefined}});
					ctx.vdom.render(vnode);
				});

				await test.expect(consoleTracker.getMessages()).resolves.toHaveLength(0);
			});
		});
	});

	test.describe('changing the value of the prop with `forceUpdate: false`', () => {
		test.describe('for a non-functional component', () => {
			test.describe('passing data as a regular prop', () => {
				test('should not cause the re-rendering of its template', ({page}) =>
					shouldNotReRender('without effect', page));

				test('prop monitoring should work correctly', ({page}) =>
					testWatchers('without effect', page));
			});

			test.describe('passing data using `v-attrs`', () => {
				test('should not cause the re-rendering of its template', ({page}) =>
					shouldNotReRender('v-attrs without effect', page));

				test('prop monitoring should work correctly', ({page}) =>
					testWatchers('v-attrs without effect', page));
			});

			test.describe('using `component :is`', () => {
				test('should not cause the re-rendering of its template', ({page}) =>
					shouldNotReRender('component :is without effect', page));

				test('prop monitoring should work correctly', ({page}) =>
					testWatchers('component :is without effect', page));
			});

			async function shouldNotReRender(stage: string, page: Page) {
				const target = await Component.createComponent<bEffectPropWrapperDummy>(page, 'b-effect-prop-wrapper-dummy', {
					stage
				});

				await test.expect(
					target.evaluate((ctx) => ctx.child.isFunctional)
				).resolves.toBe(false);

				const text = await page.getByText('Content');
				await test.expect(text).toHaveText('Content: {}');

				await target.evaluate((ctx) => ctx.someField = {a: 1});
				await test.expect(text).toHaveText('Content: {}');

				await target.evaluate((ctx) => ctx.someField.a!++);
				await test.expect(text).toHaveText('Content: {}');

				await test.expect(
					target.evaluate((ctx) => ctx.child.$renderCounter)
				).resolves.toBe(1);
			}
		});

		test.describe('for a functional component', () => {
			test.describe('passing data as a regular prop', () => {
				test('should trigger the re-rendering of its template', ({page}) =>
					shouldReRender('functional without effect', true, page));
			});

			test.describe('passing data using `v-attrs`', () => {
				test('should trigger the re-rendering of its template', ({page}) =>
					shouldReRender('functional v-attrs without effect', true, page));
			});
		});

		test.describe('for a dynamic component with `v-attrs`', () => {
			test('`request` prop changes should trigger an `initLoad` call', async ({page}) => {
				const target = await Component.createComponent<bEffectPropWrapperDummy>(page, 'b-effect-prop-wrapper-dummy', {
					stage: 'component :is with v-attrs'
				});

				await target.evaluate(({unsafe: ctx}) => {
					const originalInitLoad = ctx.child.initLoad.bind(ctx);

					ctx.child.initLoad = (...args) => {
						originalInitLoad(...args);
						ctx.tmp.isExecuted = true;
					};

					ctx.requestField.get.chunkSize = 20;
				});

				await test.expect(target.evaluate(({unsafe: ctx}) => ctx.tmp.isExecuted))
					.resolves.toBe(true);
			});
		});
	});

	test.describe('changing the value of the prop without `forceUpdate: false`', () => {
		test.describe('for a non-functional component', () => {
			test.describe('passing data as a regular prop', () => {
				test('should trigger the re-rendering of its template', ({page}) =>
					shouldReRender('with effect', false, page));

				test('prop monitoring should work correctly', ({page}) =>
					testWatchers('with effect', page));
			});

			test.describe('passing data using `v-attrs`', () => {
				test('should trigger the re-rendering of its template', ({page}) =>
					shouldReRender('v-attrs with effect', false, page));

				test('prop monitoring should work correctly', ({page}) =>
					testWatchers('v-attrs with effect', page));
			});
		});
	});

	async function shouldReRender(stage: string, functional: boolean, page: Page) {
		const target = await Component.createComponent<bEffectPropWrapperDummy>(page, 'b-effect-prop-wrapper-dummy', {
			stage
		});

		const text = await page.getByText('Content');

		await test.expect(
			target.evaluate((ctx) => ctx.child.isFunctional)
		).resolves.toBe(functional);

		await test.expect(text).toHaveText('Content: {}');

		await target.evaluate((ctx) => ctx.someField = {a: 1});
		await test.expect(text).toHaveText('Content: {"a":1}');

		await target.evaluate((ctx) => ctx.someField.a!++);
		await test.expect(text).toHaveText('Content: {"a":2}');
	}

	async function testWatchers(stage: string, page: Page) {
		const target = await Component.createComponent<bEffectPropWrapperDummy>(page, 'b-effect-prop-wrapper-dummy', {
			stage
		});

		await test.expect(
			target.evaluate((ctx) => ctx.child.isFunctional)
		).resolves.toBe(false);

		await target.evaluate((ctx) => {
			const child = ctx.child.unsafe;

			type Log = Array<[unknown, unknown, CanUndef<unknown[]>]>;

			const
				data: Log = [],
				dataProp: Log = [],
				dataGetter: Log = [];

			ctx.unsafe.tmp.data = data;
			ctx.unsafe.tmp.dataProp = dataProp;
			ctx.unsafe.tmp.dataGetter = dataGetter;

			child.watch('data', {deep: true, flush: 'sync'}, (val: unknown, old: unknown, i?: WatchHandlerParams) => {
				data.push([val, old, i!.path]);
			});

			child.watch('dataProp', {deep: true, flush: 'sync'}, (val: unknown, old: unknown, i?: WatchHandlerParams) => {
				dataProp.push([Object.fastClone(val), old, i!.path]);
			});

			child.watch('dataGetter', {deep: true, flush: 'sync'}, (val: unknown, old: unknown, i?: WatchHandlerParams) => {
				dataGetter.push([val, old, i?.path]);
			});
		});

		await target.evaluate(async (ctx) => {
			ctx.someField = {a: 1};
			ctx.someField.a!++;

			await ctx.nextTick();

			ctx.someField.a!++;
		});

		await test.expect(target.evaluate((ctx) => ctx.unsafe.tmp))
			.resolves.toEqual({
				data: [
					[{a: 2}, {}, ['data']],
					[{a: 3}, {a: 2}, ['data']]
				],

				dataProp: [
					[{a: 2}, {}, ['dataProp']],
					[{a: 3}, {a: 2}, ['dataProp']]
				],

				dataGetter: [
					[{a: 2}, undefined, ['dataGetter']],
					[{a: 3}, {a: 2}, ['dataGetter']]
				]
			});
	}
});
