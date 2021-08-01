/* eslint-disable max-lines,max-lines-per-function,require-atomic-updates */

// @ts-check

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * @typedef {import('playwright').Page} Page
 */

const
	h = include('tests/helpers');

/** @param {Page} page */
module.exports = (page) => {
	beforeEach(async () => {
		await page.evaluate(() => {
			globalThis.removeCreatedComponents();
		});
	});

	describe('i-block watching for computed fields', () => {
		it('that depends on an external property', async () => {
			const target = await init();

			const scan = await target.evaluate(async (ctx) => {
				ctx.r.isAuth = false;
				await ctx.nextTick();

				const
					res = [ctx.componentName, ctx.remoteWatchableGetter];

				ctx.watch('remoteWatchableGetter', (val) => {
					res.push(val);
				});

				ctx.r.isAuth = true;
				await ctx.nextTick();
				res.push(ctx.remoteWatchableGetter);

				return res;
			});

			expect(scan).toEqual(['b-dummy-watch', false, true, true]);
		});

		describe('without caching of old values', () => {
			it('non-deep watching', async () => {
				const
					target = await init();

				const scan = await target.evaluate(async (ctx) => {
					ctx.r.isAuth = false;
					await ctx.nextTick();

					const
						res = [];

					ctx.watch('smartComputed', (val, ...args) => {
						res.push([
							Object.fastClone(val),
							Object.fastClone(args[0]),
							args[1].path,
							args[1].originalPath
						]);
					});

					ctx.complexObjStore = {a: {b: {c: 3}}};
					ctx.systemComplexObjStore = {a: {b: {c: 2}}};
					await ctx.nextTick();

					ctx.r.isAuth = true;
					await ctx.nextTick();

					ctx.complexObjStore.a.b.c++;
					ctx.complexObjStore.a.b.c++;
					await ctx.nextTick();

					return res;
				});

				expect(scan).toEqual([
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
				]);
			});

			it('non-deep immediate watching', async () => {
				const
					target = await init();

				const scan = await target.evaluate(async (ctx) => {
					ctx.r.isAuth = false;
					await ctx.nextTick();

					const
						res = [];

					ctx.watch('smartComputed', {immediate: true}, (val, ...args) => {
						res.push([
							Object.fastClone(val),
							Object.fastClone(args[0]),
							args[1]?.path,
							args[1]?.originalPath
						]);
					});

					ctx.complexObjStore = {a: {b: {c: 3}}};
					ctx.systemComplexObjStore = {a: {b: {c: 2}}};
					await ctx.nextTick();

					ctx.r.isAuth = true;
					await ctx.nextTick();

					ctx.complexObjStore.a.b.c++;
					ctx.complexObjStore.a.b.c++;
					await ctx.nextTick();

					return res;
				});

				expect(scan).toEqual([
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
				]);
			});

			it('watching for chained getters', async () => {
				const target = await init();

				const scan = await target.evaluate(async (ctx) => {
					const
						res = [];

					ctx.watch('cachedComplexObj', (val, ...args) => {
						res.push([
							Object.fastClone(val),
							Object.fastClone(args[0]),
							args[1]?.path,
							args[1]?.originalPath
						]);
					});

					ctx.watch('cachedComplexDecorator', (val, ...args) => {
						res.push([
							Object.fastClone(val),
							Object.fastClone(args[0]),
							args[1]?.path,
							args[1]?.originalPath
						]);
					});

					ctx.complexObjStore = {a: 1};
					await ctx.nextTick();

					ctx.complexObjStore.a++;
					await ctx.nextTick();

					return res;
				});

				expect(scan).toEqual([
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

		describe('with caching of old values', () => {
			it('non-deep watching', async () => {
				const
					target = await init();

				const scan = await target.evaluate(async (ctx) => {
					ctx.r.isAuth = false;
					await ctx.nextTick();

					const
						res = [];

					ctx.watch('smartComputed', (val, oldVal, i) => {
						res.push([
							Object.fastClone(val),
							Object.fastClone(oldVal),
							val === oldVal,
							i.path,
							i.originalPath
						]);
					});

					ctx.complexObjStore = {a: {b: {c: 3}}};
					ctx.systemComplexObjStore = {a: {b: {c: 2}}};
					await ctx.nextTick();

					ctx.r.isAuth = true;
					await ctx.nextTick();

					ctx.complexObjStore.a.b.c++;
					ctx.complexObjStore.a.b.c++;
					await ctx.nextTick();

					return res;
				});

				expect(scan).toEqual([
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
				]);
			});

			it('non-deep immediate watching', async () => {
				const
					target = await init();

				const scan = await target.evaluate(async (ctx) => {
					ctx.r.isAuth = false;
					await ctx.nextTick();

					const
						res = [];

					ctx.watch('smartComputed', {immediate: true}, (val, oldVal, i) => {
						res.push([
							Object.fastClone(val),
							Object.fastClone(oldVal),
							val === oldVal,
							i?.path,
							i?.originalPath
						]);
					});

					ctx.complexObjStore = {a: {b: {c: 3}}};
					ctx.systemComplexObjStore = {a: {b: {c: 2}}};
					await ctx.nextTick();

					ctx.r.isAuth = true;
					await ctx.nextTick();

					ctx.complexObjStore.a.b.c++;
					ctx.complexObjStore.a.b.c++;
					await ctx.nextTick();

					return res;
				});

				expect(scan).toEqual([
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
				]);
			});

			it('watching for chained getters', async () => {
				const target = await init();

				const scan = await target.evaluate(async (ctx) => {
					const
						res = [];

					ctx.watch('cachedComplexObj', (val, oldVal, i) => {
						res.push([
							Object.fastClone(val),
							Object.fastClone(oldVal),
							val === oldVal,
							i?.path,
							i?.originalPath
						]);
					});

					ctx.watch('cachedComplexDecorator', (val, oldVal, i) => {
						res.push([
							Object.fastClone(val),
							Object.fastClone(oldVal),
							val === oldVal,
							i?.path,
							i?.originalPath
						]);
					});

					ctx.complexObjStore = {a: 1};
					await ctx.nextTick();

					ctx.complexObjStore.a++;
					await ctx.nextTick();

					return res;
				});

				expect(scan).toEqual([
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

	async function init(attrs = {}) {
		await page.evaluate((attrs = {}) => {
			const scheme = [
				{
					attrs: {
						id: 'target',
						...attrs
					}
				}
			];

			globalThis.renderComponents('b-dummy-watch', scheme);
		}, attrs);

		return h.component.waitForComponent(page, '#target');
	}
};
