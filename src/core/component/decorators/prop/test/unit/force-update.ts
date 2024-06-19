/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import test from 'tests/config/unit/test';

import { Component } from 'tests/helpers';

import type { WatchHandlerParams } from 'components/super/i-block';
import type bEffectPropWrapperDummy from 'core/component/decorators/prop/test/b-effect-prop-wrapper-dummy/b-effect-prop-wrapper-dummy';

test.describe('contracts for props effects', () => {
	type Log = Array<[unknown, unknown, unknown[]]>;

	test.beforeEach(async ({demoPage}) => {
		await demoPage.goto();
	});

	test.describe('changing the value of the prop with `forceUpdate: false`', () => {
		test.describe('for a non-functional component', () => {
			test.describe('passing data as a regular prop', () => {
				test('it should not cause the re-rendering of its template', async ({page}) => {
					const target = await Component.createComponent<bEffectPropWrapperDummy>(page, 'b-effect-prop-wrapper-dummy', {
						stage: 'without effect'
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
						target.evaluate((ctx) => ctx.unsafe.$refs.child?.renderCounter)
					).resolves.toBe(1);
				});

				test('prop monitoring should work correctly', async ({page}) => {
					const target = await Component.createComponent<bEffectPropWrapperDummy>(page, 'b-effect-prop-wrapper-dummy', {
						stage: 'without effect'
					});

					await test.expect(
						target.evaluate((ctx) => ctx.unsafe.$refs.child?.isFunctional)
					).resolves.toBe(false);

					await target.evaluate((ctx) => {
						const child = ctx.unsafe.$refs.child!.unsafe;

						const
							data: Log = [],
							dataProp: Log = [],
							dataGetter: Log = [];

						ctx.unsafe.tmp.data = data;
						ctx.unsafe.tmp.dataProp = dataProp;
						ctx.unsafe.tmp.dataGetter = dataGetter;

						child.watch('data', {deep: true, flush: 'sync'}, (val: unknown, old: unknown, i: WatchHandlerParams) => {
							data.push([val, old, i.path]);
						});

						child.watch('dataProp', {deep: true, flush: 'sync'}, (val: unknown, old: unknown, i: WatchHandlerParams) => {
							dataProp.push([val, old, i.path]);
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
								[{a: 3}, {}, ['dataProp']],
								[{a: 3}, {a: 2}, ['dataProp']]
							],

							dataGetter: [
								[{a: 2}, undefined, ['dataGetter']],
								[{a: 3}, {a: 2}, ['dataGetter']]
							]
						});
				});
			});

			test.describe('passing data using v-attrs', () => {
				test('it should not cause the re-rendering of its template', async ({page}) => {
					const target = await Component.createComponent<bEffectPropWrapperDummy>(page, 'b-effect-prop-wrapper-dummy', {
						stage: 'v-attrs without effect'
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
						target.evaluate((ctx) => ctx.unsafe.$refs.child?.renderCounter)
					).resolves.toBe(1);
				});

				test('prop monitoring should work correctly', async ({page}) => {
					const target = await Component.createComponent<bEffectPropWrapperDummy>(page, 'b-effect-prop-wrapper-dummy', {
						stage: 'v-attrs without effect'
					});

					await test.expect(
						target.evaluate((ctx) => ctx.unsafe.$refs.child?.isFunctional)
					).resolves.toBe(false);

					await target.evaluate((ctx) => {
						const child = ctx.unsafe.$refs.child!.unsafe;

						const
							data: Log = [],
							dataProp: Log = [],
							dataGetter: Log = [];

						ctx.unsafe.tmp.data = data;
						ctx.unsafe.tmp.dataProp = dataProp;
						ctx.unsafe.tmp.dataGetter = dataGetter;

						child.watch('data', {deep: true, flush: 'sync'}, (val: unknown, old: unknown, i: WatchHandlerParams) => {
							data.push([val, old, i.path]);
						});

						child.watch('dataProp', {deep: true, flush: 'sync'}, (val: unknown, old: unknown, i: WatchHandlerParams) => {
							dataProp.push([val, old, i.path]);
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
								[{a: 3}, {}, ['dataProp']],
								[{a: 3}, {a: 2}, ['dataProp']]
							],

							dataGetter: [
								[{a: 2}, undefined, ['dataGetter']],
								[{a: 3}, {a: 2}, ['dataGetter']]
							]
						});
				});
			});
		});

		test.describe('for a functional component', () => {
			test('it should still trigger the re-rendering of its template', async ({page}) => {
				const target = await Component.createComponent<bEffectPropWrapperDummy>(page, 'b-effect-prop-wrapper-dummy', {
					stage: 'functional without effect'
				});

				const text = await page.getByText('Content');

				await test.expect(
					target.evaluate((ctx) => ctx.unsafe.$refs.child?.isFunctional)
				).resolves.toBe(true);

				await test.expect(text).toHaveText('Content: {}');

				await target.evaluate((ctx) => ctx.someField = {a: 1});
				await test.expect(text).toHaveText('Content: {"a":1}');

				await target.evaluate((ctx) => ctx.someField.a!++);
				await test.expect(text).toHaveText('Content: {"a":2}');
			});
		});
	});

	test.describe('changing the value of the prop without `forceUpdate: false`', () => {
		test.describe('for a non-functional component', () => {
			test.describe('passing data as a regular prop', () => {
				test('it should cause the re-rendering of its template', async ({page}) => {
					const target = await Component.createComponent<bEffectPropWrapperDummy>(page, 'b-effect-prop-wrapper-dummy', {
						stage: 'with effect'
					});

					await test.expect(
						target.evaluate((ctx) => ctx.unsafe.$refs.child?.isFunctional)
					).resolves.toBe(false);

					const text = await page.getByText('Content');
					await test.expect(text).toHaveText('Content: {}');

					await target.evaluate((ctx) => ctx.someField = {a: 1});
					await test.expect(text).toHaveText('Content: {"a":1}');

					await target.evaluate((ctx) => ctx.someField.a!++);
					await test.expect(text).toHaveText('Content: {"a":2}');

					await test.expect(
						target.evaluate((ctx) => ctx.unsafe.$refs.child?.renderCounter)
					).resolves.toBe(3);
				});

				test('prop monitoring should work correctly', async ({page}) => {
					const target = await Component.createComponent<bEffectPropWrapperDummy>(page, 'b-effect-prop-wrapper-dummy', {
						stage: 'with effect'
					});

					await test.expect(
						target.evaluate((ctx) => ctx.unsafe.$refs.child?.isFunctional)
					).resolves.toBe(false);

					await target.evaluate((ctx) => {
						const child = ctx.unsafe.$refs.child!.unsafe;

						const
							data: Log = [],
							dataProp: Log = [],
							dataGetter: Log = [];

						ctx.unsafe.tmp.data = data;
						ctx.unsafe.tmp.dataProp = dataProp;
						ctx.unsafe.tmp.dataGetter = dataGetter;

						child.watch('data', {deep: true, flush: 'sync'}, (val: unknown, old: unknown, i: WatchHandlerParams) => {
							data.push([val, old, i.path]);
						});

						child.watch('dataProp', {deep: true, flush: 'sync'}, (val: unknown, old: unknown, i: WatchHandlerParams) => {
							dataProp.push([val, old, i.path]);
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
								[{a: 3}, {}, ['dataProp']],
								[{a: 3}, {a: 2}, ['dataProp']]
							],

							dataGetter: [
								[{a: 2}, undefined, ['dataGetter']],
								[{a: 3}, {a: 2}, ['dataGetter']]
							]
						});
				});
			});

			test.describe('passing data using v-attrs', () => {
				test('it should cause the re-rendering of its template', async ({page}) => {
					const target = await Component.createComponent<bEffectPropWrapperDummy>(page, 'b-effect-prop-wrapper-dummy', {
						stage: 'v-attrs with effect'
					});

					await test.expect(
						target.evaluate((ctx) => ctx.unsafe.$refs.child?.isFunctional)
					).resolves.toBe(false);

					const text = await page.getByText('Content');
					await test.expect(text).toHaveText('Content: {}');

					await target.evaluate((ctx) => ctx.someField = {a: 1});
					await test.expect(text).toHaveText('Content: {"a":1}');

					await target.evaluate((ctx) => ctx.someField.a!++);
					await test.expect(text).toHaveText('Content: {"a":2}');

					await test.expect(
						target.evaluate((ctx) => ctx.unsafe.$refs.child?.renderCounter)
					).resolves.toBe(3);
				});

				test('prop monitoring should work correctly', async ({page}) => {
					const target = await Component.createComponent<bEffectPropWrapperDummy>(page, 'b-effect-prop-wrapper-dummy', {
						stage: 'v-attrs with effect'
					});

					await test.expect(
						target.evaluate((ctx) => ctx.unsafe.$refs.child?.isFunctional)
					).resolves.toBe(false);

					await target.evaluate((ctx) => {
						const child = ctx.unsafe.$refs.child!.unsafe;

						const
							data: Log = [],
							dataProp: Log = [],
							dataGetter: Log = [];

						ctx.unsafe.tmp.data = data;
						ctx.unsafe.tmp.dataProp = dataProp;
						ctx.unsafe.tmp.dataGetter = dataGetter;

						child.watch('data', {deep: true, flush: 'sync'}, (val: unknown, old: unknown, i: WatchHandlerParams) => {
							data.push([val, old, i.path]);
						});

						child.watch('dataProp', {deep: true, flush: 'sync'}, (val: unknown, old: unknown, i: WatchHandlerParams) => {
							dataProp.push([val, old, i.path]);
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
								[{a: 3}, {}, ['dataProp']],
								[{a: 3}, {a: 2}, ['dataProp']]
							],

							dataGetter: [
								[{a: 2}, undefined, ['dataGetter']],
								[{a: 3}, {a: 2}, ['dataGetter']]
							]
						});
				});
			});
		});
	});
});
