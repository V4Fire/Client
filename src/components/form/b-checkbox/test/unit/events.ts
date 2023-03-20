/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { JSHandle, Page } from 'playwright';

import type * as Block from 'components/friends/block';
import type bCheckbox from 'components/form/b-checkbox/b-checkbox';

import test from 'tests/config/unit/test';
import Component from 'tests/helpers/component';
import Utils from 'tests/helpers/utils';

test.describe('<b-checkbox> standard component events', () => {
	test.beforeEach(async ({page, demoPage}) => {
		await demoPage.goto();

		const BlockAPI = await Utils.import<typeof Block>(page, 'components/friends/block');
		await BlockAPI.evaluate((ctx) => ctx.default.addToPrototype(ctx));
	});

	test('the `change` event should be fired when the value of the component changes', async ({page}) => {
		const target = await renderCheckbox(page);

		const capturedEvent = target.evaluate(async (ctx) => {
			const capturedEvent = ctx.promisifyOnce('onChange');
			void ctx.toggle();
			return capturedEvent;
		});

		await test.expect(capturedEvent).resolves.toBeTruthy();
	});

	test('when clicking on the component, the `change` and `actionChange` events should be fired', async ({page}) => {
		const target = await renderCheckbox(page, {
			value: 42
		});

		const capturedEvents = await target.evaluate(async (ctx) => {
			const
				wrapper = ctx.unsafe.block!.element<HTMLElement>('wrapper')!,
				scan: Array<[string, CanUndef<42>]> = [];

			ctx.on('onChange', (val) => {
				scan.push(['change', val]);
			});

			ctx.on('onActionChange', (val) => {
				scan.push(['actionChange', val]);
			});

			wrapper.click();
			await ctx.toggle();
			wrapper.click();

			return scan;
		});

		test.expect(capturedEvents).toEqual([
			['change', 42],
			['actionChange', 42],
			['change', undefined],
			['change', 42],
			['actionChange', 42]
		]);
	});

	test('the `check` or `uncheck` events should be fired when the value of the component changes', async ({page}) => {
		const
			target = await renderCheckbox(page);

		const capturedEvents = await target.evaluate(async (ctx) => {
			const
				wrapper = ctx.unsafe.block!.element<HTMLElement>('wrapper')!,
				events: Array<[string, boolean] | string> = [];

			ctx.on('onCheck', (type) => {
				events.push(['check', type]);
			});

			ctx.on('onUncheck', () => {
				events.push('uncheck');
			});

			wrapper.click();
			await ctx.toggle();
			wrapper.click();

			return events;
		});

		test.expect(capturedEvents).toEqual([
			['check', true],
			'uncheck',
			['check', true]
		]);
	});

	test('calling the `clear` component method triggers the event of the same name', async ({page}) => {
		const target = await renderCheckbox(page, {
			value: 'foo',
			checked: true
		});

		test.expect(
			await target.evaluate(async (ctx) => {
				const events = [ctx.value];
				ctx.on('onClear', (val) => events.push(val));

				void ctx.clear();
				void ctx.clear();

				await ctx.nextTick();
				return events;
			})
		).toEqual(['foo', undefined]);
	});

	test('calling the `reset` component method triggers the event of the same name', async ({page}) => {
		const target = await renderCheckbox(page, {
			value: 'foo',
			checked: false,
			default: true
		});

		test.expect(
			await target.evaluate(async (ctx) => {
				const events = [ctx.value];
				ctx.on('onReset', (val) => events.push(val));

				void ctx.reset();
				void ctx.reset();

				await ctx.nextTick();
				return events;
			})
		).toEqual([undefined, 'foo']);
	});

	/**
	 * @param page
	 * @param attrs
	 */
	async function renderCheckbox(page: Page, attrs: Dictionary = {}): Promise<JSHandle<bCheckbox>> {
		return Component.createComponent(page, 'b-checkbox', {
			attrs: {
				'data-id': 'target',
				...attrs
			}
		});
	}
});
