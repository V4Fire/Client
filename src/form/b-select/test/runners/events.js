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
	{initSelect} = include('src/form/b-select/test/helpers');

/** @param {Page} page */
module.exports = (page) => {
	beforeEach(async () => {
		await page.evaluate(() => {
			globalThis.removeCreatedComponents();
		});
	});

	describe('b-select component events', () => {
		describe('custom mode', () => {
			describe('single mode', () => {
				it('listening `change` and `actionChange` events', async () => {
					const target = await initSelect(page, {
						items: [
							{label: 'Foo', value: 0},
							{label: 'Bar', value: 1}
						]
					});

					const scan = await target.evaluate(async (ctx) => {
						const
							res = [],
							ids = ['0', '1'];

						ctx.focus();
						await ctx.async.wait(() => ctx.block.element('dropdown'));

						ctx.on('onChange', (val) => {
							res.push(['change', val]);
						});

						ctx.on('onActionChange', (val) => {
							res.push(['actionChange', val]);
						});

						for (const id of ids) {
							ctx.block.element('item', {id}).click();
						}

						ctx.value = 2;
						await ctx.nextTick();

						return res;
					});

					expect(scan).toEqual([
						['actionChange', 0],
						['actionChange', 1],
						['change', 2]
					]);
				});

				it('listening `actionChange` with typing', async () => {
					const target = await initSelect(page, {
						opened: true,

						items: [
							{label: 'Foo', value: 0},
							{label: 'Bar', value: 1}
						]
					});

					const scan = await target.evaluate(async (ctx) => {
						const
							{input} = ctx.$refs;

						const
							res = [],
							values = ['F', 'Ba', 'Br'];

						ctx.focus();

						ctx.on('onActionChange', (val) => {
							res.push(['actionChange', val]);
						});

						for (const val of values) {
							input.value = val;
							input.dispatchEvent(new InputEvent('input', {data: val}));
							await ctx.async.sleep(300);
						}

						return res;
					});

					expect(scan).toEqual([
						['actionChange', 0],
						['actionChange', 1],
						['actionChange', undefined]
					]);
				});

				it('listening `change` and `actionChange` events with the provided `mask`', async () => {
					const target = await initSelect(page, {
						mask: '%w%w',
						opened: true,

						items: [
							{label: 'Foo', value: 0},
							{label: 'Bar', value: 1}
						]
					});

					const scan = await target.evaluate(async (ctx) => {
						const
							{input} = ctx.$refs;

						const
							res = [],
							keys = ['F', 'o'];

						input.focus();

						ctx.on('onChange', (val) => {
							res.push(['change', val]);
						});

						ctx.on('onActionChange', (val) => {
							res.push(['actionChange', val]);
						});

						for (const key of keys) {
							input.dispatchEvent(new KeyboardEvent('keydown', {
								key,
								code: `Digit${key.toUpperCase()}`
							}));

							await ctx.async.sleep(300);
						}

						// eslint-disable-next-line require-atomic-updates
						ctx.value = 1;
						await ctx.nextTick();

						return res;
					});

					expect(scan).toEqual([
						['actionChange', 0],
						['change', 0],
						['change', 1]
					]);
				});

				it('listening `clear`', async () => {
					const target = await initSelect(page, {
						value: 0,

						items: [
							{label: 'Foo', value: 0},
							{label: 'Bar', value: 1},
							{label: 'Baz', value: 2}
						]
					});

					expect(
						await target.evaluate(async (ctx) => {
							const
								res = [];

							ctx.on('onClear', (val) => res.push([val, ctx.text]));
							ctx.clear();
							ctx.clear();

							await ctx.nextTick();
							return res;
						})
					).toEqual([[undefined, '']]);
				});

				it('listening `reset`', async () => {
					const target = await initSelect(page, {
						value: 0,
						default: 1,

						items: [
							{label: 'Foo', value: 0},
							{label: 'Bar', value: 1},
							{label: 'Baz', value: 2}
						]
					});

					expect(
						await target.evaluate(async (ctx) => {
							const
								res = [];

							ctx.on('onReset', (val) => res.push([val, ctx.text]));
							ctx.reset();
							ctx.reset();

							await ctx.nextTick();
							return res;
						})
					).toEqual([[1, 'Bar']]);
				});
			});

			describe('multiple mode', () => {
				it('listening `change` and `actionChange` events', async () => {
					const target = await initSelect(page, {
						multiple: true,

						items: [
							{label: 'Foo', value: 0},
							{label: 'Bar', value: 1}
						]
					});

					const scan = await target.evaluate(async (ctx) => {
						const
							res = [],
							ids = ['0', '1'];

						ctx.focus();
						await ctx.async.wait(() => ctx.block.element('dropdown'));

						ctx.on('onChange', (val) => {
							res.push(['change', [...val]]);
						});

						ctx.on('onActionChange', (val) => {
							res.push(['actionChange', [...val]]);
						});

						for (const id of ids) {
							ctx.block.element('item', {id}).click();
						}

						ctx.value = 2;
						await ctx.nextTick();

						return res;
					});

					expect(scan).toEqual([
						['actionChange', [0]],
						['actionChange', [0, 1]],
						['change', [2]]
					]);
				});

				it('listening `actionChange` with typing', async () => {
					const target = await initSelect(page, {
						opened: true,
						multiple: true,

						items: [
							{label: 'Foo', value: 0},
							{label: 'Bar', value: 1}
						]
					});

					const scan = await target.evaluate(async (ctx) => {
						const
							{input} = ctx.$refs;

						const
							res = [],
							values = ['F', 'Ba', 'Br'];

						ctx.focus();

						ctx.on('onActionChange', (val) => {
							res.push(['actionChange', Object.isSet(val) ? [...val] : val]);
						});

						for (const val of values) {
							input.value = val;
							input.dispatchEvent(new InputEvent('input', {data: val}));
							await ctx.async.sleep(300);
						}

						return res;
					});

					expect(scan).toEqual([
						['actionChange', [0]],
						['actionChange', [1]],
						['actionChange', undefined]
					]);
				});

				it('listening `clear`', async () => {
					const target = await initSelect(page, {
						value: 0,
						multiple: true,

						items: [
							{label: 'Foo', value: 0},
							{label: 'Bar', value: 1},
							{label: 'Baz', value: 2}
						]
					});

					expect(
						await target.evaluate(async (ctx) => {
							const
								res = [];

							ctx.on('onClear', (val) => res.push([val, ctx.text]));
							ctx.clear();
							ctx.clear();

							await ctx.nextTick();
							return res;
						})
					).toEqual([[undefined, '']]);
				});

				it('listening `reset`', async () => {
					const target = await initSelect(page, {
						value: 0,
						default: 1,
						multiple: true,

						items: [
							{label: 'Foo', value: 0},
							{label: 'Bar', value: 1},
							{label: 'Baz', value: 2}
						]
					});

					expect(
						await target.evaluate(async (ctx) => {
							const
								res = [];

							ctx.on('onReset', (val) => res.push([[...val], ctx.text]));
							ctx.reset();
							ctx.reset();

							await ctx.nextTick();
							return res;
						})
					).toEqual([[[1], '']]);
				});
			});
		});

		describe('native mode', () => {
			describe('single mode', () => {
				it('listening `change` and `actionChange` events', async () => {
					const target = await initSelect(page, {
						native: true,

						items: [
							{label: 'Foo', value: 0},
							{label: 'Bar', value: 1}
						]
					});

					await target.evaluate(async (ctx) => {
						const res = [];
						ctx.__res = res;

						ctx.focus();

						ctx.on('onChange', (val) => {
							res.push(['change', val]);
						});

						ctx.on('onActionChange', (val) => {
							res.push(['actionChange', val]);
						});

						ctx.value = 2;
						await ctx.nextTick();
					});

					const
						select = await page.$(`select.${await target.evaluate((ctx) => ctx.componentId)}`),
						labels = ['Foo', 'Bar'];

					for (let i = 0; i < labels.length; i++) {
						select.selectOption({label: labels[i]});
						await new Promise((r) => setTimeout(r, 50));
					}

					expect(await target.evaluate((ctx) => ctx.__res)).toEqual([
						['change', 2],
						['actionChange', 0],
						['change', 0],
						['actionChange', 1],
						['change', 1]
					]);
				});

				it('listening `clear`', async () => {
					const target = await initSelect(page, {
						value: 0,
						native: true,

						items: [
							{label: 'Foo', value: 0},
							{label: 'Bar', value: 1},
							{label: 'Baz', value: 2}
						]
					});

					expect(
						await target.evaluate(async (ctx) => {
							const
								res = [];

							ctx.on('onClear', (val) => res.push([val, ctx.text]));
							ctx.clear();
							ctx.clear();

							await ctx.nextTick();
							return res;
						})
					).toEqual([[undefined, '']]);
				});

				it('listening `reset`', async () => {
					const target = await initSelect(page, {
						value: 0,
						default: 1,
						native: true,

						items: [
							{label: 'Foo', value: 0},
							{label: 'Bar', value: 1},
							{label: 'Baz', value: 2}
						]
					});

					expect(
						await target.evaluate(async (ctx) => {
							const
								res = [];

							ctx.on('onReset', (val) => res.push([val, ctx.text]));
							ctx.reset();
							ctx.reset();

							await ctx.nextTick();
							return res;
						})
					).toEqual([[1, 'Bar']]);
				});
			});

			describe('multiple mode', () => {
				it('listening `change` and `actionChange` events', async () => {
					const target = await initSelect(page, {
						native: true,
						multiple: true,

						items: [
							{label: 'Foo', value: 0},
							{label: 'Bar', value: 1},
							{label: 'Baz', value: 2}
						]
					});

					await target.evaluate(async (ctx) => {
						const res = [];
						ctx.__res = res;

						ctx.focus();

						ctx.on('onChange', (val) => {
							res.push(['change', Object.isSet(val) ? [...val] : val]);
						});

						ctx.on('onActionChange', (val) => {
							res.push(['actionChange', Object.isSet(val) ? [...val] : val]);
						});

						ctx.value = 2;
						await ctx.nextTick();
					});

					const
						select = await page.$(`select.${await target.evaluate((ctx) => ctx.componentId)}`),
						values = [{label: 'Foo'}, [{label: 'Bar'}, {label: 'Baz'}]];

					for (let i = 0; i < values.length; i++) {
						select.selectOption(values[i]);
						await new Promise((r) => setTimeout(r, 50));
					}

					expect(await target.evaluate((ctx) => ctx.__res)).toEqual([
						['change', [2]],
						['actionChange', [0]],
						['change', [0]],
						['actionChange', [1, 2]],
						['change', [1, 2]]
					]);
				});

				it('listening `clear`', async () => {
					const target = await initSelect(page, {
						value: 0,
						multiple: true,
						native: true,

						items: [
							{label: 'Foo', value: 0},
							{label: 'Bar', value: 1},
							{label: 'Baz', value: 2}
						]
					});

					expect(
						await target.evaluate(async (ctx) => {
							const
								res = [];

							ctx.on('onClear', (val) => res.push([val, ctx.text]));
							ctx.clear();
							ctx.clear();

							await ctx.nextTick();
							return res;
						})
					).toEqual([[undefined, '']]);
				});

				it('listening `reset`', async () => {
					const target = await initSelect(page, {
						value: 0,
						default: 1,
						multiple: true,
						native: true,

						items: [
							{label: 'Foo', value: 0},
							{label: 'Bar', value: 1},
							{label: 'Baz', value: 2}
						]
					});

					expect(
						await target.evaluate(async (ctx) => {
							const
								res = [];

							ctx.on('onReset', (val) => res.push([[...val], ctx.text]));
							ctx.reset();
							ctx.reset();

							await ctx.nextTick();
							return res;
						})
					).toEqual([[[1], '']]);
				});
			});
		});

		it('listening `selectText`', async () => {
			const target = await initSelect(page, {
				text: 'foo'
			});

			expect(
				await target.evaluate((ctx) => {
					const
						res = [];

					ctx.on('selectText', () => res.push(true));
					ctx.selectText();
					ctx.selectText();

					return res;
				})
			).toEqual([true]);
		});

		it('listening `clearText`', async () => {
			const target = await initSelect(page, {
				value: 0,

				items: [
					{label: 'Foo', value: 0},
					{label: 'Bar', value: 1},
					{label: 'Baz', value: 2}
				]
			});

			expect(
				await target.evaluate((ctx) => {
					const
						res = [];

					ctx.on('clearText', () => res.push(ctx.text));
					ctx.clearText();
					ctx.clearText();

					return res;
				})
			).toEqual(['']);
		});
	});
};
