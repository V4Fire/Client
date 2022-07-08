/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { JSHandle, Page } from 'playwright';

import test from 'tests/config/unit/test';

import Component from 'tests/helpers/component';

import type bCheckbox from 'form/b-checkbox/b-checkbox';

test.describe('b-checkbox component events', () => {
	test.beforeEach(async ({demoPage}) => {
		await demoPage.goto();
	});

	test('listening `change` and `actionChange` events', async ({page}) => {
		const
			target = await init(page);

		const scan = await target.evaluate(async (ctx) => {
			const
				wrapper = <HTMLElement>ctx.unsafe.block!.element('wrapper'),
				res = <any[]>[];

			ctx.on('onChange', (val) => {
				res.push(['change', val]);
			});

			ctx.on('onActionChange', (val) => {
				res.push(['actionChange', val]);
			});

			wrapper.click();
			await ctx.toggle();
			wrapper.click();

			return res;
		});

		test.expect(scan).toEqual([
			['change', true],
			['actionChange', true],
			['change', undefined],
			['change', true],
			['actionChange', true]
		]);
	});

	test('listening `check` and `uncheck` events', async ({page}) => {
		const
			target = await init(page);

		const scan = await target.evaluate(async (ctx) => {
			const
				wrapper = <HTMLElement>ctx.unsafe.block!.element('wrapper'),
				res = <any[]>[];

			ctx.on('onCheck', (type) => {
				res.push(['check', type]);
			});

			ctx.on('onUncheck', () => {
				res.push('uncheck');
			});

			wrapper.click();
			await ctx.toggle();
			wrapper.click();

			return res;
		});

		test.expect(scan).toEqual([
			['check', true],
			'uncheck',
			['check', true]
		]);
	});

	test('listening `clear`', async ({page}) => {
		const target = await init(page, {
			value: 'foo',
			checked: true
		});

		test.expect(
			await target.evaluate(async (ctx) => {
				const
					res = [ctx.value];

				ctx.on('onClear', (val) => res.push(val));
				void ctx.clear();
				void ctx.clear();

				await ctx.nextTick();
				return res;
			})
		).toEqual(['foo', undefined]);
	});

	test('listening `reset`', async ({page}) => {
		const target = await init(page, {
			value: 'foo',
			checked: false,
			default: true
		});

		test.expect(
			await target.evaluate(async (ctx) => {
				const
					res = [ctx.value];

				ctx.on('onReset', (val) => res.push(val));
				void ctx.reset();
				void ctx.reset();

				await ctx.nextTick();
				return res;
			})
		).toEqual([undefined, 'foo']);
	});

	/**
	 * @param page
	 * @param attrs
	 */
	async function init(page: Page, attrs: Dictionary = {}): Promise<JSHandle<bCheckbox>> {
		return Component.createComponent(page, 'b-checkbox', {
			attrs: {
				'data-id': 'target',
				...attrs
			}
		});
	}
});
