/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/* eslint-disable max-lines-per-function, max-lines, require-atomic-updates */

import test from 'tests/config/unit/test';

import { renderWatchDummy } from 'components/super/i-block/test/helpers';

test.describe('<i-block> watch', () => {
	test.beforeEach(async ({demoPage}) => {
		await demoPage.goto();
	});

	['regular', 'system'].forEach((type) => {
		test.describe(`${type} fields`, () => {
			const field = type === 'regular' ?
				'complexObjStore' :
				'systemComplexObjStore';

			test.describe('should not clone old value when the handler has one argument', () => {
				test('with non-deep watching', async ({page}) => {
					const target = await renderWatchDummy(page);

					const scan = await target.evaluate(async (ctx, field) => {
						const res: any[] = [];

						// Using rest operator so that the handler function has length equal to 1.
						// In this case the old value won't be cloned.
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

				test('with non-deep watching without collapsing', async ({page}) => {
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

				test('with non-deep immediate watching', async ({page}) => {
					const target = await renderWatchDummy(page);

					const scan = await target.evaluate((ctx, field) => {
						const res: any[] = [];

						ctx.watch(field, {immediate: true, flush: 'sync'}, (val, ...args) => {
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

				test('with the specified path being watched', async ({page}) => {
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

				test('with the specified path being immediate watched', async ({page}) => {
					const target = await renderWatchDummy(page);

					const scan = await target.evaluate((ctx, field) => {
						const res: any[] = [];

						ctx.watch(`${field}.a.c`, {immediate: true, flush: 'sync'}, (val, ...args) => {
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

				test('with deep watching', async ({page}) => {
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

				test('with deep watching without collapsing', async ({page}) => {
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

				test('with deep immediate watching without collapsing', async ({page}) => {
					const target = await renderWatchDummy(page);

					const scan = await target.evaluate((ctx, field) => {
						const res: any[] = [];

						ctx.watch(field, {deep: true, immediate: true, flush: 'sync', collapse: false}, (val, ...args) => {
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

				test('and should remove watcher when `async.terminateWorker` is invoked', async ({page}) => {
					const target = await renderWatchDummy(page);

					const scan = await target.evaluate((ctx, field) => {
						const res: any[] = [];

						ctx.watch(field, {deep: true, immediate: true, flush: 'sync', collapse: false, group: 'foo'}, (val, ...args) => {
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

				test('and should stop watching changes when the `async.suspendEventListener` is invoked', async ({page}) => {
					const target = await renderWatchDummy(page);

					const resultHandle = await target.evaluateHandle((ctx, field) => {
						const res: any[] = [];

						ctx.watch(field, {deep: true, immediate: true, flush: 'sync', collapse: false, group: 'foo'}, (val, ...args) => {
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

					const result = [
						[
							{a: {b: {c: 1, d: 2}}},
							undefined,
							undefined,
							undefined
						],

						[2, 1, [field], [field, 'a', 'b', 'c']],
						[3, 2, [field], [field, 'a', 'b', 'c']]
					];

					await test.expect(resultHandle.evaluate((ctx) => ctx)).resolves.toEqual(result.slice(0, 2));

					await target.evaluate((ctx) => ctx.unsafe.async.unsuspendEventListener({group: /foo/}));

					await test.expect(resultHandle.evaluate((ctx) => ctx)).resolves.toEqual(result);
				});
			});

			test.describe('should clone old value when the handler has more than one argument', () => {
				test('with non-deep watching', async ({page}) => {
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

				test('with non-deep watching without collapsing', async ({page}) => {
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

				test('with non-deep immediate watching', async ({page}) => {
					const target = await renderWatchDummy(page);

					const scan = await target.evaluate((ctx, field) => {
						const res: any[] = [];

						ctx.watch(field, {immediate: true, flush: 'sync'}, (val, oldVal, i) => {
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

				test('with the specified path being watched', async ({page}) => {
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

				test('with the specified path being immediate watched', async ({page}) => {
					const target = await renderWatchDummy(page);

					const scan = await target.evaluate((ctx, field) => {
						const res: any[] = [];

						ctx.watch(`${field}.a.c`, {immediate: true, flush: 'sync'}, (val, oldVal, i) => {
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

				test('with deep watching', async ({page}) => {
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

				test('with deep watching without collapsing', async ({page}) => {
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

				test('with deep immediate watching without collapsing', async ({page}) => {
					const target = await renderWatchDummy(page);

					const scan = await target.evaluate((ctx, field) => {
						const res: any[] = [];

						ctx.watch(field, {deep: true, immediate: true, flush: 'sync', collapse: false}, (val, oldVal, i) => {
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

				test('and should stop watching changes when the `async.suspendEventListener` is invoked', async ({page}) => {
					const target = await renderWatchDummy(page);

					const resultHandle = await target.evaluateHandle((ctx, field) => {
						const res: any[] = [];

						ctx.watch(field, {deep: true, immediate: true, flush: 'sync', collapse: false, group: 'foo'}, (val, oldVal, i) => {
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

					const result = [
						[
							{a: {b: {c: 1, d: 2}}},
							undefined,
							false,
							undefined
						],

						[2, 1, false, [field, 'a', 'b', 'c']],
						[3, 2, false, [field, 'a', 'b', 'c']]
					];

					await test.expect(resultHandle.evaluate((ctx) => ctx)).resolves.toEqual(result.slice(0, 2));

					await target.evaluate((ctx) => ctx.unsafe.async.unsuspendEventListener({group: /foo/}));

					await test.expect(resultHandle.evaluate((ctx) => ctx)).resolves.toEqual(result);
				});
			});
		});
	});
});
