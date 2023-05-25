/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/* eslint-disable max-lines-per-function, max-lines */

import test from 'tests/config/unit/test';

import { renderWatchDummy } from 'components/super/i-block/test/helpers';

test.describe('<i-block> watch - fields', () => {
	test.beforeEach(async ({demoPage}) => {
		await demoPage.goto();
	});

	['regular', 'system'].forEach((type) => {
		test.describe(`${type} fields`, () => {
			const field = type === 'regular' ?
				'complexObjStore' :
				'systemComplexObjStore';

			test.describe('without caching of old values', () => {
				test('non-deep watching', async ({page}) => {
					const target = await renderWatchDummy(page);

					const scan = await target.evaluate(async (ctx, field) => {
						const
							res: any[] = [];

						ctx.watch(field, (val, ...args) => {
							res.push([
								Object.fastClone(val),
								Object.fastClone(args[0]),
								args[1].path,
								args[1].originalPath
							]);
						});

						ctx[field] = {a: {b: 1}};
						ctx[field] = {a: {c: 2}};
						await ctx.nextTick();

						ctx[field] = {a: {c: 3}};
						await ctx.nextTick();

						ctx[field].a.c++;
						ctx[field].a.c++;
						await ctx.nextTick();

						return res;
					}, field);

					test.expect(scan).toEqual([
						[{a: {c: 2}}, {a: {b: 1}}, [field], [field]],
						[{a: {c: 3}}, {a: {c: 2}}, [field], [field]]
					]);
				});

				test('non-deep watching without collapsing', async ({page}) => {
					const target = await renderWatchDummy(page);

					const scan = await target.evaluate(async (ctx, field) => {
						const res: any[] = [];

						ctx.watch(field, {collapse: false}, (mutations) => {
							mutations.forEach(([val, oldVal, i]) => {
								res.push([
									Object.fastClone(val),
									Object.fastClone(oldVal),
									i.path,
									i.originalPath
								]);
							});
						});

						ctx[field] = {a: {b: 1}};
						ctx[field] = {a: {c: 2}};
						await ctx.nextTick();

						ctx[field] = {a: {c: 3}};
						await ctx.nextTick();

						ctx[field].a.c++;
						ctx[field].a.c++;
						await ctx.nextTick();

						return res;
					}, field);

					test.expect(scan).toEqual([
						[
							{a: {b: 1}},
							{a: {b: {c: 1, d: 2}}},
							[field],
							[field]
						],

						[
							{a: {c: 2}},
							{a: {b: 1}},
							[field],
							[field]
						],

						[
							{a: {c: 3}},
							{a: {c: 2}},
							[field],
							[field]
						]
					]);
				});

				test.skip('non-deep immediate watching', async ({page}) => {
					const target = await renderWatchDummy(page);

					const scan = await target.evaluate((ctx, field) => {
						const res: any[] = [];

						ctx.watch(field, {immediate: true}, (val, ...args) => {
							res.push([
								Object.fastClone(val),
								Object.fastClone(args[0]),
								args[1]?.path,
								args[1]?.originalPath
							]);
						});

						ctx[field] = {a: {b: 1}};
						ctx[field] = {a: {c: 2}};
						ctx[field] = {a: {c: 3}};

						ctx[field].a.c++;
						ctx[field].a.c++;

						return res;
					}, field);

					test.expect(scan).toEqual([
						[
							{a: {b: {c: 1, d: 2}}},
							undefined,
							undefined,
							undefined
						],

						[
							{a: {b: 1}},
							{a: {b: {c: 1, d: 2}}},
							[field],
							[field]
						],

						[
							{a: {c: 2}},
							{a: {b: 1}},
							[field],
							[field]
						],

						[
							{a: {c: 3}},
							{a: {c: 2}},
							[field],
							[field]
						]
					]);
				});

				test('watching for the specified path', async ({page}) => {
					const target = await renderWatchDummy(page);

					const scan = await target.evaluate(async (ctx, field) => {
						const res: any[] = [];

						ctx.watch(`${field}.a.c`, (val, ...args) => {
							res.push([
								Object.fastClone(val),
								Object.fastClone(args[0]),
								args[1].path,
								args[1].originalPath
							]);
						});

						ctx[field] = {a: {b: 1}};
						ctx[field] = {a: {c: 2}};
						await ctx.nextTick();

						ctx[field] = {a: {b: 3}};
						await ctx.nextTick();

						ctx[field] = {a: {c: 3}};
						await ctx.nextTick();

						ctx[field].a.c++;
						ctx[field].a.c++;
						await ctx.nextTick();

						return res;
					}, field);

					test.expect(scan).toEqual([
						[
							{a: {c: 2}},
							{a: {b: 1}},
							[field, 'a', 'c'],
							[field]
						],
						[
							{a: {b: 3}},
							{a: {c: 2}},
							[field, 'a', 'c'],
							[field]
						],
						[
							{a: {c: 3}},
							{a: {b: 3}},
							[field, 'a', 'c'],
							[field]
						],
						[
							{a: {c: 5}},
							{a: {c: 5}},
							[field, 'a', 'c'],
							[field, 'a', 'c']
						]
					]);
				});

				test.skip('immediate watching for the specified path', async ({page}) => {
					const target = await renderWatchDummy(page);

					const scan = await target.evaluate((ctx, field) => {
						const res: any[] = [];

						ctx.watch(`${field}.a.c`, {immediate: true}, (val, ...args) => {
							res.push([
								Object.fastClone(val),
								Object.fastClone(args[0]),
								args[1]?.path,
								args[1]?.originalPath
							]);
						});

						ctx[field] = {a: {b: 1}};
						ctx[field] = {a: {c: 2}};

						ctx[field] = {a: {b: 3}};

						ctx[field] = {a: {c: 3}};

						ctx[field].a.c++;
						ctx[field].a.c++;

						return res;
					}, field);

					test.expect(scan).toEqual([
						[
							{a: {b: {c: 1, d: 2}}},
							undefined,
							undefined,
							undefined
						],

						[
							{a: {c: 2}},
							{a: {b: 1}},
							[field, 'a', 'c'],
							[field]
						],

						[
							{a: {b: 3}},
							{a: {c: 2}},
							[field, 'a', 'c'],
							[field]
						],

						[
							{a: {c: 3}},
							{a: {b: 3}},
							[field, 'a', 'c'],
							[field]
						],

						[
							{a: {c: 4}},
							{a: {c: 4}},
							[field, 'a', 'c'],
							[field, 'a', 'c']
						],

						[
							{a: {c: 5}},
							{a: {c: 5}},
							[field, 'a', 'c'],
							[field, 'a', 'c']
						]
					]);
				});

				test('deep watching', async ({page}) => {
					const target = await renderWatchDummy(page);

					const scan = await target.evaluate(async (ctx, field) => {
						const res: any[] = [];

						ctx.watch(field, {deep: true}, (val, ...args) => {
							res.push([
								Object.fastClone(val),
								Object.fastClone(args[0]),
								args[1].path,
								args[1].originalPath
							]);
						});

						ctx[field] = {a: {b: 1}};
						ctx[field] = {a: {c: 2}};
						await ctx.nextTick();

						ctx[field] = {a: {c: 3}};
						await ctx.nextTick();

						ctx[field].a.c++;
						ctx[field].a.c++;
						await ctx.nextTick();

						return res;
					}, field);

					test.expect(scan).toEqual([
						[{a: {c: 2}}, {a: {b: 1}}, [field], [field]],
						[{a: {c: 3}}, {a: {c: 2}}, [field], [field]],
						[{a: {c: 5}}, {a: {c: 5}}, [field], [field, 'a', 'c']]
					]);
				});

				test('deep watching without collapsing', async ({page}) => {
					const target = await renderWatchDummy(page);

					const scan = await target.evaluate(async (ctx, field) => {
						const res: any[] = [];

						ctx.watch(field, {deep: true, collapse: false}, (mutations) => {
							mutations.forEach(([val, oldVal, i]) => {
								res.push([
									Object.fastClone(val),
									Object.fastClone(oldVal),
									i.path,
									i.originalPath
								]);
							});
						});

						ctx[field] = {a: {b: 1}};
						await ctx.nextTick();

						ctx[field].a.b++;
						ctx[field].a.b++;
						await ctx.nextTick();

						ctx[field].a = {d: 1};
						await ctx.nextTick();

						return res;
					}, field);

					test.expect(scan).toEqual([
						[
							{a: {b: 1}},
							{a: {b: {c: 1, d: 2}}},
							[field],
							[field]
						],

						[2, 1, [field], [field, 'a', 'b']],
						[3, 2, [field], [field, 'a', 'b']],

						[
							{d: 1},
							{b: 3},
							[field],
							[field, 'a']
						]
					]);
				});

				test.skip('deep immediate watching without collapsing', async ({page}) => {
					const target = await renderWatchDummy(page);

					const scan = await target.evaluate((ctx, field) => {
						const res: any[] = [];

						ctx.watch(field, {deep: true, immediate: true, collapse: false}, (val, ...args) => {
							res.push([
								Object.fastClone(val),
								Object.fastClone(args[0]),
								args[1]?.path,
								args[1]?.originalPath
							]);
						});

						ctx[field] = {a: {b: 1}};

						ctx[field].a.b++;
						ctx[field].a.b++;

						ctx[field].a = {d: 1};

						return res;
					}, field);

					test.expect(scan).toEqual([
						[
							{a: {b: {c: 1, d: 2}}},
							undefined,
							undefined,
							undefined
						],

						[
							{a: {b: 1}},
							{a: {b: {c: 1, d: 2}}},
							[field],
							[field]
						],

						[2, 1, [field], [field, 'a', 'b']],
						[3, 2, [field], [field, 'a', 'b']],

						[
							{d: 1},
							{b: 3},
							[field],
							[field, 'a']
						]
					]);
				});

				test.skip('removing watchers', async ({page}) => {
					const target = await renderWatchDummy(page);

					const scan = await target.evaluate((ctx, field) => {
						const res: any[] = [];

						ctx.watch(field, {deep: true, immediate: true, collapse: false, group: 'foo'}, (val, ...args) => {
							res.push([
								Object.fastClone(val),
								Object.fastClone(args[0]),
								args[1]?.path,
								args[1]?.originalPath
							]);
						});

						ctx[field].a.b.c++;
						ctx.unsafe.async.terminateWorker({group: 'foo'});
						ctx[field].a.b.c++;

						return res;
					}, field);

					test.expect(scan).toEqual([
						[
							{a: {b: {c: 1, d: 2}}},
							undefined,
							undefined,
							undefined
						],

						[2, 1, [field], [field, 'a', 'b', 'c']]
					]);
				});

				test.skip('suspending watchers', async ({page}) => {
					const target = await renderWatchDummy(page);

					const scan = await target.evaluate((ctx, field) => {
						const res: any[] = [];
						globalThis._res = res;

						ctx.watch(field, {deep: true, immediate: true, collapse: false, group: 'foo'}, (val, ...args) => {
							res.push([
								Object.fastClone(val),
								Object.fastClone(args[0]),
								args[1]?.path,
								args[1]?.originalPath
							]);
						});

						ctx[field].a.b.c++;
						ctx.unsafe.async.suspendEventListener({group: /foo/});
						ctx[field].a.b.c++;

						return res;
					}, field);

					test.expect(scan).toEqual([
						[
							{a: {b: {c: 1, d: 2}}},
							undefined,
							undefined,
							undefined
						],

						[2, 1, [field], [field, 'a', 'b', 'c']]
					]);

					const scan2 = await target.evaluate((ctx) => {
						const res = globalThis._res;
						ctx.unsafe.async.unsuspendEventListener({group: /foo/});
						return res;
					});

					test.expect(scan2).toEqual([
						[
							{a: {b: {c: 1, d: 2}}},
							undefined,
							undefined,
							undefined
						],

						[2, 1, [field], [field, 'a', 'b', 'c']],
						[3, 2, [field], [field, 'a', 'b', 'c']]
					]);
				});
			});

			test.describe('with caching of old values', () => {
				test('non-deep watching', async ({page}) => {
					const target = await renderWatchDummy(page);

					const scan = await target.evaluate(async (ctx, field) => {
						const res: any[] = [];

						ctx.watch(field, (val, oldVal, i) => {
							res.push([
								Object.fastClone(val),
								Object.fastClone(oldVal),
								val === oldVal,
								i.originalPath
							]);
						});

						ctx[field] = {a: {b: 1}};
						ctx[field] = {a: {c: 2}};
						await ctx.nextTick();

						ctx[field] = {a: {c: 3}};
						await ctx.nextTick();

						ctx[field].a.c++;
						ctx[field].a.c++;
						await ctx.nextTick();

						return res;
					}, field);

					test.expect(scan).toEqual([
						[{a: {c: 2}}, {a: {b: {c: 1, d: 2}}}, false, [field]],
						[{a: {c: 3}}, {a: {c: 2}}, false, [field]]
					]);
				});

				test('non-deep watching without collapsing', async ({page}) => {
					const target = await renderWatchDummy(page);

					const scan = await target.evaluate(async (ctx, field) => {
						const res: any[] = [];

						ctx.watch(field, {collapse: false}, (mutations) => {
							mutations.forEach(([val, oldVal, i]) => {
								res.push([
									Object.fastClone(val),
									Object.fastClone(oldVal),
									val === oldVal,
									i.originalPath
								]);
							});
						});

						ctx[field] = {a: {b: 1}};
						ctx[field] = {a: {c: 2}};
						await ctx.nextTick();

						ctx[field] = {a: {c: 3}};
						await ctx.nextTick();

						ctx[field].a.c++;
						ctx[field].a.c++;
						await ctx.nextTick();

						return res;
					}, field);

					test.expect(scan).toEqual([
						[
							{a: {b: 1}},
							{a: {b: {c: 1, d: 2}}},
							false,
							[field]
						],

						[
							{a: {c: 2}},
							{a: {b: 1}},
							false,
							[field]
						],

						[
							{a: {c: 3}},
							{a: {c: 2}},
							false,
							[field]
						]
					]);
				});

				test.skip('non-deep immediate watching', async ({page}) => {
					const target = await renderWatchDummy(page);

					const scan = await target.evaluate((ctx, field) => {
						const res: any[] = [];

						ctx.watch(field, {immediate: true}, (val, oldVal, i) => {
							res.push([
								Object.fastClone(val),
								Object.fastClone(oldVal),
								val === oldVal,
								i?.originalPath
							]);
						});

						ctx[field] = {a: {b: 1}};
						ctx[field] = {a: {c: 2}};
						ctx[field] = {a: {c: 3}};

						ctx[field].a.c++;
						ctx[field].a.c++;

						return res;
					}, field);

					test.expect(scan).toEqual([
						[
							{a: {b: {c: 1, d: 2}}},
							undefined,
							false,
							undefined
						],

						[
							{a: {b: 1}},
							{a: {b: {c: 1, d: 2}}},
							false,
							[field]
						],

						[
							{a: {c: 2}},
							{a: {b: 1}},
							false,
							[field]
						],

						[
							{a: {c: 3}},
							{a: {c: 2}},
							false,
							[field]
						]
					]);
				});

				test('watching for the specified path', async ({page}) => {
					const target = await renderWatchDummy(page);

					const scan = await target.evaluate(async (ctx, field) => {
						const res: any[] = [];

						ctx.watch(`${field}.a.c`, (val, oldVal, i) => {
							res.push([
								Object.fastClone(val),
								Object.fastClone(oldVal),
								val === oldVal,
								i.originalPath
							]);
						});

						ctx[field] = {a: {b: 1}};
						ctx[field] = {a: {c: 2}};
						await ctx.nextTick();

						ctx[field] = {a: {b: 3}};
						await ctx.nextTick();

						ctx[field] = {a: {c: 3}};
						await ctx.nextTick();

						ctx[field].a.c++;
						ctx[field].a.c++;
						await ctx.nextTick();

						return res;
					}, field);

					test.expect(scan).toEqual([
						[
							{a: {c: 2}},
							{a: {b: {c: 1, d: 2}}},
							false,
							[field]
						],

						[
							{a: {b: 3}},
							{a: {c: 2}},
							false,
							[field]
						],

						[
							{a: {c: 3}},
							{a: {b: 3}},
							false,
							[field]
						],

						[
							{a: {c: 5}},
							{a: {c: 3}},
							false,
							[field, 'a', 'c']
						]
					]);
				});

				test.skip('immediate watching for the specified path', async ({page}) => {
					const target = await renderWatchDummy(page);

					const scan = await target.evaluate((ctx, field) => {
						const res: any[] = [];

						ctx.watch(`${field}.a.c`, {immediate: true}, (val, oldVal, i) => {
							res.push([
								Object.fastClone(val),
								Object.fastClone(oldVal),
								val === oldVal,
								i?.originalPath
							]);
						});

						ctx[field] = {a: {b: 1}};
						ctx[field] = {a: {c: 2}};

						ctx[field] = {a: {b: 3}};

						ctx[field] = {a: {c: 3}};

						ctx[field].a.c++;
						ctx[field].a.c++;

						return res;
					}, field);

					test.expect(scan).toEqual([
						[
							{a: {b: {c: 1, d: 2}}},
							undefined,
							false,
							undefined
						],

						[
							{a: {c: 2}},
							{a: {b: {c: 1, d: 2}}},
							false,
							[field]
						],

						[
							{a: {b: 3}},
							{a: {c: 2}},
							false,
							[field]
						],

						[
							{a: {c: 3}},
							{a: {b: 3}},
							false,
							[field]
						],

						[
							{a: {c: 4}},
							{a: {c: 3}},
							false,
							[field, 'a', 'c']
						],

						[
							{a: {c: 5}},
							{a: {c: 4}},
							false,
							[field, 'a', 'c']
						]
					]);
				});

				test('deep watching', async ({page}) => {
					const target = await renderWatchDummy(page);

					const scan = await target.evaluate(async (ctx, field) => {
						const res: any[] = [];

						ctx.watch(field, {deep: true}, (val, oldVal, i) => {
							res.push([
								Object.fastClone(val),
								Object.fastClone(oldVal),
								val === oldVal,
								i.originalPath
							]);
						});

						ctx[field] = {a: {b: 1}};
						ctx[field] = {a: {c: 2}};
						await ctx.nextTick();

						ctx[field] = {a: {c: 3}};
						await ctx.nextTick();

						ctx[field].a.c++;
						ctx[field].a.c++;
						await ctx.nextTick();

						return res;
					}, field);

					test.expect(scan).toEqual([
						[
							{a: {c: 2}},
							{a: {b: {c: 1, d: 2}}},
							false,
							[field]
						],

						[
							{a: {c: 3}},
							{a: {c: 2}},
							false,
							[field]
						],

						[
							{a: {c: 5}},
							{a: {c: 3}},
							false,
							[field, 'a', 'c']
						]
					]);
				});

				test('deep watching without collapsing', async ({page}) => {
					const target = await renderWatchDummy(page);

					const scan = await target.evaluate(async (ctx, field) => {
						const res: any[] = [];

						ctx.watch(field, {deep: true, collapse: false}, (mutations) => {
							mutations.forEach(([val, oldVal, i]) => {
								res.push([
									Object.fastClone(val),
									Object.fastClone(oldVal),
									val === oldVal,
									i.originalPath
								]);
							});
						});

						ctx[field] = {a: {b: 1}};
						await ctx.nextTick();

						ctx[field].a.b++;
						ctx[field].a.b++;
						await ctx.nextTick();

						ctx[field].a = {d: 1};
						await ctx.nextTick();

						return res;
					}, field);

					test.expect(scan).toEqual([
						[
							{a: {b: 1}},
							{a: {b: {c: 1, d: 2}}},
							false,
							[field]
						],

						[2, 1, false, [field, 'a', 'b']],
						[3, 2, false, [field, 'a', 'b']],

						[
							{d: 1},
							{b: 3},
							false,
							[field, 'a']
						]
					]);
				});

				test.skip('deep immediate watching without collapsing', async ({page}) => {
					const target = await renderWatchDummy(page);

					const scan = await target.evaluate((ctx, field) => {
						const res: any[] = [];

						ctx.watch(field, {deep: true, immediate: true, collapse: false}, (val, oldVal, i) => {
							res.push([
								Object.fastClone(val),
								Object.fastClone(oldVal),
								val === oldVal,
								i?.originalPath
							]);
						});

						ctx[field] = {a: {b: 1}};

						ctx[field].a.b++;
						ctx[field].a.b++;

						ctx[field].a = {d: 1};

						return res;
					}, field);

					test.expect(scan).toEqual([
						[
							{a: {b: {c: 1, d: 2}}},
							undefined,
							false,
							undefined
						],

						[
							{a: {b: 1}},
							{a: {b: {c: 1, d: 2}}},
							false,
							[field]
						],

						[2, 1, false, [field, 'a', 'b']],
						[3, 2, false, [field, 'a', 'b']],

						[
							{d: 1},
							{b: 3},
							false,
							[field, 'a']
						]
					]);
				});

				test.skip('suspending watchers', async ({page}) => {
					const target = await renderWatchDummy(page);

					const scan = await target.evaluate((ctx, field) => {
						const res: any[] = [];
						globalThis._res = res;

						ctx.watch(field, {deep: true, immediate: true, collapse: false, group: 'foo'}, (val, oldVal, i) => {
							res.push([
								Object.fastClone(val),
								Object.fastClone(oldVal),
								val === oldVal,
								i?.originalPath
							]);
						});

						ctx[field].a.b.c++;
						ctx.unsafe.async.suspendEventListener({group: /foo/});
						ctx[field].a.b.c++;

						return res;
					}, field);

					test.expect(scan).toEqual([
						[
							{a: {b: {c: 1, d: 2}}},
							undefined,
							false,
							undefined
						],

						[2, 1, false, [field, 'a', 'b', 'c']]
					]);

					const scan2 = await target.evaluate((ctx) => {
						const res = globalThis._res;
						ctx.unsafe.async.unsuspendEventListener({group: /foo/});
						return res;
					});

					test.expect(scan2).toEqual([
						[
							{a: {b: {c: 1, d: 2}}},
							undefined,
							false,
							undefined
						],

						[2, 1, false, [field, 'a', 'b', 'c']],
						[3, 2, false, [field, 'a', 'b', 'c']]
					]);
				});
			});
		});
	});
});
