/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import test from 'tests/config/unit/test';

import { renderSlider } from 'components/base/b-slider/test/helpers';

test.describe('<b-slider>', () => {
	test.beforeEach(async ({demoPage}) => {
		await demoPage.goto();
	});

	test('the component markup should have the <b-slider data-val="bar" id="foo" /> tag', async ({page}) => {
		const
			id = 'foo',
			dataVal = 'bar';

		await renderSlider(page, {
			id,
			'data-val': dataVal
		});

		const
			slider = await page.$(`#${id}`);

		test.expect(slider).not.toBeNull();

		const attrs = await slider!.evaluate((ctx) => [
			ctx.id,
			ctx.dataset.val,
			ctx.tagName
		]);

		test.expect(attrs).toEqual([id, dataVal, 'DIV']);
	});

	test.describe('the component markup should have the <b-slider /> tag with the provided slides', () => {
		const
			items = [{id: 'foo'}, {id: 'bar'}, {id: 'baz'}];

		test('loads slides from data provider', async ({page, context}) => {
			await context.route('/api', (route) => route.fulfill({
				status: 200,
				body: JSON.stringify(items)
			}));

			const slider = await renderSlider(page, {
				dataProvider: 'Provider',
				item: 'b-checkbox',
				itemProps: ({id}) => ({id}),
				componentConverter: (val) => JSON.parse(val)
			});

			const {length, ids} = await slider.evaluate(({$children}) => ({
				length: $children.length,
				ids: $children.map(({$props}) => $props.id)
			}));

			test.expect(length).toBe(items.length);
			test.expect(ids).toEqual(items.map(({id}) => id));
		});

		test('slides should recieve props from the specified object', async ({page}) => {
			const name = 'foo';
			const slider = await renderSlider(page, {
				items,
				item: 'b-checkbox',
				itemProps: {name}
			});

			const {length, names} = await slider.evaluate(({$children}) => ({
				length: $children.length,
				names: $children.map((child) => child.$props.name)
			}));

			test.expect(length).toBe(items.length);
			test.expect(names).toEqual(Array(length).fill(name));
		});

		test('slides should recieve props from the specified function', async ({page}) => {
			const slider = await renderSlider(page, {
				items,
				item: 'b-checkbox',
				itemProps: ({id}, i) => ({id: `${id}_${i}`})
			});

			const {length, ids} = await slider.evaluate(({$children}) => ({
				length: $children.length,
				ids: $children.map((child) => child.$props.id)
			}));

			test.expect(length).toBe(items.length);
			test.expect(ids).toEqual(items.map(({id}, i) => `${id}_${i}`));
		});
	});
});

