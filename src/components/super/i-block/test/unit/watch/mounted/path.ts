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

test.describe('<i-block> watch - mounted objects passed by a path', () => {
	test.beforeEach(async ({demoPage}) => {
		await demoPage.goto();
	});

	test.describe('should not clone old value when the handler has one argument', () => {
		test('with non-deep watching', async ({page}) => {
			const target = await renderWatchDummy(page);

			const scan = await target.evaluate(async (ctx) => {
				const res: any[] = [];

				ctx.watch('mountedArrayWatcher', (val, ...args) => {
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
				[
					[1, 2],
					[1, 2],
					['mountedArrayWatcher'],
					['mountedArrayWatcher']
				],

				[
					[1, 2, 3],
					[1, 2, 3],
					['mountedArrayWatcher'],
					['mountedArrayWatcher']
				],

				[
					[2],
					[2],
					['mountedArrayWatcher'],
					['mountedArrayWatcher']
				]
			]);
		});

		test('with non-deep watching without collapsing', async ({page}) => {
			const target = await renderWatchDummy(page);

			const scan = await target.evaluate(async (ctx) => {
				const res: any[] = [];

				ctx.watch('mountedArrayWatcher', {collapse: false}, (mutations) => {
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
				[
					1,
					undefined,
					['mountedArrayWatcher', 0],
					['mountedArrayWatcher', 0]
				],

				[
					2,
					undefined,
					['mountedArrayWatcher', 1],
					['mountedArrayWatcher', 1]
				],

				[
					3,
					undefined,
					['mountedArrayWatcher', 2],
					['mountedArrayWatcher', 2]
				],

				[
					2,
					3,
					['mountedArrayWatcher', 'length'],
					['mountedArrayWatcher', 'length']
				],

				[
					2,
					1,
					['mountedArrayWatcher', 0],
					['mountedArrayWatcher', 0]
				],

				[
					1,
					2,
					['mountedArrayWatcher', 'length'],
					['mountedArrayWatcher', 'length']
				]
			]);
		});

		test('with non-deep immediate watching', async ({page}) => {
			const target = await renderWatchDummy(page);

			const scan = await target.evaluate(async (ctx) => {
				const res: any[] = [];

				ctx.watch('mountedArrayWatcher', {flush: 'sync', immediate: true}, (val, ...args) => {
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

				[
					[1],
					[1],
					['mountedArrayWatcher'],
					['mountedArrayWatcher']
				],

				[
					[1, 2],
					[1, 2],
					['mountedArrayWatcher'],
					['mountedArrayWatcher']
				],

				[
					[1, 2, 3],
					[1, 2, 3],
					['mountedArrayWatcher'],
					['mountedArrayWatcher']
				],

				[
					[1, 2],
					[1, 2],
					['mountedArrayWatcher'],
					['mountedArrayWatcher']
				],

				[
					[2, 2],
					[2, 2],
					['mountedArrayWatcher'],
					['mountedArrayWatcher']
				],

				[
					[2],
					[2],
					['mountedArrayWatcher'],
					['mountedArrayWatcher']
				]
			]);
		});

		test('with non-deep immediate watching without collapsing', async ({page}) => {
			const target = await renderWatchDummy(page);

			const scan = await target.evaluate(async (ctx) => {
				const res: any[] = [];

				ctx.watch('mountedArrayWatcher', {flush: 'sync', immediate: true, collapse: false}, (val, ...args) => {
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

				[
					1,
					undefined,
					['mountedArrayWatcher', 0],
					['mountedArrayWatcher', 0]
				],

				[
					2,
					undefined,
					['mountedArrayWatcher', 1],
					['mountedArrayWatcher', 1]
				],

				[
					3,
					undefined,
					['mountedArrayWatcher', 2],
					['mountedArrayWatcher', 2]
				],

				[
					2,
					3,
					['mountedArrayWatcher', 'length'],
					['mountedArrayWatcher', 'length']
				],

				[
					2,
					1,
					['mountedArrayWatcher', 0],
					['mountedArrayWatcher', 0]
				],

				[
					1,
					2,
					['mountedArrayWatcher', 'length'],
					['mountedArrayWatcher', 'length']
				]
			]);
		});

		test('with the specified path being watched', async ({page}) => {
			const target = await renderWatchDummy(page);

			const scan = await target.evaluate(async (ctx) => {
				const res: any[] = [];

				ctx.watch('mountedWatcher.a.c', (val, ...args) => {
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
				[
					{a: {c: 2}},
					{a: {c: 2}},
					['mountedWatcher'],
					['mountedWatcher']
				],

				[
					{a: {b: 3}},
					{a: {b: 3}},
					['mountedWatcher'],
					['mountedWatcher']
				],

				[
					{a: {c: 3}},
					{a: {c: 3}},
					['mountedWatcher'],
					['mountedWatcher']
				],

				[
					{a: {c: 5}},
					{a: {c: 5}},
					['mountedWatcher'],
					['mountedWatcher']
				]
			]);
		});

		test('with a computed field being watched', async ({page}) => {
			const target = await renderWatchDummy(page);

			const scan = await target.evaluate(async (ctx) => {
				const res: any[] = [];

				ctx.watch('mountedComputed', (val, ...args) => {
					res.push([
						Object.fastClone(val),
						Object.fastClone(args[0]),
						args[1].path,
						args[1].originalPath
					]);
				});

				ctx.mountedWatcher.a = {b: 1};
				await ctx.nextTick();

				return res;
			});

			test.expect(scan).toEqual([
				[
					{a: {b: 1}},
					undefined,
					['mountedComputed'],
					['mountedWatcher', 'a']
				]
			]);
		});

		test('with the specified path being immediate watched', async ({page}) => {
			const target = await renderWatchDummy(page);

			const scan = await target.evaluate((ctx) => {
				const res: any[] = [];

				ctx.watch('mountedWatcher.a.c', {flush: 'sync', immediate: true}, (val, ...args) => {
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

				[
					{a: {c: 2}},
					{a: {c: 2}},
					['mountedWatcher'],
					['mountedWatcher']
				],

				[
					{a: {b: 3}},
					{a: {b: 3}},
					['mountedWatcher'],
					['mountedWatcher']
				],

				[
					{a: {c: 3}},
					{a: {c: 3}},
					['mountedWatcher'],
					['mountedWatcher']
				],

				[
					{a: {c: 4}},
					{a: {c: 4}},
					['mountedWatcher'],
					['mountedWatcher']
				],

				[
					{a: {c: 5}},
					{a: {c: 5}},
					['mountedWatcher'],
					['mountedWatcher']
				]
			]);
		});

		test('with deep watching', async ({page}) => {
			const target = await renderWatchDummy(page);

			const scan = await target.evaluate(async (ctx) => {
				const res: any[] = [];

				ctx.watch('mountedWatcher', {deep: true}, (val, ...args) => {
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
					['mountedWatcher'],
					['mountedWatcher']
				],

				[
					{a: {b: {c: 3}}},
					{a: {b: {c: 3}}},
					['mountedWatcher'],
					['mountedWatcher']
				],

				[
					{a: {b: {d: 1}}},
					{a: {b: {d: 1}}},
					['mountedWatcher'],
					['mountedWatcher']
				]
			]);
		});

		test('with deep watching without collapsing', async ({page}) => {
			const target = await renderWatchDummy(page);

			const scan = await target.evaluate(async (ctx) => {
				const res: any[] = [];

				ctx.watch('mountedWatcher', {deep: true, collapse: false}, (mutations) => {
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
				[
					{b: {c: 1}},
					undefined,
					['mountedWatcher', 'a'],
					['mountedWatcher', 'a']
				],

				[
					{b: {c: 2}},
					{b: {c: 1}},
					['mountedWatcher', 'a'],
					['mountedWatcher', 'a']
				],

				[
					3,
					2,
					['mountedWatcher', 'a', 'b', 'c'],
					['mountedWatcher', 'a', 'b', 'c']
				],

				[
					{d: 1},
					{c: 3},
					['mountedWatcher', 'a', 'b'],
					['mountedWatcher', 'a', 'b']
				]
			]);
		});

		test('with deep immediate watching', async ({page}) => {
			const target = await renderWatchDummy(page);

			const scan = await target.evaluate(async (ctx) => {
				const res: any[] = [];

				ctx.watch('mountedWatcher', {deep: true, flush: 'sync', immediate: true}, (val, ...args) => {
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

				[
					{a: {b: {c: 1}}},
					{a: {b: {c: 1}}},
					['mountedWatcher'],
					['mountedWatcher']
				],

				[
					{a: {b: {c: 2}}},
					{a: {b: {c: 2}}},
					['mountedWatcher'],
					['mountedWatcher']
				],

				[
					{a: {b: {c: 3}}},
					{a: {b: {c: 3}}},
					['mountedWatcher'],
					['mountedWatcher']
				],

				[
					{a: {b: {d: 1}}},
					{a: {b: {d: 1}}},
					['mountedWatcher'],
					['mountedWatcher']
				]
			]);
		});

		test('with deep immediate watching without collapsing', async ({page}) => {
			const target = await renderWatchDummy(page);

			const scan = await target.evaluate(async (ctx) => {
				const res: any[] = [];

				ctx.watch('mountedWatcher', {deep: true, flush: 'sync', immediate: true, collapse: false}, (val, ...args) => {
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

				[
					{b: {c: 1}},
					undefined,
					['mountedWatcher', 'a'],
					['mountedWatcher', 'a']
				],

				[
					{b: {c: 2}},
					{b: {c: 1}},
					['mountedWatcher', 'a'],
					['mountedWatcher', 'a']
				],

				[
					3,
					2,
					['mountedWatcher', 'a', 'b', 'c'],
					['mountedWatcher', 'a', 'b', 'c']
				],

				[
					{d: 1},
					{c: 3},
					['mountedWatcher', 'a', 'b'],
					['mountedWatcher', 'a', 'b']
				]
			]);
		});
	});

	test.describe('should clone old value when the handler has more than one argument', () => {
		test('with non-deep watching', async ({page}) => {
			const target = await renderWatchDummy(page);

			const scan = await target.evaluate(async (ctx) => {
				const res: any[] = [];

				ctx.watch('mountedArrayWatcher', (val, oldVal, i) => {
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
				[[1, 2], [], false, ['mountedArrayWatcher']],
				[[1, 2, 3], [1, 2], false, ['mountedArrayWatcher']],
				[[2], [1, 2, 3], false, ['mountedArrayWatcher']]
			]);
		});

		test('with non-deep immediate watching', async ({page}) => {
			const target = await renderWatchDummy(page);

			const scan = await target.evaluate(async (ctx) => {
				const res: any[] = [];

				ctx.watch('mountedArrayWatcher', {flush: 'sync', immediate: true}, (val, oldVal, i) => {
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

				[
					[1],
					[],
					false,
					['mountedArrayWatcher']
				],

				[
					[1, 2],
					[1],
					false,
					['mountedArrayWatcher']
				],

				[
					[1, 2, 3],
					[1, 2],
					false,
					['mountedArrayWatcher']
				],

				[
					[1, 2],
					[1, 2, 3],
					false,
					['mountedArrayWatcher']
				],

				[
					[2, 2],
					[1, 2],
					false,
					['mountedArrayWatcher']
				],

				[
					[2],
					[2, 2],
					false,
					['mountedArrayWatcher']
				]
			]);
		});

		test('with non-deep immediate watching without collapsing', async ({page}) => {
			const target = await renderWatchDummy(page);

			const scan = await target.evaluate(async (ctx) => {
				const res: any[] = [];

				ctx.watch('mountedArrayWatcher', {flush: 'sync', immediate: true, collapse: false}, (val, oldVal, i) => {
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

				[
					1,
					undefined,
					false,
					['mountedArrayWatcher', 0]
				],

				[
					2,
					undefined,
					false,
					['mountedArrayWatcher', 1]
				],

				[
					3,
					undefined,
					false,
					['mountedArrayWatcher', 2]
				],

				[
					2,
					3,
					false,
					['mountedArrayWatcher', 'length']
				],

				[
					2,
					1,
					false,
					['mountedArrayWatcher', 0]
				],

				[
					1,
					2,
					false,
					['mountedArrayWatcher', 'length']
				]
			]);
		});

		test('with the specified path being watched', async ({page}) => {
			const target = await renderWatchDummy(page);

			const scan = await target.evaluate(async (ctx) => {
				const res: any[] = [];

				ctx.watch('mountedWatcher.a.c', (val, oldVal, i) => {
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
				[{a: {c: 2}}, {}, false, ['mountedWatcher']],
				[{a: {b: 3}}, {a: {c: 2}}, false, ['mountedWatcher']],
				[{a: {c: 3}}, {a: {b: 3}}, false, ['mountedWatcher']],
				[{a: {c: 5}}, {a: {c: 3}}, false, ['mountedWatcher']]
			]);
		});

		test('with the specified path being immediate watched', async ({page}) => {
			const target = await renderWatchDummy(page);

			const scan = await target.evaluate((ctx) => {
				const res: any[] = [];

				ctx.watch('mountedWatcher.a.c', {flush: 'sync', immediate: true}, (val, oldVal, i) => {
					res.push([
						Object.fastClone(val),
						Object.fastClone(oldVal),
						i?.path,
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
				[{}, undefined, undefined, undefined],

				[
					{a: {c: 2}},
					{},
					['mountedWatcher'],
					['mountedWatcher']
				],

				[
					{a: {b: 3}},
					{a: {c: 2}},
					['mountedWatcher'],
					['mountedWatcher']
				],

				[
					{a: {c: 3}},
					{a: {b: 3}},
					['mountedWatcher'],
					['mountedWatcher']
				],

				[
					{a: {c: 4}},
					{a: {c: 3}},
					['mountedWatcher'],
					['mountedWatcher']
				],

				[
					{a: {c: 5}},
					{a: {c: 4}},
					['mountedWatcher'],
					['mountedWatcher']
				]
			]);
		});

		test('with deep watching', async ({page}) => {
			const target = await renderWatchDummy(page);

			const scan = await target.evaluate(async (ctx) => {
				const res: any[] = [];

				ctx.watch('mountedWatcher', {deep: true}, (val, oldVal, i) => {
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
					['mountedWatcher']
				],

				[
					{a: {b: {c: 3}}},
					{a: {b: {c: 2}}},
					false,
					['mountedWatcher']
				],

				[
					{a: {b: {d: 1}}},
					{a: {b: {c: 3}}},
					false,
					['mountedWatcher']
				]
			]);
		});

		test('with deep immediate watching', async ({page}) => {
			const target = await renderWatchDummy(page);

			const scan = await target.evaluate(async (ctx) => {
				const res: any[] = [];

				ctx.watch('mountedWatcher', {deep: true, flush: 'sync', immediate: true}, (val, oldVal, i) => {
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
					['mountedWatcher']
				],

				[
					{a: {b: {c: 2}}},
					{a: {b: {c: 1}}},
					false,
					['mountedWatcher']
				],

				[
					{a: {b: {c: 3}}},
					{a: {b: {c: 2}}},
					false,
					['mountedWatcher']
				],

				[
					{a: {b: {d: 1}}},
					{a: {b: {c: 3}}},
					false,
					['mountedWatcher']
				]
			]);
		});

		test('with deep immediate watching without collapsing', async ({page}) => {
			const target = await renderWatchDummy(page);

			const scan = await target.evaluate(async (ctx) => {
				const res: any[] = [];

				ctx.watch('mountedWatcher', {deep: true, flush: 'sync', immediate: true, collapse: false}, (val, oldVal, i) => {
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
					{b: {c: 1}},
					undefined,
					false,
					['mountedWatcher', 'a']
				],

				[
					{b: {c: 2}},
					{b: {c: 1}},
					false,
					['mountedWatcher', 'a']
				],

				[
					3,
					2,
					false,
					['mountedWatcher', 'a', 'b', 'c']
				],

				[
					{d: 1},
					{c: 3},
					false,
					['mountedWatcher', 'a', 'b']
				]
			]);
		});
	});
});
