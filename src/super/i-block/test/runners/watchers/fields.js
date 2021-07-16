/* eslint-disable max-lines */

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

// @ts-check

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

	describe('i-block watch API fields/systemFields', () => {
		['regular', 'system'].forEach((type) => {
			describe(`${type} fields`, () => {
				const field = type === 'regular' ?
					'complexObjStore' :
					'systemComplexObjStore';

				describe('without caching of old values', () => {
					it('non-deep watching', async () => {
						const
							target = await init();

						const scan = await target.evaluate(async (ctx, field) => {
							const
								res = [];

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

						expect(scan).toEqual([
							[{a: {c: 2}}, {a: {b: 1}}, [field], [field]],
							[{a: {c: 3}}, {a: {c: 2}}, [field], [field]]
						]);
					});

					it('non-deep watching without collapsing', async () => {
						const
							target = await init();

						const scan = await target.evaluate(async (ctx, field) => {
							const res = [];

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

						expect(scan).toEqual([
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

					it('non-deep immediate watching', async () => {
						const
							target = await init();

						const scan = await target.evaluate((ctx, field) => {
							const res = [];

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

						expect(scan).toEqual([
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

					it('watching for the specified path', async () => {
						const
							target = await init();

						const scan = await target.evaluate(async (ctx, field) => {
							const res = [];

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

						expect(scan).toEqual([
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

					it('immediate watching for the specified path', async () => {
						const
							target = await init();

						const scan = await target.evaluate((ctx, field) => {
							const res = [];

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

						expect(scan).toEqual([
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

					it('deep watching', async () => {
						const
							target = await init();

						const scan = await target.evaluate(async (ctx, field) => {
							const res = [];

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

						expect(scan).toEqual([
							[{a: {c: 2}}, {a: {b: 1}}, [field], [field]],
							[{a: {c: 3}}, {a: {c: 2}}, [field], [field]],
							[{a: {c: 5}}, {a: {c: 5}}, [field], [field, 'a', 'c']]
						]);
					});

					it('deep watching without collapsing', async () => {
						const
							target = await init();

						const scan = await target.evaluate(async (ctx, field) => {
							const res = [];

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

						expect(scan).toEqual([
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

					it('deep immediate watching without collapsing', async () => {
						const
							target = await init();

						const scan = await target.evaluate((ctx, field) => {
							const res = [];

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

						expect(scan).toEqual([
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

					it('removing watchers', async () => {
						const
							target = await init();

						const scan = await target.evaluate((ctx, field) => {
							const res = [];

							ctx.watch(field, {deep: true, immediate: true, collapse: false, group: 'foo'}, (val, ...args) => {
								res.push([
									Object.fastClone(val),
									Object.fastClone(args[0]),
									args[1]?.path,
									args[1]?.originalPath
								]);
							});

							ctx[field].a.b.c++;
							ctx.async.terminateWorker({group: 'foo'});
							ctx[field].a.b.c++;

							return res;
						}, field);

						expect(scan).toEqual([
							[
								{a: {b: {c: 1, d: 2}}},
								undefined,
								undefined,
								undefined
							],

							[2, 1, [field], [field, 'a', 'b', 'c']]
						]);
					});

					it('suspending watchers', async () => {
						const
							target = await init();

						const scan = await target.evaluate((ctx, field) => {
							const res = [];
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
							ctx.async.suspendEventListener({group: /foo/});
							ctx[field].a.b.c++;

							return res;
						}, field);

						expect(scan).toEqual([
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
							ctx.async.unsuspendEventListener({group: /foo/});
							return res;
						});

						expect(scan2).toEqual([
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

				describe('with caching of old values', () => {
					it('non-deep watching', async () => {
						const
							target = await init();

						const scan = await target.evaluate(async (ctx, field) => {
							const
								res = [];

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

						expect(scan).toEqual([
							[{a: {c: 2}}, {a: {b: {c: 1, d: 2}}}, false, [field]],
							[{a: {c: 3}}, {a: {c: 2}}, false, [field]]
						]);
					});

					it('non-deep watching without collapsing', async () => {
						const
							target = await init();

						const scan = await target.evaluate(async (ctx, field) => {
							const res = [];

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

						expect(scan).toEqual([
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

					it('non-deep immediate watching', async () => {
						const
							target = await init();

						const scan = await target.evaluate((ctx, field) => {
							const res = [];

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

						expect(scan).toEqual([
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

					it('watching for the specified path', async () => {
						const
							target = await init();

						const scan = await target.evaluate(async (ctx, field) => {
							const res = [];

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

						expect(scan).toEqual([
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

					it('immediate watching for the specified path', async () => {
						const
							target = await init();

						const scan = await target.evaluate((ctx, field) => {
							const res = [];

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

						expect(scan).toEqual([
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

					it('deep watching', async () => {
						const
							target = await init();

						const scan = await target.evaluate(async (ctx, field) => {
							const res = [];

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

						expect(scan).toEqual([
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

					it('deep watching without collapsing', async () => {
						const
							target = await init();

						const scan = await target.evaluate(async (ctx, field) => {
							const res = [];

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

						expect(scan).toEqual([
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

					it('deep immediate watching without collapsing', async () => {
						const
							target = await init();

						const scan = await target.evaluate((ctx, field) => {
							const res = [];

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

						expect(scan).toEqual([
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

					it('suspending watchers', async () => {
						const
							target = await init();

						const scan = await target.evaluate((ctx, field) => {
							const res = [];
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
							ctx.async.suspendEventListener({group: /foo/});
							ctx[field].a.b.c++;

							return res;
						}, field);

						expect(scan).toEqual([
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
							ctx.async.unsuspendEventListener({group: /foo/});
							return res;
						});

						expect(scan2).toEqual([
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
