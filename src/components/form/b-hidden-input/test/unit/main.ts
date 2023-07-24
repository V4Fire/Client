/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { Page, JSHandle, ElementHandle } from 'playwright';

import type * as DataProvider from 'components/friends/data-provider';
import type bHiddenInput from 'components/form/b-hidden-input/b-hidden-input';

import test from 'tests/config/unit/test';
import Component from 'tests/helpers/component';
import Utils from 'tests/helpers/utils';

test.describe('<b-hidden-input>', () => {
	test.beforeEach(async ({page, demoPage}) => {
		await demoPage.goto();

		const DataProviderAPI = await Utils.import<typeof DataProvider>(page, 'components/friends/data-provider');
		await DataProviderAPI.evaluate((ctx) => ctx.default.addToPrototype(ctx));
	});

	test('the component markup should have a <input type="hidden"/> tag with the provided attributes', async ({page}) => {
		await renderHiddenInput(page, {
			id: 'foo',
			name: 'bla',
			value: 'bar'
		});

		const
			input = <ElementHandle<HTMLInputElement>>(await page.waitForSelector('#foo', {state: 'attached'}));

		test.expect(
			await input.evaluate((ctx) => [
				ctx.tagName,
				ctx.type,
				ctx.name,
				ctx.value
			])

		).toEqual(['INPUT', 'hidden', 'bla', 'bar']);
	});

	test('the component should not be rendered visually', async ({page}) => {
		const target = await renderHiddenInput(page);

		test.expect(
			await target.evaluate((ctx) => [
				(<HTMLElement>ctx.$el).offsetHeight,
				(<HTMLElement>ctx.$el).offsetWidth
			])

		).toEqual([0, 0]);
	});

	test.describe('loading data from the provider', () => {
		test('if the provider returned not a dictionary, then this value is set as the component value', async ({page, context}) => {
			await context.route('/api', (r) => r.fulfill({
				status: 200,
				body: 'foo'
			}));

			const target = await renderHiddenInput(page, {
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

			const target = await renderHiddenInput(page, {
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

	async function renderHiddenInput(page: Page, attrs: RenderComponentsVnodeParams['attrs'] = {}): Promise<JSHandle<bHiddenInput>> {
		await Component.createComponent(page, 'b-hidden-input', {
			attrs: {
				id: 'target',
				'data-id': 'target',
				...attrs
			}
		});

		return Component.waitForComponentStatus(page, '[data-id="target"]', 'ready');
	}
});
