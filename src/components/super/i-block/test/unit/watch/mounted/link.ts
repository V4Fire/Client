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

test.describe('<i-block> watch - mounted objects passed by a link', () => {
	test.beforeEach(async ({demoPage}) => {
		await demoPage.goto();
	});

	test.describe('should not clone old value when the handler has one argument', () => {
		test('with non-deep watching', async ({page}) => {
			const target = await renderWatchDummy(page);

			const scan = await target.evaluate(async (ctx) => {
				const res: any[] = [];

				ctx.watch(ctx.mountedArrayWatcher, (val, ...args) => {
					res.push([
						Object.fastClone(val),
						Object.fastClone(args[0]),
						args[1].path,
						args[1].originalPath
					]);
				});

				ctx.mountedArrayWatcher.push(1);
				ctx.mountedArrayWatcher.push(2);
				await ctx.nextTick();

				ctx.mountedArrayWatcher.push(3);
				await ctx.nextTick();

				ctx.mountedArrayWatcher.pop();
				ctx.mountedArrayWatcher.shift();
				await ctx.nextTick();

				return res;
			});

			test.expect(scan).toEqual([
				[[1, 2], [1, 2], [1], [1]],
				[[1, 2, 3], [1, 2, 3], [2], [2]],
				[[2], [2], ['length'], ['length']]
			]);
		});

		test('with non-deep watching without collapsing', async ({page}) => {
			const target = await renderWatchDummy(page);

			const scan = await target.evaluate(async (ctx) => {
				const res: any[] = [];

				ctx.watch(ctx.mountedArrayWatcher, {collapse: false}, (mutations) => {
					mutations.forEach(([val, oldVal, i]) => {
						res.push([
							Object.fastClone(val),
							Object.fastClone(oldVal),
							i.path,
							i.originalPath
						]);
					});
				});

				ctx.mountedArrayWatcher.push(1);
				ctx.mountedArrayWatcher.push(2);
				await ctx.nextTick();

				ctx.mountedArrayWatcher.push(3);
				await ctx.nextTick();

				ctx.mountedArrayWatcher.pop();
				ctx.mountedArrayWatcher.shift();
				await ctx.nextTick();

				return res;
			});

			test.expect(scan).toEqual([
				[1, undefined, [0], [0]],
				[2, undefined, [1], [1]],
				[3, undefined, [2], [2]],
				[2, 3, ['length'], ['length']],
				[2, 1, [0], [0]],
				[1, 2, ['length'], ['length']]
			]);
		});

		test('with non-deep immediate watching', async ({page}) => {
			const target = await renderWatchDummy(page);

			const scan = await target.evaluate(async (ctx) => {
				const res: any[] = [];

				ctx.watch(ctx.mountedArrayWatcher, {flush: 'sync', immediate: true}, (val, ...args) => {
					res.push([
						Object.fastClone(val),
						Object.fastClone(args[0]),
						args[1]?.path,
						args[1]?.originalPath
					]);
				});

				ctx.mountedArrayWatcher.push(1);
				ctx.mountedArrayWatcher.push(2);
				await ctx.nextTick();

				ctx.mountedArrayWatcher.push(3);
				await ctx.nextTick();

				ctx.mountedArrayWatcher.pop();
				ctx.mountedArrayWatcher.shift();
				await ctx.nextTick();

				return res;
			});

			test.expect(scan).toEqual([
				[[], [], undefined, undefined],
				[[1], [1], [0], [0]],
				[[1, 2], [1, 2], [1], [1]],
				[[1, 2, 3], [1, 2, 3], [2], [2]],
				[[1, 2], [1, 2], ['length'], ['length']],
				[[2, 2], [2, 2], [0], [0]],
				[[2], [2], ['length'], ['length']]
			]);
		});

		test('with non-deep immediate watching without collapsing', async ({page}) => {
			const target = await renderWatchDummy(page);

			const scan = await target.evaluate(async (ctx) => {
				const res: any[] = [];

				ctx.watch(ctx.mountedArrayWatcher, {flush: 'sync', immediate: true, collapse: false}, (val, ...args) => {
					res.push([
						Object.fastClone(val),
						Object.fastClone(args[0]),
						args[1]?.path,
						args[1]?.originalPath
					]);
				});

				ctx.mountedArrayWatcher.push(1);
				ctx.mountedArrayWatcher.push(2);
				await ctx.nextTick();

				ctx.mountedArrayWatcher.push(3);
				await ctx.nextTick();

				ctx.mountedArrayWatcher.pop();
				ctx.mountedArrayWatcher.shift();
				await ctx.nextTick();

				return res;
			});

			test.expect(scan).toEqual([
				[[], undefined, undefined, undefined],
				[1, undefined, [0], [0]],
				[2, undefined, [1], [1]],
				[3, undefined, [2], [2]],
				[2, 3, ['length'], ['length']],
				[2, 1, [0], [0]],
				[1, 2, ['length'], ['length']]
			]);
		});

		test('with the specified path being watched', async ({page}) => {
			const target = await renderWatchDummy(page);

			const scan = await target.evaluate(async (ctx) => {
				const res: any[] = [];

				ctx.watch({ctx: ctx.mountedWatcher, path: 'a.c'}, (val, ...args) => {
					res.push([
						Object.fastClone(val),
						Object.fastClone(args[0]),
						args[1].path,
						args[1].originalPath
					]);
				});

				ctx.mountedWatcher.a = {b: 1};
				ctx.mountedWatcher.a = {c: 2};
				await ctx.nextTick();

				ctx.mountedWatcher.a = {b: 3};
				await ctx.nextTick();

				ctx.mountedWatcher.a = {c: 3};
				await ctx.nextTick();

				(<any>ctx.mountedWatcher).a.c++;
				(<any>ctx.mountedWatcher).a.c++;
				await ctx.nextTick();

				return res;
			});

			test.expect(scan).toEqual([
				[{a: {c: 2}}, {a: {c: 2}}, ['a', 'c'], ['a']],
				[{a: {b: 3}}, {a: {b: 3}}, ['a', 'c'], ['a']],
				[{a: {c: 3}}, {a: {c: 3}}, ['a', 'c'], ['a']],
				[{a: {c: 5}}, {a: {c: 5}}, ['a', 'c'], ['a', 'c']]
			]);
		});

		test('with the specified path being immediate watched', async ({page}) => {
			const target = await renderWatchDummy(page);

			const scan = await target.evaluate((ctx) => {
				const res: any[] = [];

				ctx.watch({ctx: ctx.mountedWatcher, path: ['a', 'c']}, {flush: 'sync', immediate: true}, (val, ...args) => {
					res.push([
						Object.fastClone(val),
						Object.fastClone(args[0]),
						args[1]?.path,
						args[1]?.originalPath
					]);
				});

				ctx.mountedWatcher.a = {b: 1};
				ctx.mountedWatcher.a = {c: 2};

				ctx.mountedWatcher.a = {b: 3};

				ctx.mountedWatcher.a = {c: 3};

				(<any>ctx.mountedWatcher).a.c++;
				(<any>ctx.mountedWatcher).a.c++;

				return res;
			});

			test.expect(scan).toEqual([
				[{}, {}, undefined, undefined],
				[{a: {c: 2}}, {a: {c: 2}}, ['a', 'c'], ['a']],
				[{a: {b: 3}}, {a: {b: 3}}, ['a', 'c'], ['a']],
				[{a: {c: 3}}, {a: {c: 3}}, ['a', 'c'], ['a']],
				[{a: {c: 4}}, {a: {c: 4}}, ['a', 'c'], ['a', 'c']],
				[{a: {c: 5}}, {a: {c: 5}}, ['a', 'c'], ['a', 'c']]
			]);
		});

		test('with deep watching', async ({page}) => {
			const target = await renderWatchDummy(page);

			const scan = await target.evaluate(async (ctx) => {
				const res: any[] = [];

				ctx.watch(ctx.mountedWatcher, {deep: true}, (val, ...args) => {
					res.push([
						Object.fastClone(val),
						Object.fastClone(args[0]),
						args[1].path,
						args[1].originalPath
					]);
				});

				ctx.mountedWatcher.a = {b: {c: 1}};
				ctx.mountedWatcher.a = {b: {c: 2}};
				await ctx.nextTick();

				(<any>ctx.mountedWatcher).a.b.c++;
				await ctx.nextTick();

				(<any>ctx.mountedWatcher).a.b = {d: 1};
				await ctx.nextTick();

				return res;
			});

			test.expect(scan).toEqual([
				[
					{a: {b: {c: 2}}},
					{a: {b: {c: 2}}},
					['a'],
					['a']
				],

				[
					{a: {b: {c: 3}}},
					{a: {b: {c: 3}}},
					['a', 'b', 'c'],
					['a', 'b', 'c']
				],

				[
					{a: {b: {d: 1}}},
					{a: {b: {d: 1}}},
					['a', 'b'],
					['a', 'b']
				]
			]);
		});

		test('with deep watching without collapsing', async ({page}) => {
			const target = await renderWatchDummy(page);

			const scan = await target.evaluate(async (ctx) => {
				const res: any[] = [];

				ctx.watch(ctx.mountedWatcher, {deep: true, collapse: false}, (mutations) => {
					mutations.forEach(([val, oldVal, i]) => {
						res.push([
							Object.fastClone(val),
							Object.fastClone(oldVal),
							i.path,
							i.originalPath
						]);
					});
				});

				ctx.mountedWatcher.a = {b: {c: 1}};
				ctx.mountedWatcher.a = {b: {c: 2}};
				await ctx.nextTick();

				(<any>ctx.mountedWatcher).a.b.c++;
				await ctx.nextTick();

				(<any>ctx.mountedWatcher).a.b = {d: 1};
				await ctx.nextTick();

				return res;
			});

			test.expect(scan).toEqual([
				[{b: {c: 1}}, undefined, ['a'], ['a']],
				[{b: {c: 2}}, {b: {c: 1}}, ['a'], ['a']],
				[3, 2, ['a', 'b', 'c'], ['a', 'b', 'c']],
				[{d: 1}, {c: 3}, ['a', 'b'], ['a', 'b']]
			]);
		});

		test('with deep immediate watching', async ({page}) => {
			const target = await renderWatchDummy(page);

			const scan = await target.evaluate(async (ctx) => {
				const res: any[] = [];

				ctx.watch(ctx.mountedWatcher, {deep: true, flush: 'sync', immediate: true}, (val, ...args) => {
					res.push([
						Object.fastClone(val),
						Object.fastClone(args[0]),
						args[1]?.path,
						args[1]?.originalPath
					]);
				});

				ctx.mountedWatcher.a = {b: {c: 1}};
				ctx.mountedWatcher.a = {b: {c: 2}};
				await ctx.nextTick();

				(<any>ctx.mountedWatcher).a.b.c++;
				await ctx.nextTick();

				(<any>ctx.mountedWatcher).a.b = {d: 1};
				await ctx.nextTick();

				return res;
			});

			test.expect(scan).toEqual([
				[{}, {}, undefined, undefined],
				[{a: {b: {c: 1}}}, {a: {b: {c: 1}}}, ['a'], ['a']],
				[{a: {b: {c: 2}}}, {a: {b: {c: 2}}}, ['a'], ['a']],
				[
					{a: {b: {c: 3}}},
					{a: {b: {c: 3}}},
					['a', 'b', 'c'],
					['a', 'b', 'c']
				],
				[
					{a: {b: {d: 1}}},
					{a: {b: {d: 1}}},
					['a', 'b'],
					['a', 'b']
				]
			]);
		});

		test('with deep immediate watching without collapsing', async ({page}) => {
			const target = await renderWatchDummy(page);

			const scan = await target.evaluate(async (ctx) => {
				const res: any[] = [];

				ctx.watch(ctx.mountedWatcher, {deep: true, flush: 'sync', immediate: true, collapse: false}, (val, ...args) => {
					res.push([
						Object.fastClone(val),
						Object.fastClone(args[0]),
						args[1]?.path,
						args[1]?.originalPath
					]);
				});

				ctx.mountedWatcher.a = {b: {c: 1}};
				ctx.mountedWatcher.a = {b: {c: 2}};
				await ctx.nextTick();

				(<any>ctx.mountedWatcher).a.b.c++;
				await ctx.nextTick();

				(<any>ctx.mountedWatcher).a.b = {d: 1};
				await ctx.nextTick();

				return res;
			});

			test.expect(scan).toEqual([
				[{}, undefined, undefined, undefined],
				[{b: {c: 1}}, undefined, ['a'], ['a']],
				[{b: {c: 2}}, {b: {c: 1}}, ['a'], ['a']],
				[3, 2, ['a', 'b', 'c'], ['a', 'b', 'c']],
				[{d: 1}, {c: 3}, ['a', 'b'], ['a', 'b']]
			]);
		});
	});

	test.describe('should clone old value when the handler has more than one argument', () => {
		test('with non-deep watching', async ({page}) => {
			const target = await renderWatchDummy(page);

			const scan = await target.evaluate(async (ctx) => {
				const res: any[] = [];

				ctx.watch(ctx.mountedArrayWatcher, (val, oldVal, i) => {
					res.push([
						Object.fastClone(val),
						Object.fastClone(oldVal),
						val === oldVal,
						i.originalPath
					]);
				});

				ctx.mountedArrayWatcher.push(1);
				ctx.mountedArrayWatcher.push(2);
				await ctx.nextTick();

				ctx.mountedArrayWatcher.push(3);
				await ctx.nextTick();

				ctx.mountedArrayWatcher.pop();
				ctx.mountedArrayWatcher.shift();
				await ctx.nextTick();

				return res;
			});

			test.expect(scan).toEqual([
				[[1, 2], [], false, [1]],
				[[1, 2, 3], [1, 2], false, [2]],
				[[2], [1, 2, 3], false, ['length']]
			]);
		});

		test('with non-deep immediate watching', async ({page}) => {
			const target = await renderWatchDummy(page);

			const scan = await target.evaluate(async (ctx) => {
				const res: any[] = [];

				ctx.watch(ctx.mountedArrayWatcher, {flush: 'sync', immediate: true}, (val, oldVal, i) => {
					res.push([
						Object.fastClone(val),
						Object.fastClone(oldVal),
						val === oldVal,
						i?.originalPath
					]);
				});

				ctx.mountedArrayWatcher.push(1);
				ctx.mountedArrayWatcher.push(2);
				await ctx.nextTick();

				ctx.mountedArrayWatcher.push(3);
				await ctx.nextTick();

				ctx.mountedArrayWatcher.pop();
				ctx.mountedArrayWatcher.shift();
				await ctx.nextTick();

				return res;
			});

			test.expect(scan).toEqual([
				[[], undefined, false, undefined],
				[[1], [], false, [0]],
				[[1, 2], [1], false, [1]],
				[[1, 2, 3], [1, 2], false, [2]],
				[[1, 2], [1, 2, 3], false, ['length']],
				[[2, 2], [1, 2], false, [0]],
				[[2], [2, 2], false, ['length']]
			]);
		});

		test('with non-deep immediate watching without collapsing', async ({page}) => {
			const target = await renderWatchDummy(page);

			const scan = await target.evaluate(async (ctx) => {
				const res: any[] = [];

				ctx.watch(ctx.mountedArrayWatcher, {flush: 'sync', immediate: true, collapse: false}, (val, oldVal, i) => {
					res.push([
						Object.fastClone(val),
						Object.fastClone(oldVal),
						val === oldVal,
						i?.originalPath
					]);
				});

				ctx.mountedArrayWatcher.push(1);
				ctx.mountedArrayWatcher.push(2);
				await ctx.nextTick();

				ctx.mountedArrayWatcher.push(3);
				await ctx.nextTick();

				ctx.mountedArrayWatcher.pop();
				ctx.mountedArrayWatcher.shift();
				await ctx.nextTick();

				return res;
			});

			test.expect(scan).toEqual([
				[[], undefined, false, undefined],
				[1, undefined, false, [0]],
				[2, undefined, false, [1]],
				[3, undefined, false, [2]],
				[2, 3, false, ['length']],
				[2, 1, false, [0]],
				[1, 2, false, ['length']]
			]);
		});

		test('with deep watching', async ({page}) => {
			const target = await renderWatchDummy(page);

			const scan = await target.evaluate(async (ctx) => {
				const res: any[] = [];

				ctx.watch(ctx.mountedWatcher, {deep: true}, (val, oldVal, i) => {
					res.push([
						Object.fastClone(val),
						Object.fastClone(oldVal),
						val === oldVal,
						i.originalPath
					]);
				});

				ctx.mountedWatcher.a = {b: {c: 1}};
				ctx.mountedWatcher.a = {b: {c: 2}};
				await ctx.nextTick();

				(<any>ctx.mountedWatcher).a.b.c++;
				await ctx.nextTick();

				(<any>ctx.mountedWatcher).a.b = {d: 1};
				await ctx.nextTick();

				return res;
			});

			test.expect(scan).toEqual([
				[
					{a: {b: {c: 2}}},
					{},
					false,
					['a']
				],

				[
					{a: {b: {c: 3}}},
					{a: {b: {c: 2}}},
					false,
					['a', 'b', 'c']
				],

				[
					{a: {b: {d: 1}}},
					{a: {b: {c: 3}}},
					false,
					['a', 'b']
				]
			]);
		});

		test('with the specified path being watched', async ({page}) => {
			const target = await renderWatchDummy(page);

			const scan = await target.evaluate(async (ctx) => {
				const res: any[] = [];

				ctx.watch({ctx: ctx.mountedWatcher, path: 'a.c'}, (val, oldVal, i) => {
					res.push([
						Object.fastClone(val),
						Object.fastClone(oldVal),
						val === oldVal,
						i.originalPath
					]);
				});

				ctx.mountedWatcher.a = {b: 1};
				ctx.mountedWatcher.a = {c: 2};
				await ctx.nextTick();

				ctx.mountedWatcher.a = {b: 3};
				await ctx.nextTick();

				ctx.mountedWatcher.a = {c: 3};
				await ctx.nextTick();

				(<any>ctx.mountedWatcher).a.c++;
				(<any>ctx.mountedWatcher).a.c++;
				await ctx.nextTick();

				return res;
			});

			test.expect(scan).toEqual([
				[{a: {c: 2}}, {}, false, ['a']],
				[{a: {b: 3}}, {a: {c: 2}}, false, ['a']],
				[{a: {c: 3}}, {a: {b: 3}}, false, ['a']],
				[{a: {c: 5}}, {a: {c: 3}}, false, ['a', 'c']]
			]);
		});

		test('with the specified path being immediate watched', async ({page}) => {
			const target = await renderWatchDummy(page);

			const scan = await target.evaluate((ctx) => {
				const res: any[] = [];

				ctx.watch({ctx: ctx.mountedWatcher, path: ['a', 'c']}, {flush: 'sync', immediate: true}, (val, oldVal, i) => {
					res.push([
						Object.fastClone(val),
						Object.fastClone(oldVal),
						val === oldVal,
						i?.originalPath
					]);
				});

				ctx.mountedWatcher.a = {b: 1};
				ctx.mountedWatcher.a = {c: 2};

				ctx.mountedWatcher.a = {b: 3};

				ctx.mountedWatcher.a = {c: 3};

				(<any>ctx.mountedWatcher).a.c++;
				(<any>ctx.mountedWatcher).a.c++;

				return res;
			});

			test.expect(scan).toEqual([
				[{}, undefined, false, undefined],
				[{a: {c: 2}}, {}, false, ['a']],
				[{a: {b: 3}}, {a: {c: 2}}, false, ['a']],
				[{a: {c: 3}}, {a: {b: 3}}, false, ['a']],
				[{a: {c: 4}}, {a: {c: 3}}, false, ['a', 'c']],
				[{a: {c: 5}}, {a: {c: 4}}, false, ['a', 'c']]
			]);
		});

		test('with deep immediate watching', async ({page}) => {
			const target = await renderWatchDummy(page);

			const scan = await target.evaluate(async (ctx) => {
				const res: any[] = [];

				ctx.watch(ctx.mountedWatcher, {deep: true, flush: 'sync', immediate: true}, (val, oldVal, i) => {
					res.push([
						Object.fastClone(val),
						Object.fastClone(oldVal),
						val === oldVal,
						i?.originalPath
					]);
				});

				ctx.mountedWatcher.a = {b: {c: 1}};
				ctx.mountedWatcher.a = {b: {c: 2}};
				await ctx.nextTick();

				(<any>ctx.mountedWatcher).a.b.c++;
				await ctx.nextTick();

				(<any>ctx.mountedWatcher).a.b = {d: 1};
				await ctx.nextTick();

				return res;
			});

			test.expect(scan).toEqual([
				[{}, undefined, false, undefined],

				[
					{a: {b: {c: 1}}},
					{},
					false,
					['a']
				],

				[
					{a: {b: {c: 2}}},
					{a: {b: {c: 1}}},
					false,
					['a']
				],

				[
					{a: {b: {c: 3}}},
					{a: {b: {c: 2}}},
					false,
					['a', 'b', 'c']
				],

				[
					{a: {b: {d: 1}}},
					{a: {b: {c: 3}}},
					false,
					['a', 'b']
				]
			]);
		});

		test('with deep immediate watching without collapsing', async ({page}) => {
			const target = await renderWatchDummy(page);

			const scan = await target.evaluate(async (ctx) => {
				const res: any[] = [];

				ctx.watch(ctx.mountedWatcher, {deep: true, flush: 'sync', immediate: true, collapse: false}, (val, oldVal, i) => {
					res.push([
						Object.fastClone(val),
						Object.fastClone(oldVal),
						val === oldVal,
						i?.originalPath
					]);
				});

				ctx.mountedWatcher.a = {b: {c: 1}};
				ctx.mountedWatcher.a = {b: {c: 2}};
				await ctx.nextTick();

				(<any>ctx.mountedWatcher).a.b.c++;
				await ctx.nextTick();

				(<any>ctx.mountedWatcher).a.b = {d: 1};
				await ctx.nextTick();

				return res;
			});

			test.expect(scan).toEqual([
				[{}, undefined, false, undefined],
				[{b: {c: 1}}, undefined, false, ['a']],
				[{b: {c: 2}}, {b: {c: 1}}, false, ['a']],
				[3, 2, false, ['a', 'b', 'c']],
				[{d: 1}, {c: 3}, false, ['a', 'b']]
			]);
		});
	});
});
