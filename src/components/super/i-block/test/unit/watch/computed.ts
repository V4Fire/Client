/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import test from 'tests/config/unit/test';

import { renderWatchDummy } from 'components/super/i-block/test/helpers';
import type { JSHandle } from 'playwright';
import type bSuperIBlockWatchDummy from '../../b-super-i-block-watch-dummy/b-super-i-block-watch-dummy';
import type { AsyncWatchOptions } from 'components/friends/sync';

test.describe('<i-block> watch - computed fields', () => {
	test.beforeEach(async ({demoPage}) => {
		await demoPage.goto();
	});

	test('should watch computed fields that depend on an external property', async ({page}) => {
		const target = await renderWatchDummy(page);

		const scan = await target.evaluate(async (ctx) => {
			const res: any[] = [ctx.componentName, ctx.remoteWatchableGetter];

			ctx.r.isAuth = false;
			await ctx.nextTick();

			ctx.watch('remoteWatchableGetter', (val) => {
				res.push(val);
			});

			ctx.r.isAuth = true;
			await ctx.nextTick();
			res.push(ctx.remoteWatchableGetter);

			return res;
		});

		test.expect(scan).toEqual(['b-super-i-block-watch-dummy', false, true, true]);
	});

	// TODO: check that old value is not cloned
	test.describe('should not clone old value when the handler has one argument', () => {
		test.describe('with non-deep watching', () => {
			test('with default params', async ({page}) => {
				const target = await renderWatchDummy(page);

				const scan = await performChangesWithoutOldValueClone(target);

				test.expect(scan).toEqual(getResults());
			});

			test('with `immediate = true`', async ({page}) => {
				const target = await renderWatchDummy(page);

				const scan = await performChangesWithoutOldValueClone(target, {immediate: true});

				test.expect(scan).toEqual([
					[
						{a: {b: {c: 1, d: 2}}, b: 11, remoteWatchableGetter: false},
						undefined,
						undefined,
						undefined
					],

					[
						{a: {b: {c: 3}}, b: 12, remoteWatchableGetter: false},
						{a: {b: {c: 1, d: 2}}, b: 11, remoteWatchableGetter: false},
						['smartComputed'],
						['complexObjStore']
					],

					...getResults().slice(1)
				]);

			});

			function performChangesWithoutOldValueClone(
				target: JSHandle<bSuperIBlockWatchDummy>, params: AsyncWatchOptions = {}
			): Promise<any[]> {
				return target.evaluate(async (ctx, params) => {
					const res: any[] = [];

					ctx.r.isAuth = false;
					await ctx.nextTick();

					// Using rest operator so that the handler function has length equal to 1.
					// In this case the old value won't be cloned.
					ctx.watch('smartComputed', params, (val, ...[oldValue, info]) => {
						res.push([
							Object.fastClone(val),
							Object.fastClone(oldValue),
							info?.path,
							info?.originalPath
						]);
					});

					ctx.complexObjStore = {a: {b: {c: 3}}};
					ctx.systemComplexObjStore = {a: {b: {c: 2}}};
					await ctx.nextTick();

					// eslint-disable-next-line require-atomic-updates
					ctx.r.isAuth = true;
					await ctx.nextTick();

					(<any>ctx.complexObjStore).a.b.c++;
					(<any>ctx.complexObjStore).a.b.c++;
					await ctx.nextTick();

					return res;
				}, params);
			}

			function getResults(): any[] {
				return [
					[
						{a: {b: {c: 3}}, b: 12, remoteWatchableGetter: false},
						undefined,
						['smartComputed'],
						['complexObjStore']
					],

					[
						{a: {b: {c: 3}}, b: 12, remoteWatchableGetter: true},
						{a: {b: {c: 3}}, b: 12, remoteWatchableGetter: false},
						['smartComputed'],
						['isAuth']
					],

					[
						{a: {b: {c: 5}}, b: 12, remoteWatchableGetter: true},
						{a: {b: {c: 3}}, b: 12, remoteWatchableGetter: true},
						['smartComputed'],
						['complexObjStore', 'a', 'b', 'c']
					]
				];
			}
		});

		test('with chained getters being watched', async ({page}) => {
			const target = await renderWatchDummy(page);

			const scan = await target.evaluate(async (ctx) => {
				const res: any[] = [];

				ctx.watch('cachedComplexObj', (val, ...[oldValue, info]) => {
					res.push([
						Object.fastClone(val),
						Object.fastClone(oldValue),
						info?.path,
						info?.originalPath
					]);
				});

				ctx.watch('cachedComplexDecorator', (val, ...[oldValue, info]) => {
					res.push([
						Object.fastClone(val),
						Object.fastClone(oldValue),
						info?.path,
						info?.originalPath
					]);
				});

				ctx.complexObjStore = {a: 1};
				await ctx.nextTick();

				(<any>ctx.complexObjStore).a++;
				await ctx.nextTick();

				return res;
			});

			test.expect(scan).toEqual([
				[
					{a: 1},
					undefined,
					['cachedComplexDecorator'],
					['complexObjStore']
				],
				[
					{a: 1},
					undefined,
					['cachedComplexObj'],
					['complexObjStore']
				],
				[
					{a: 2},
					{a: 1},
					['cachedComplexDecorator'],
					['complexObjStore', 'a']
				],
				[
					{a: 2},
					{a: 1},
					['cachedComplexObj'],
					['complexObjStore', 'a']
				]
			]);
		});
	});

	test.describe('should clone old value when the handler has more than one argument', () => {
		test.describe('with non-deep watching', () => {
			test('with default params', async ({page}) => {
				const target = await renderWatchDummy(page);

				const scan = await performChangesWithOldValueClone(target);

				test.expect(scan).toEqual(getResults());
			});

			test('with `immediate = true`', async ({page}) => {
				const target = await renderWatchDummy(page);

				const scan = await performChangesWithOldValueClone(target, {immediate: true});

				test.expect(scan).toEqual([
					[
						{a: {b: {c: 1, d: 2}}, b: 11, remoteWatchableGetter: false},
						undefined,
						false,
						undefined,
						undefined
					],

					[
						{a: {b: {c: 3}}, b: 12, remoteWatchableGetter: false},
						{a: {b: {c: 1, d: 2}}, b: 11, remoteWatchableGetter: false},
						false,
						['smartComputed'],
						['complexObjStore']
					],

					...getResults().slice(1)
				]);
			});

			function performChangesWithOldValueClone(
				target: JSHandle<bSuperIBlockWatchDummy>, params: AsyncWatchOptions = {}
			): Promise<any[]> {
				return target.evaluate(async (ctx, params) => {
					ctx.r.isAuth = false;
					await ctx.nextTick();

					const res: any[] = [];

					ctx.watch('smartComputed', params, (val, oldVal, info) => {
						res.push([
							Object.fastClone(val),
							Object.fastClone(oldVal),
							val === oldVal,
							info?.path,
							info?.originalPath
						]);
					});

					ctx.complexObjStore = {a: {b: {c: 3}}};
					ctx.systemComplexObjStore = {a: {b: {c: 2}}};
					await ctx.nextTick();

					// eslint-disable-next-line require-atomic-updates
					ctx.r.isAuth = true;
					await ctx.nextTick();

					(<any>ctx.complexObjStore).a.b.c++;
					(<any>ctx.complexObjStore).a.b.c++;
					await ctx.nextTick();

					return res;
				}, params);
			}

			function getResults() {
				return [
					[
						{a: {b: {c: 3}}, b: 12, remoteWatchableGetter: false},
						undefined,
						false,
						['smartComputed'],
						['complexObjStore']
					],

					[
						{a: {b: {c: 3}}, b: 12, remoteWatchableGetter: true},
						{a: {b: {c: 3}}, b: 12, remoteWatchableGetter: false},
						false,
						['smartComputed'],
						['isAuth']
					],

					[
						{a: {b: {c: 5}}, b: 12, remoteWatchableGetter: true},
						{a: {b: {c: 3}}, b: 12, remoteWatchableGetter: true},
						false,
						['smartComputed'],
						['complexObjStore', 'a', 'b', 'c']
					]
				];
			}

		});

		test('with chained getters being watched', async ({page}) => {
			const target = await renderWatchDummy(page);

			const scan = await target.evaluate(async (ctx) => {
				const res: any[] = [];

				ctx.watch('cachedComplexObj', (val, oldValue, info) => {
					res.push([
						Object.fastClone(val),
						Object.fastClone(oldValue),
						val === oldValue,
						info?.path,
						info?.originalPath
					]);
				});

				ctx.watch('cachedComplexDecorator', (val, oldValue, info) => {
					res.push([
						Object.fastClone(val),
						Object.fastClone(oldValue),
						val === oldValue,
						info?.path,
						info?.originalPath
					]);
				});

				ctx.complexObjStore = {a: 1};
				await ctx.nextTick();

				(<any>ctx.complexObjStore).a++;
				await ctx.nextTick();

				return res;
			});

			test.expect(scan).toEqual([
				[
					{a: 1},
					undefined,
					false,
					['cachedComplexDecorator'],
					['complexObjStore']
				],
				[
					{a: 1},
					undefined,
					false,
					['cachedComplexObj'],
					['complexObjStore']
				],
				[
					{a: 2},
					{a: 1},
					false,
					['cachedComplexDecorator'],
					['complexObjStore', 'a']
				],
				[
					{a: 2},
					{a: 1},
					false,
					['cachedComplexObj'],
					['complexObjStore', 'a']
				]
			]);
		});
	});
});
