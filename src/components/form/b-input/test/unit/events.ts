/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { JSHandle, Page } from 'playwright';

import type * as Mask from 'components/super/i-input-text/mask';
import type bInput from 'components/form/b-input/b-input';

import test from 'tests/config/unit/test';
import Component from 'tests/helpers/component';
import Utils from 'tests/helpers/utils';

test.describe('<b-input> standard component events', () => {
	test.beforeEach(async ({page, demoPage}) => {
		await demoPage.goto();

		const MaskAPI = await Utils.import<typeof Mask>(page, 'components/super/i-input-text/mask');
		await MaskAPI.evaluate((ctx) => ctx.default.addToPrototype(ctx));
	});

	test('the `change` event should be fired when the value of the component changes', async ({page}) => {
		const target = await renderInput(page);

		const capturedEvent = target.evaluate(async (ctx) => {
			const capturedEvent = ctx.promisifyOnce('onChange');
			ctx.value = '42';
			return capturedEvent;
		});

		await test.expect(capturedEvent).resolves.toBeTruthy();
	});

	test('when text is entered into the component, the `change` and `actionChange` events should be fired', async ({page}) => {
		const target = await renderInput(page);

		const capturedEvents = await target.evaluate(async ({unsafe}) => {
			const
				{input} = unsafe.$refs;

			const
				scan: Array<[string, unknown]> = [],
				values = ['1', '2'];

			input.focus();

			unsafe.on('onChange', (val) => {
				scan.push(['change', val]);
			});

			unsafe.on('onActionChange', (val) => {
				scan.push(['actionChange', val]);
			});

			for (const val of values) {
				input.value = val;
				input.dispatchEvent(new InputEvent('input', {data: val}));
			}

			unsafe.value = '3';
			await unsafe.nextTick();

			return scan;
		});

		test.expect(capturedEvents).toEqual([
			['actionChange', '1'],
			['actionChange', '2'],
			['change', '3']
		]);
	});

	test('when masked text is entered into the component, the `change` and `actionChange` events should be fired', async ({page}) => {
		const target = await renderInput(page, {
			mask: '%d-%d-%d'
		});

		const capturedEvents = await target.evaluate(async ({unsafe}) => {
			const
				{input} = unsafe.$refs;

			const
				scan: Array<[string, unknown]> = [],
				keys = ['1', '2'];

			input.focus();

			unsafe.on('onChange', (val) => {
				scan.push(['change', val]);
			});

			unsafe.on('onActionChange', (val) => {
				scan.push(['actionChange', val]);
			});

			for (const key of keys) {
				input.dispatchEvent(new KeyboardEvent('keydown', {
					key,
					code: `Digit${key.toUpperCase()}`
				}));
			}

			unsafe.value = '3';
			await unsafe.nextTick();

			return scan;
		});

		test.expect(capturedEvents).toEqual([
			['actionChange', '1-_-_'],
			['actionChange', '1-2-_'],
			['change', '3-_-_']
		]);
	});

	test('calling the `selectText` component method triggers the event of the same name', async ({page}) => {
		const target = await renderInput(page, {
			text: 'foo'
		});

		test.expect(
			await target.evaluate((ctx) => {
				const events: boolean[] = [];
				ctx.on('selectText', () => events.push(true));

				void ctx.selectText();
				void ctx.selectText();

				return events;
			})
		).toEqual([true]);
	});

	test('calling the `clearText` component method triggers the event of the same name', async ({page}) => {
		const target = await renderInput(page, {
			value: 'foo'
		});

		test.expect(
			await target.evaluate((ctx) => {
				const events: boolean[] = [];
				ctx.on('clearText', () => events.push(true));

				void ctx.clearText();
				void ctx.clearText();

				return events;
			})
		).toEqual([true]);
	});

	test('calling the `clear` component method triggers the event of the same name', async ({page}) => {
		const target = await renderInput(page, {
			value: 'foo'
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
		).toEqual(['foo', '']);
	});

	test('calling the `reset` component method triggers the event of the same name', async ({page}) => {
		const target = await renderInput(page, {
			value: 'foo',
			default: 'bar'
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
		).toEqual(['foo', 'bar']);
	});

	async function renderInput(page: Page, attrs: RenderComponentsVnodeParams['attrs'] = {}): Promise<JSHandle<bInput>> {
		return Component.createComponent(page, 'b-input', {
			attrs: {
				'data-id': 'target',
				...attrs
			}
		});
	}
});
