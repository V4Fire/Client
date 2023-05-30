/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { JSHandle, Page } from 'playwright';

import type * as Block from 'components/friends/block';
import type bTextarea from 'components/form/b-textarea/b-textarea';

import test from 'tests/config/unit/test';
import Component from 'tests/helpers/component';
import Utils from 'tests/helpers/utils';

test.describe('<b-textarea>', () => {
	test.beforeEach(async ({page, demoPage}) => {
		await demoPage.goto();

		const BlockAPI = await Utils.import<typeof Block>(page, 'components/friends/block');
		await BlockAPI.evaluate((ctx) => ctx.default.addToPrototype(ctx));
	});

	test('the component markup should have a <textarea /> tag with the provided attributes', async ({page}) => {
		await renderTextarea(page, {
			id: 'foo',
			name: 'bla',
			value: 'baz'
		});

		const
			textarea = page.locator('#foo');

		test.expect(
			await textarea.evaluate((ctx: HTMLInputElement) => [
				ctx.tagName,
				ctx.name,
				ctx.value
			])

		).toEqual(['TEXTAREA', 'bla', 'baz']);
	});

	test('passing the component value and checking the `text` getter', async ({page}) => {
		const target = await renderTextarea(page, {
			value: 'baz'
		});

		test.expect(
			await target.evaluate((ctx) => {
				const
					scan = [ctx.text];

				ctx.value = 'bla';
				scan.push(ctx.text);

				return scan;
			})
		).toEqual(['baz', 'bla']);
	});

	test('passing the `text` prop and checking the `value` getter', async ({page}) => {
		const target = await renderTextarea(page, {
			text: 'baz'
		});

		test.expect(
			await target.evaluate((ctx) => {
				const
					scan = [ctx.value];

				ctx.text = 'bla';
				scan.push(ctx.value);

				return scan;
			})
		).toEqual(['baz', 'bla']);
	});

	test.describe('loading data from the provider', () => {
		test('if the provider returned not a dictionary, then this value is set as the component value', async ({page, context}) => {
			await context.route('/api', (r) => r.fulfill({
				status: 200,
				body: 'foo'
			}));

			const target = await renderTextarea(page, {
				dataProvider: 'Provider'
			});

			test.expect(await target.evaluate((ctx) => ctx.value)).toBe('foo');
		});

		test('if the component returned a dictionary, then its keys are mapped to the component properties', async ({page, context}) => {
			await context.route('/api', (r) => r.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify({
					value: 'foo',
					'mods.someMod': 'bar',
					setMod: ['anotherMod', 'bla']
				})
			}));

			const target = await renderTextarea(page, {
				dataProvider: 'Provider'
			});

			test.expect(
				await target.evaluate((ctx) => [
					ctx.value,
					ctx.mods.someMod,
					ctx.mods.anotherMod
				])

			).toEqual(['foo', 'bar', 'bla']);
		});
	});

	test('the component expands within the given threshold and then a scrollbar appears', async ({page}) => {
		const target = await renderTextarea(page);

		test.expect(
			await target.evaluate(async ({unsafe}) => {
				const {input} = unsafe.$refs;
				input.style.maxHeight = '100px';

				const
					sizes: Array<[number, number]> = [];

				const values = [
					'',
					'bla\nbla\nbla\n',
					'bla\nbla\nbla\nbla\nbla\nbla\n',
					'bla\nbla\nbla\nbla\nbla\nbla\nbla\nbla\nbla\n',
					'bla\nbla\nbla\n',
					''
				];

				for (const value of values) {
					unsafe.value = value;
					await unsafe.nextTick();
					sizes.push([input.clientHeight, input.scrollHeight]);
				}

				return sizes;
			})
		).toEqual([
			[36, 36],
			[72, 72],
			[98, 126],
			[98, 180],
			[72, 72],
			[36, 36]
		]);
	});

	test('when enabling `messageHelpers` and setting `maxLength`, text help should appear', async ({page}) => {
		const target = await renderTextarea(page, {
			maxLength: 20,
			messageHelpers: true
		});

		test.expect(
			await target.evaluate(async ({unsafe}) => {
				const
					scan: unknown[][] = [],
					limitEl = unsafe.block!.element('limit')!;

				const values = [
					'',
					'bla',
					'bla bla',
					'bla bla bla bla',
					'bla bla bla bla bla bla bla bla',
					'bla bla bla',
					''
				];

				for (const value of values) {
					unsafe.value = value;
					await unsafe.nextTick();

					scan.push([
						limitEl.textContent,
						unsafe.block!.getElementMod(limitEl, 'limit', 'hidden'),
						unsafe.block!.getElementMod(limitEl, 'limit', 'warning')
					]);
				}

				return scan;
			})
		).toEqual([
			['', 'true', undefined],
			['', 'true', undefined],
			['Characters left: 13', 'false', 'false'],
			['Characters left: 5', 'false', 'true'],
			['Characters left: 0', 'false', 'true'],
			['Characters left: 9', 'false', 'false'],
			['Characters left: 9', 'true', 'false']
		]);
	});

	test('when passing the `limit` slot and setting `maxLength`, text hint should appear', async ({page}) => {
		const target = await renderTextarea(page, {maxLength: 20}, {
			limit: ({limit, maxLength}) => `Characters left: ${limit}. The maximum characters is ${maxLength}`
		});

		test.expect(
			await target.evaluate(async ({unsafe}) => {
				const
					scan: unknown[] = [],
					limitEl = unsafe.block!.element('limit')!;

				const values = [
					'',
					'bla',
					'bla bla',
					'bla bla bla bla',
					'bla bla bla bla bla bla bla bla',
					'bla bla bla',
					''
				];

				for (const value of values) {
					unsafe.value = value;
					await unsafe.async.sleep(0);
					scan.push(limitEl.textContent);
				}

				return scan;
			})
		).toEqual([
			'Characters left: 20. The maximum characters is 20',
			'Characters left: 17. The maximum characters is 20',
			'Characters left: 13. The maximum characters is 20',
			'Characters left: 5. The maximum characters is 20',
			'Characters left: 0. The maximum characters is 20',
			'Characters left: 9. The maximum characters is 20',
			'Characters left: 20. The maximum characters is 20'
		]);
	});

	/**
	 * @param page
	 * @param [attrs]
	 * @param [children]
	 */
	async function renderTextarea(
		page: Page,
		attrs?: RenderComponentsVnodeParams['attrs'],
		children?: RenderComponentsVnodeParams['children']
	): Promise<JSHandle<bTextarea>> {
		return Component.createComponent(page, 'b-textarea', {
			attrs: {
				'data-id': 'target',
				...attrs
			},

			children
		});
	}
});
