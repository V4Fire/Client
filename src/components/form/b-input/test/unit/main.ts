/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { JSHandle, Page } from 'playwright';
import type bInput from 'components/form/b-input/b-input';

import test from 'tests/config/unit/test';
import Component from 'tests/helpers/component';

test.describe('<b-input>', () => {
	test.beforeEach(async ({demoPage}) => {
		await demoPage.goto();
	});

	test('the component markup should have a <input /> tag with the provided attributes', async ({page}) => {
		await renderInput(page, {
			id: 'foo',
			name: 'bla',
			value: 'baz'
		});

		const
			input = page.locator('#foo');

		test.expect(
			await input.evaluate((ctx: HTMLInputElement) => [
				ctx.tagName,
				ctx.type,
				ctx.name,
				ctx.value
			])

		).toEqual(['INPUT', 'text', 'bla', 'baz']);
	});

	test('passing the component value and checking the `text` getter', async ({page}) => {
		const target = await renderInput(page, {
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
		const target = await renderInput(page, {
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

			const target = await renderInput(page, {
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

			const target = await renderInput(page, {
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

	test.describe('`textHint` API', () => {
		test('providing a hint', async ({page}) => {
			const target = await renderInput(page, {
				value: 'text',
				textHint: ' extra text'
			});

			test.expect(
				await target.evaluate(({unsafe}) => unsafe.$refs.textHint!.textContent)
			).toBe('text extra text');

			test.expect(
				await target.evaluate(({unsafe}) => {
					unsafe.value = '10';
					return unsafe.$refs.textHint!.textContent;
				})
			).toBe('10 extra text');
		});

		test('should create a node for the passed text hint', async ({page}) => {
			const target = await renderInput(page, {
				textHint: ' extra text'
			});

			test.expect(
				await target.evaluate(({unsafe}) => unsafe.$refs.textHint != null)
			).toBeTruthy();
		});

		test("shouldn't create a node if there is no hint passed", async ({page}) => {
			const target = await renderInput(page);

			test.expect(
				await target.evaluate(({unsafe}) => unsafe.$refs.textHint == null)
			).toBeTruthy();
		});

		test('should hide a hint if the component input is empty', async ({page}) => {
			const target = await renderInput(page, {textHint: ' extra text'});

			test.expect(
				await target.evaluate(({unsafe}) => getComputedStyle(unsafe.$refs.textHint!).display)
			).toBe('none');
		});

		test("shouldn't hide a hint if there isn't a scroll in the input", async ({page}) => {
			const target = await renderInput(page, {
				id: 'foo',
				textHint: ' extra text'
			});

			const
				input = page.locator('#foo');

			await input.evaluate((ctx: HTMLInputElement) => ctx.style.width = '50px');

			test.expect(await target.evaluate(({unsafe}) => {
				const {input} = unsafe.$refs;
				unsafe.value = '1';
				return input.clientWidth === input.scrollWidth;
			})).toBeTruthy();

			test.expect(
				await target.evaluate(({unsafe}) => unsafe.$refs.textHint?.innerText)
			).toBe('1 extra text');

		});

		test('should hide a hint if there is a scroll in the input', async ({page}) => {
			const target = await renderInput(page, {
				id: 'foo',
				textHint: ' extra text'
			});

			const
				input = page.locator('#foo');

			await input.evaluate((ctx: HTMLInputElement) => ctx.style.width = '50px');

			test.expect(await target.evaluate(({unsafe}) => {
				const {input} = unsafe.$refs;
				unsafe.value = 'veryLongWord';
				return input.clientWidth < input.scrollWidth;
			})).toBeTruthy();

			test.expect(
				await target.evaluate(({unsafe}) => unsafe.$refs.textHint?.innerText)
			).toBe('');
		});
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
