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
import { VirtualScrollComponentObject } from 'components/base/b-virtual-scroll-new/test/api/component-object';

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
				ctx.unsafe.$refs.child!.propWithDefault);

			await test.expect(res).resolves.toBe(42);
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
					target.evaluate((ctx) => ctx.unsafe.$refs.child?.isFunctional)
				).resolves.toBe(false);

				const text = await page.getByText('Content');
				await test.expect(text).toHaveText('Content: {}');

				await target.evaluate((ctx) => ctx.someField = {a: 1});
				await test.expect(text).toHaveText('Content: {}');

				await target.evaluate((ctx) => ctx.someField.a!++);
				await test.expect(text).toHaveText('Content: {}');

				await test.expect(
					target.evaluate((ctx) => ctx.unsafe.$refs.child?.$renderCounter)
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

		test.describe('for a dynamic component with v-attrs', () => {
			test('request prop changes should trigger initLoad call', async ({page}) => {
				const target = await Component.createComponent<bEffectPropWrapperDummy>(page, 'b-effect-prop-wrapper-dummy', {
					stage: 'component :is with v-attrs'
				});

				await target.evaluate((ctx) => {
					ctx.testComponent = 'b-virtual-scroll-new';
					ctx.testComponentAttrs = {
						'@:request': ctx.unsafe.createPropAccessors(() => ({
							get: {
								chunkSize: 10
							}
						})),

						dataProvider: 'Provider'
					};
				});

				const virtualScroll = new VirtualScrollComponentObject(page);
				await virtualScroll.pick('.b-virtual-scroll-new');

				await virtualScroll.evaluate((ctx) => {
					const originalInitLoad = ctx.initLoad.bind(ctx);

					ctx.initLoad = (...args) => {
						originalInitLoad(...args);
						globalThis.isExecuted = true;
					};
				});

				await target.evaluate((ctx) => {
					ctx.testComponentAttrs = {
						'@:request': ctx.unsafe.createPropAccessors(() => ({
							get: {
								chunkSize: 20
							}
						}))
					};
				});

				await test.expect.poll(await page.evaluate(() => globalThis.isExecuted)).toBe(true);
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
			target.evaluate((ctx) => ctx.unsafe.$refs.child?.isFunctional)
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
			target.evaluate((ctx) => ctx.unsafe.$refs.child?.isFunctional)
		).resolves.toBe(false);

		await target.evaluate((ctx) => {
			const child = ctx.unsafe.$refs.child!.unsafe;

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
