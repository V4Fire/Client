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

	describe('i-block watching for mounted objects passed by paths', () => {
		describe('without caching of old values', () => {
			it('non-deep watching', async () => {
				const
					target = await init();

				const scan = await target.evaluate(async (ctx) => {
					const res = [];

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

				expect(scan).toEqual([
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

			it('non-deep watching without collapsing', async () => {
				const
					target = await init();

				const scan = await target.evaluate(async (ctx) => {
					const res = [];

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

				expect(scan).toEqual([
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

			it('non-deep immediate watching', async () => {
				const
					target = await init();

				const scan = await target.evaluate(async (ctx) => {
					const res = [];

					ctx.watch('mountedArrayWatcher', {immediate: true}, (val, ...args) => {
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

			it('non-deep immediate watching without collapsing', async () => {
				const
					target = await init();

				const scan = await target.evaluate(async (ctx) => {
					const res = [];

					ctx.watch('mountedArrayWatcher', {immediate: true, collapse: false}, (val, ...args) => {
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

			it('watching for the specified path', async () => {
				const
					target = await init();

				const scan = await target.evaluate(async (ctx) => {
					const res = [];

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

					ctx.mountedWatcher.a.c++;
					ctx.mountedWatcher.a.c++;
					await ctx.nextTick();

					return res;
				});

				expect(scan).toEqual([
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

			it('immediate watching for the specified path', async () => {
				const
					target = await init();

				const scan = await target.evaluate((ctx) => {
					const res = [];

					ctx.watch('mountedWatcher.a.c', {immediate: true}, (val, ...args) => {
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

			it('deep watching', async () => {
				const
					target = await init();

				const scan = await target.evaluate(async (ctx) => {
					const res = [];

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

			it('deep watching without collapsing', async () => {
				const
					target = await init();

				const scan = await target.evaluate(async (ctx) => {
					const res = [];

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

					ctx.mountedWatcher.a.b.c++;
					await ctx.nextTick();

					ctx.mountedWatcher.a.b = {d: 1};
					await ctx.nextTick();

					return res;
				});

				expect(scan).toEqual([
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

			it('deep immediate watching', async () => {
				const
					target = await init();

				const scan = await target.evaluate(async (ctx) => {
					const res = [];

					ctx.watch('mountedWatcher', {deep: true, immediate: true}, (val, ...args) => {
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

			it('deep immediate watching without collapsing', async () => {
				const
					target = await init();

				const scan = await target.evaluate(async (ctx) => {
					const res = [];

					ctx.watch('mountedWatcher', {deep: true, immediate: true, collapse: false}, (val, ...args) => {
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

		describe('with caching of old values', () => {
			it('non-deep watching', async () => {
				const
					target = await init();

				const scan = await target.evaluate(async (ctx) => {
					const res = [];

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

				expect(scan).toEqual([
					[[1, 2], [], false, ['mountedArrayWatcher']],
					[[1, 2, 3], [1, 2], false, ['mountedArrayWatcher']],
					[[2], [1, 2, 3], false, ['mountedArrayWatcher']]
				]);
			});

			it('non-deep immediate watching', async () => {
				const
					target = await init();

				const scan = await target.evaluate(async (ctx) => {
					const res = [];

					ctx.watch('mountedArrayWatcher', {immediate: true}, (val, oldVal, i) => {
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

			it('non-deep immediate watching without collapsing', async () => {
				const
					target = await init();

				const scan = await target.evaluate(async (ctx) => {
					const res = [];

					ctx.watch('mountedArrayWatcher', {immediate: true, collapse: false}, (val, oldVal, i) => {
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

			it('watching for the specified path', async () => {
				const
					target = await init();

				const scan = await target.evaluate(async (ctx) => {
					const res = [];

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

					ctx.mountedWatcher.a.c++;
					ctx.mountedWatcher.a.c++;
					await ctx.nextTick();

					return res;
				});

				expect(scan).toEqual([
					[{a: {c: 2}}, {}, false, ['mountedWatcher']],
					[{a: {b: 3}}, {a: {c: 2}}, false, ['mountedWatcher']],
					[{a: {c: 3}}, {a: {b: 3}}, false, ['mountedWatcher']],
					[{a: {c: 5}}, {a: {c: 3}}, false, ['mountedWatcher']]
				]);
			});

			it('immediate watching for the specified path', async () => {
				const
					target = await init();

				const scan = await target.evaluate((ctx) => {
					const res = [];

					ctx.watch('mountedWatcher.a.c', {immediate: true}, (val, oldVal, i) => {
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

					ctx.mountedWatcher.a.c++;
					ctx.mountedWatcher.a.c++;

					return res;
				});

				expect(scan).toEqual([
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

			it('deep watching', async () => {
				const
					target = await init();

				const scan = await target.evaluate(async (ctx) => {
					const res = [];

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

			it('deep immediate watching', async () => {
				const
					target = await init();

				const scan = await target.evaluate(async (ctx) => {
					const res = [];

					ctx.watch('mountedWatcher', {deep: true, immediate: true}, (val, oldVal, i) => {
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

			it('deep immediate watching without collapsing', async () => {
				const
					target = await init();

				const scan = await target.evaluate(async (ctx) => {
					const res = [];

					ctx.watch('mountedWatcher', {deep: true, immediate: true, collapse: false}, (val, oldVal, i) => {
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
