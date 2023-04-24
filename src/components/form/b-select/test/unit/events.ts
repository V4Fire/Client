/* eslint-disable max-lines,max-lines-per-function */

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { JSHandle, Page } from 'playwright';

import test from 'tests/config/unit/test';

import { DOM } from 'tests/helpers';

import type bSelect from 'components/form/b-select/b-select';
import { renderSelect, createSelector } from 'components/form/b-select/test/helpers';

test.describe('<b-select> component events', () => {
	test.beforeEach(async ({demoPage}) => {
		await demoPage.goto();
	});

	test.describe('custom mode', () => {
		test.describe('single mode', () => {
			test('listening `change` and `actionChange` events', async ({page}) => {
				const target = await renderSelect(page, {
					items: [
						{label: 'Foo', value: 0},
						{label: 'Bar', value: 1}
					]
				});

				const scan = target.evaluate(async (ctx) => new Promise((resolve) => {
					const res: any[] = [];

					const onEvent = () => {
						if (res.length >= 5) {
							resolve(res);
						}
					};

					ctx.on('onChange', (val) => {
						res.push(['change', val]);
						onEvent();
					});

					ctx.on('onActionChange', (val) => {
						res.push(['actionChange', val]);
						onEvent();
					});
				}));

				await testChangeViaClickAndSetValue(page, target);

				await test.expect(scan).resolves.toEqual([
					['actionChange', 0],
					['change', 0],
					['actionChange', 1],
					['change', 1],
					['change', 2]
				]);
			});

			test('listening `actionChange` with typing', async ({page}) => {
				const target = await renderSelect(page, {
					opened: true,

					items: [
						{label: 'Foo', value: 0},
						{label: 'Bar', value: 1}
					]
				});

				const scan = target.evaluate(async (ctx) => new Promise((resolve) => {
					const res: any[] = [];

					ctx.on('onActionChange', (val) => {
						res.push(['actionChange', val]);

						if (res.length >= 3) {
							resolve(res);
						}
					});

				}));

				for (const val of ['F', 'Ba', 'Br']) {
					await page.locator(createSelector('input')).fill(val);
					await page.waitForTimeout(200);
				}

				await test.expect(scan).resolves.toEqual([
					['actionChange', 0],
					['actionChange', 1],
					['actionChange', undefined]
				]);
			});

			test('listening `change` and `actionChange` events with the provided `mask`', async ({page}) => {
				const target = await renderSelect(page, {
					mask: '%w%w',
					opened: true,

					items: [
						{label: 'Foo', value: 0},
						{label: 'Bar', value: 1}
					]
				});

				const scan = target.evaluate(async (ctx) => new Promise((resolve) => {
					const res: any[] = [];

					const onEvent = () => {
						if (res.length >= 3) {
							resolve(res);
						}
					};

					ctx.on('onChange', (val) => {
						res.push(['change', val]);
						onEvent();
					});

					ctx.on('onActionChange', (val) => {
						res.push(['actionChange', val]);
						onEvent();
					});

				}));

				await page.locator(createSelector('input')).type('Fo', {delay: 300});

				await target.evaluate((ctx) => {
					ctx.value = 1;
				});

				await test.expect(scan).resolves.toEqual([
					['actionChange', 0],
					['change', 0],
					['change', 1]
				]);
			});

			test('listening `clear`', async ({page}) => {
				const target = await renderSelect(page, {
					value: 0,

					items: [
						{label: 'Foo', value: 0},
						{label: 'Bar', value: 1},
						{label: 'Baz', value: 2}
					]
				});

				const scan = target.evaluate(async (ctx) => {
					const res: any[] = [];

					ctx.on('onClear', (val) => res.push([val, ctx.text]));
					void ctx.clear();
					void ctx.clear();

					await ctx.nextTick();
					return res;
				});

				await test.expect(scan).resolves.toEqual([[undefined, '']]);
			});

			test('listening `reset`', async ({page}) => {
				const target = await renderSelect(page, {
					value: 0,
					default: 1,

					items: [
						{label: 'Foo', value: 0},
						{label: 'Bar', value: 1},
						{label: 'Baz', value: 2}
					]
				});

				const scan = target.evaluate(async (ctx) => {
					const res: any[] = [];

					ctx.on('onReset', (val) => res.push([val, ctx.text]));
					void ctx.reset();
					void ctx.reset();

					await ctx.nextTick();
					return res;
				});

				await test.expect(scan).resolves.toEqual([[1, 'Bar']]);
			});
		});

		test.describe('multiple mode', () => {
			test('listening `change` and `actionChange` events', async ({page}) => {
				const target = await renderSelect(page, {
					multiple: true,

					items: [
						{label: 'Foo', value: 0},
						{label: 'Bar', value: 1}
					]
				});

				const scan = target.evaluate(async (ctx) => new Promise((resolve) => {
					const res: any[] = [];

					const onEvent = () => {
						if (res.length >= 5) {
							resolve(res);
						}
					};

					ctx.on('onChange', (val) => {
						res.push(['change', [...<number[]>val]]);
						onEvent();
					});

					ctx.on('onActionChange', (val) => {
						res.push(['actionChange', [...<number[]>val]]);
						onEvent();
					});
				}));

				await testChangeViaClickAndSetValue(page, target);

				await test.expect(scan).resolves.toEqual([
					['actionChange', [0]],
					['change', [0]],
					['actionChange', [0, 1]],
					['change', [0, 1]],
					['change', [2]]
				]);
			});

			test('listening `actionChange` with typing', async ({page}) => {
				const target = await renderSelect(page, {
					opened: true,
					multiple: true,

					items: [
						{label: 'Foo', value: 0},
						{label: 'Bar', value: 1}
					]
				});

				const scan = target.evaluate(async (ctx) => new Promise((resolve) => {
					const res: any[] = [];

					void ctx.focus();

					ctx.on('onActionChange', (val) => {
						res.push(['actionChange', Object.isSet(val) ? [...val] : val]);

						if (res.length >= 3) {
							resolve(res);
						}
					});
				}));

				for (const val of ['F', 'Ba', 'Br']) {
					await page.locator(createSelector('input')).fill(val);
					await page.waitForTimeout(200);
				}

				await test.expect(scan).resolves.toEqual([
					['actionChange', [0]],
					['actionChange', [1]],
					['actionChange', undefined]
				]);
			});

			test('listening `clear`', async ({page}) => {
				const target = await renderSelect(page, {
					value: 0,
					multiple: true,

					items: [
						{label: 'Foo', value: 0},
						{label: 'Bar', value: 1},
						{label: 'Baz', value: 2}
					]
				});

				const scan = target.evaluate(async (ctx) => {
					const res: any[] = [];

					ctx.on('onClear', (val) => res.push([val, ctx.text]));
					void ctx.clear();
					void ctx.clear();

					await ctx.nextTick();
					return res;
				});

				await test.expect(scan).resolves.toEqual([[undefined, '']]);
			});

			test('listening `reset`', async ({page}) => {
				const target = await renderSelect(page, {
					value: 0,
					default: 1,
					multiple: true,

					items: [
						{label: 'Foo', value: 0},
						{label: 'Bar', value: 1},
						{label: 'Baz', value: 2}
					]
				});

				const scan = target.evaluate(async (ctx) => {
					const res: any[] = [];

					ctx.on('onReset', (val) => res.push([Object.isSet(val) ? [...val] : val, ctx.text]));
					void ctx.reset();
					void ctx.reset();

					await ctx.nextTick();
					return res;
				});

				await test.expect(scan).resolves.toEqual([[[1], '']]);
			});
		});
	});

	test.describe('native mode', () => {
		test.describe('single mode', () => {
			test('listening `change` and `actionChange` events', async ({page}) => {
				const target = await renderSelect(page, {
					native: true,

					items: [
						{label: 'Foo', value: 0},
						{label: 'Bar', value: 1}
					]
				});

				const scan = target.evaluate(async (ctx) => new Promise((resolve) => {
					const res: any[] = [];

					const onEvent = () => {
						if (res.length >= 5) {
							resolve(res);
						}
					};

					ctx.on('onChange', (val) => {
						res.push(['change', val]);
						onEvent();
					});

					ctx.on('onActionChange', (val) => {
						res.push(['actionChange', val]);
						onEvent();
					});
				}));

				await target.evaluate((ctx) => {
					ctx.value = 2;
				});

				const
					select = page.locator(`select.${await target.evaluate((ctx) => ctx.componentId)}`),
					labels = ['Foo', 'Bar'];

				for (const label of labels) {
					await select.selectOption({label});
					await page.waitForTimeout(50);
				}

				await test.expect(scan).resolves.toEqual([
					['change', 2],
					['actionChange', 0],
					['change', 0],
					['actionChange', 1],
					['change', 1]
				]);
			});

			test('listening `clear`', async ({page}) => {
				const target = await renderSelect(page, {
					value: 0,
					native: true,

					items: [
						{label: 'Foo', value: 0},
						{label: 'Bar', value: 1},
						{label: 'Baz', value: 2}
					]
				});

				const scan = target.evaluate(async (ctx) => {
					const res: any[] = [];

					ctx.on('onClear', (val) => res.push([val, ctx.text]));
					void ctx.clear();
					void ctx.clear();

					await ctx.nextTick();
					return res;
				});

				await test.expect(scan).resolves.toEqual([[undefined, '']]);
			});

			test('listening `reset`', async ({page}) => {
				const target = await renderSelect(page, {
					value: 0,
					default: 1,
					native: true,

					items: [
						{label: 'Foo', value: 0},
						{label: 'Bar', value: 1},
						{label: 'Baz', value: 2}
					]
				});

				const scan = target.evaluate(async (ctx) => {
					const res: any[] = [];

					ctx.on('onReset', (val) => res.push([val, ctx.text]));
					void ctx.reset();
					void ctx.reset();

					await ctx.nextTick();
					return res;
				});

				await test.expect(scan).resolves.toEqual([[1, 'Bar']]);
			});
		});

		test.describe('multiple mode', () => {
			test('listening `change` and `actionChange` events', async ({page}) => {
				const target = await renderSelect(page, {
					native: true,
					multiple: true,

					items: [
						{label: 'Foo', value: 0},
						{label: 'Bar', value: 1},
						{label: 'Baz', value: 2}
					]
				});

				const scan = target.evaluate(async (ctx) => new Promise((resolve) => {
					const res: any[] = [];

					const onEvent = () => {
						if (res.length >= 7) {
							resolve(res);
						}
					};

					ctx.on('onChange', (val) => {
						res.push(['change', Object.isSet(val) ? [...val] : val]);
						onEvent();
					});

					ctx.on('onActionChange', (val) => {
						res.push(['actionChange', Object.isSet(val) ? [...val] : val]);
						onEvent();
					});
				}));

				await target.evaluate((ctx) => {
					ctx.value = 2;
				});

				const
					select = await page.locator(`select.${await target.evaluate((ctx) => ctx.componentId)}`),
					labels = ['Foo', 'Bar', 'Baz'];

				for (const label of labels) {
					await select.selectOption({label});
				}

				await test.expect(scan).resolves.toEqual([
					['change', [2]],
					['actionChange', [0]],
					['change', [0]],
					['actionChange', [1]],
					['change', [1]],
					['actionChange', [2]],
					['change', [2]]
				]);
			});

			test('listening `clear`', async ({page}) => {
				const target = await renderSelect(page, {
					value: 0,
					multiple: true,
					native: true,

					items: [
						{label: 'Foo', value: 0},
						{label: 'Bar', value: 1},
						{label: 'Baz', value: 2}
					]
				});

				const scan = target.evaluate(async (ctx) => {
					const res: any[] = [];

					ctx.on('onClear', (val) => res.push([val, ctx.text]));
					void ctx.clear();
					void ctx.clear();

					await ctx.nextTick();
					return res;
				});

				await test.expect(scan).resolves.toEqual([[undefined, '']]);
			});

			test('listening `reset`', async ({page}) => {
				const target = await renderSelect(page, {
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

				const scan = target.evaluate(async (ctx) => {
					const res: any[] = [];

					ctx.on('onReset', (val) => res.push([Object.isSet(val) ? [...val] : val, ctx.text]));
					void ctx.reset();
					void ctx.reset();

					await ctx.nextTick();
					return res;
				});

				await test.expect(scan).resolves.toEqual([[[1], '']]);
			});
		});
	});

	test('listening `selectText`', async ({page}) => {
		const target = await renderSelect(page, {
			text: 'foo'
		});

		const scan = target.evaluate((ctx) => {
			const
				res: any[] = [];

			ctx.on('selectText', () => res.push(true));
			void ctx.selectText();
			void ctx.selectText();

			return res;
		});

		await test.expect(scan).resolves.toEqual([true]);
	});

	test('listening `clearText`', async ({page}) => {
		const target = await renderSelect(page, {
			value: 0,

			items: [
				{label: 'Foo', value: 0},
				{label: 'Bar', value: 1},
				{label: 'Baz', value: 2}
			]
		});
		const scan = target.evaluate((ctx) => {
			const res: any[] = [];

			ctx.on('clearText', () => res.push(ctx.text));
			void ctx.clearText();
			void ctx.clearText();

			return res;
		});

		await test.expect(scan).resolves.toEqual(['']);
	});

	async function testChangeViaClickAndSetValue(page: Page, target: JSHandle<bSelect>): Promise<void> {
		for (const id of ['0', '1']) {
			const selector = DOM.elModSelectorGenerator(
				DOM.elNameGenerator('b-select', 'item'), 'id', id
			);
			await target.evaluate(async (ctx) => ctx.focus());
			await page.locator(selector).click();
		}

		await target.evaluate((ctx) => {
			ctx.value = 2;
		});
	}
});

