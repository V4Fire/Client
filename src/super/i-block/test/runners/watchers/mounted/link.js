/* eslint-disable max-lines,max-lines-per-function */

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

	describe('i-block watching for mounted objects passed by links', () => {
		describe('without caching of old values', () => {
			it('non-deep watching', async () => {
				const
					target = await init();

				const scan = await target.evaluate(async (ctx) => {
					const res = [];

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

				expect(scan).toEqual([
					[[1, 2], [1, 2], [1], [1]],
					[[1, 2, 3], [1, 2, 3], [2], [2]],
					[[2], [2], ['length'], ['length']]
				]);
			});

			it('non-deep watching without collapsing', async () => {
				const
					target = await init();

				const scan = await target.evaluate(async (ctx) => {
					const res = [];

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

				expect(scan).toEqual([
					[1, undefined, [0], [0]],
					[2, undefined, [1], [1]],
					[3, undefined, [2], [2]],
					[2, 3, ['length'], ['length']],
					[2, 1, [0], [0]],
					[1, 2, ['length'], ['length']]
				]);
			});

			it('non-deep immediate watching', async () => {
				const
					target = await init();

				const scan = await target.evaluate(async (ctx) => {
					const res = [];

					ctx.watch(ctx.mountedArrayWatcher, {immediate: true}, (val, ...args) => {
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

				expect(scan).toEqual([
					[[], [], undefined, undefined],
					[[1], [1], [0], [0]],
					[[1, 2], [1, 2], [1], [1]],
					[[1, 2, 3], [1, 2, 3], [2], [2]],
					[[1, 2], [1, 2], ['length'], ['length']],
					[[2, 2], [2, 2], [0], [0]],
					[[2], [2], ['length'], ['length']]
				]);
			});

			it('non-deep immediate watching without collapsing', async () => {
				const
					target = await init();

				const scan = await target.evaluate(async (ctx) => {
					const res = [];

					ctx.watch(ctx.mountedArrayWatcher, {immediate: true, collapse: false}, (val, ...args) => {
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

				expect(scan).toEqual([
					[[], undefined, undefined, undefined],
					[1, undefined, [0], [0]],
					[2, undefined, [1], [1]],
					[3, undefined, [2], [2]],
					[2, 3, ['length'], ['length']],
					[2, 1, [0], [0]],
					[1, 2, ['length'], ['length']]
				]);
			});

			it('watching for the specified path', async () => {
				const
					target = await init();

				const scan = await target.evaluate(async (ctx) => {
					const res = [];

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

					ctx.mountedWatcher.a.c++;
					ctx.mountedWatcher.a.c++;
					await ctx.nextTick();

					return res;
				});

				expect(scan).toEqual([
					[{a: {c: 2}}, {a: {c: 2}}, ['a', 'c'], ['a']],
					[{a: {b: 3}}, {a: {b: 3}}, ['a', 'c'], ['a']],
					[{a: {c: 3}}, {a: {c: 3}}, ['a', 'c'], ['a']],
					[{a: {c: 5}}, {a: {c: 5}}, ['a', 'c'], ['a', 'c']]
				]);
			});

			it('immediate watching for the specified path', async () => {
				const
					target = await init();

				const scan = await target.evaluate((ctx) => {
					const res = [];

					ctx.watch({ctx: ctx.mountedWatcher, path: ['a', 'c']}, {immediate: true}, (val, ...args) => {
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

					ctx.mountedWatcher.a.c++;
					ctx.mountedWatcher.a.c++;

					return res;
				});

				expect(scan).toEqual([
					[{}, {}, undefined, undefined],
					[{a: {c: 2}}, {a: {c: 2}}, ['a', 'c'], ['a']],
					[{a: {b: 3}}, {a: {b: 3}}, ['a', 'c'], ['a']],
					[{a: {c: 3}}, {a: {c: 3}}, ['a', 'c'], ['a']],
					[{a: {c: 4}}, {a: {c: 4}}, ['a', 'c'], ['a', 'c']],
					[{a: {c: 5}}, {a: {c: 5}}, ['a', 'c'], ['a', 'c']]
				]);
			});

			it('deep watching', async () => {
				const
					target = await init();

				const scan = await target.evaluate(async (ctx) => {
					const res = [];

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

					ctx.mountedWatcher.a.b.c++;
					await ctx.nextTick();

					ctx.mountedWatcher.a.b = {d: 1};
					await ctx.nextTick();

					return res;
				});

				expect(scan).toEqual([
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

			it('deep watching without collapsing', async () => {
				const
					target = await init();

				const scan = await target.evaluate(async (ctx) => {
					const res = [];

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

					ctx.mountedWatcher.a.b.c++;
					await ctx.nextTick();

					ctx.mountedWatcher.a.b = {d: 1};
					await ctx.nextTick();

					return res;
				});

				expect(scan).toEqual([
					[{b: {c: 1}}, undefined, ['a'], ['a']],
					[{b: {c: 2}}, {b: {c: 1}}, ['a'], ['a']],
					[3, 2, ['a', 'b', 'c'], ['a', 'b', 'c']],
					[{d: 1}, {c: 3}, ['a', 'b'], ['a', 'b']]
				]);
			});

			it('deep immediate watching', async () => {
				const
					target = await init();

				const scan = await target.evaluate(async (ctx) => {
					const res = [];

					ctx.watch(ctx.mountedWatcher, {deep: true, immediate: true}, (val, ...args) => {
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

					ctx.mountedWatcher.a.b.c++;
					await ctx.nextTick();

					ctx.mountedWatcher.a.b = {d: 1};
					await ctx.nextTick();

					return res;
				});

				expect(scan).toEqual([
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

			it('deep immediate watching without collapsing', async () => {
				const
					target = await init();

				const scan = await target.evaluate(async (ctx) => {
					const res = [];

					ctx.watch(ctx.mountedWatcher, {deep: true, immediate: true, collapse: false}, (val, ...args) => {
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

					ctx.mountedWatcher.a.b.c++;
					await ctx.nextTick();

					ctx.mountedWatcher.a.b = {d: 1};
					await ctx.nextTick();

					return res;
				});

				expect(scan).toEqual([
					[{}, undefined, undefined, undefined],
					[{b: {c: 1}}, undefined, ['a'], ['a']],
					[{b: {c: 2}}, {b: {c: 1}}, ['a'], ['a']],
					[3, 2, ['a', 'b', 'c'], ['a', 'b', 'c']],
					[{d: 1}, {c: 3}, ['a', 'b'], ['a', 'b']]
				]);
			});
		});

		describe('with caching of old values', () => {
			it('non-deep watching', async () => {
				const
					target = await init();

				const scan = await target.evaluate(async (ctx) => {
					const res = [];

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

				expect(scan).toEqual([
					[[1, 2], [], false, [1]],
					[[1, 2, 3], [1, 2], false, [2]],
					[[2], [1, 2, 3], false, ['length']]
				]);
			});

			it('non-deep immediate watching', async () => {
				const
					target = await init();

				const scan = await target.evaluate(async (ctx) => {
					const res = [];

					ctx.watch(ctx.mountedArrayWatcher, {immediate: true}, (val, oldVal, i) => {
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

				expect(scan).toEqual([
					[[], undefined, false, undefined],
					[[1], [], false, [0]],
					[[1, 2], [1], false, [1]],
					[[1, 2, 3], [1, 2], false, [2]],
					[[1, 2], [1, 2, 3], false, ['length']],
					[[2, 2], [1, 2], false, [0]],
					[[2], [2, 2], false, ['length']]
				]);
			});

			it('non-deep immediate watching without collapsing', async () => {
				const
					target = await init();

				const scan = await target.evaluate(async (ctx) => {
					const res = [];

					ctx.watch(ctx.mountedArrayWatcher, {immediate: true, collapse: false}, (val, oldVal, i) => {
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

				expect(scan).toEqual([
					[[], undefined, false, undefined],
					[1, undefined, false, [0]],
					[2, undefined, false, [1]],
					[3, undefined, false, [2]],
					[2, 3, false, ['length']],
					[2, 1, false, [0]],
					[1, 2, false, ['length']]
				]);
			});

			it('deep watching', async () => {
				const
					target = await init();

				const scan = await target.evaluate(async (ctx) => {
					const res = [];

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

					ctx.mountedWatcher.a.b.c++;
					await ctx.nextTick();

					ctx.mountedWatcher.a.b = {d: 1};
					await ctx.nextTick();

					return res;
				});

				expect(scan).toEqual([
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

			it('watching for the specified path', async () => {
				const
					target = await init();

				const scan = await target.evaluate(async (ctx) => {
					const res = [];

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

					ctx.mountedWatcher.a.c++;
					ctx.mountedWatcher.a.c++;
					await ctx.nextTick();

					return res;
				});

				expect(scan).toEqual([
					[{a: {c: 2}}, {}, false, ['a']],
					[{a: {b: 3}}, {a: {c: 2}}, false, ['a']],
					[{a: {c: 3}}, {a: {b: 3}}, false, ['a']],
					[{a: {c: 5}}, {a: {c: 3}}, false, ['a', 'c']]
				]);
			});

			it('immediate watching for the specified path', async () => {
				const
					target = await init();

				const scan = await target.evaluate((ctx) => {
					const res = [];

					ctx.watch({ctx: ctx.mountedWatcher, path: ['a', 'c']}, {immediate: true}, (val, oldVal, i) => {
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

					ctx.mountedWatcher.a.c++;
					ctx.mountedWatcher.a.c++;

					return res;
				});

				expect(scan).toEqual([
					[{}, undefined, false, undefined],
					[{a: {c: 2}}, {}, false, ['a']],
					[{a: {b: 3}}, {a: {c: 2}}, false, ['a']],
					[{a: {c: 3}}, {a: {b: 3}}, false, ['a']],
					[{a: {c: 4}}, {a: {c: 3}}, false, ['a', 'c']],
					[{a: {c: 5}}, {a: {c: 4}}, false, ['a', 'c']]
				]);
			});

			it('deep immediate watching', async () => {
				const
					target = await init();

				const scan = await target.evaluate(async (ctx) => {
					const res = [];

					ctx.watch(ctx.mountedWatcher, {deep: true, immediate: true}, (val, oldVal, i) => {
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

					ctx.mountedWatcher.a.b.c++;
					await ctx.nextTick();

					ctx.mountedWatcher.a.b = {d: 1};
					await ctx.nextTick();

					return res;
				});

				expect(scan).toEqual([
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

			it('deep immediate watching without collapsing', async () => {
				const
					target = await init();

				const scan = await target.evaluate(async (ctx) => {
					const res = [];

					ctx.watch(ctx.mountedWatcher, {deep: true, immediate: true, collapse: false}, (val, oldVal, i) => {
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

					ctx.mountedWatcher.a.b.c++;
					await ctx.nextTick();

					ctx.mountedWatcher.a.b = {d: 1};
					await ctx.nextTick();

					return res;
				});

				expect(scan).toEqual([
					[{}, undefined, false, undefined],
					[{b: {c: 1}}, undefined, false, ['a']],
					[{b: {c: 2}}, {b: {c: 1}}, false, ['a']],
					[3, 2, false, ['a', 'b', 'c']],
					[{d: 1}, {c: 3}, false, ['a', 'b']]
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
