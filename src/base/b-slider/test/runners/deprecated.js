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
	h = include('tests/helpers').default,
	{initSlider} = include('src/base/b-slider/test/helpers');

/** @param {Page} page */
module.exports = (page) => {
	const
		textSlotContent = 'Lorem Ipsum';

	beforeEach(async () => {
		await page.evaluate(() => {
			globalThis.removeCreatedComponents();
		});
	});

	describe('b-slider providing of slots', () => {
		it('"beforeOptions" slot', async () => {
			const
				w = h.dom.elNameGenerator('.b-slider', 'view-content');

			const target = await initSlider(page, {
				attrs: {
					option: 'b-checkbox',
					options: [{id: '1'}, {id: '2'}]
				},
				content: {
					beforeOptions: `return () => "${textSlotContent}"`
				}
			});

			const text = await target.evaluate(
				(ctx, selector) => ctx.$el.querySelector(selector).firstChild.wholeText.trim(), w
			);

			expect(text).toEqual(textSlotContent);
		});

		it('"afterOptions" slot', async () => {
			const
				w = h.dom.elNameGenerator('.b-slider', 'view-content');

			const target = await initSlider(page, {
				attrs: {
					option: 'b-checkbox',
					options: [{id: '1'}, {id: '2'}]
				},
				content: {
					afterOptions: `return () => "${textSlotContent}"`
				}
			});

			const text = await target.evaluate(
				(ctx, selector) => ctx.$el.querySelector(selector).lastChild.wholeText.trim(), w
			);

			expect(text).toEqual(textSlotContent);
		});

		it('simple loading options from a provider', async () => {
			const target = await initSlider(page, {
				attrs: {
					option: 'b-checkbox',
					dataProvider: 'demo.List'
				}
			});

			const
				optionsCount = await target.evaluate((ctx) => ctx.$el.querySelectorAll('.b-slider__option').length);

			expect(optionsCount).toEqual(2);
		});

		it('loading options with the external `optionProps` as a function', async () => {
			const
				options = [{id: 'foo'}, {id: 'bar'}, {id: 'baz'}],
				optionClass = h.dom.elNameGenerator('.b-slider', 'option');

			const target = await initSlider(page, {
				attrs: {
					option: 'b-checkbox',
					options,
					optionProps: 'return (el, i) => ({id: el.id + "_" + i})'
				}
			});

			const optionsCount = await target.evaluate(
				(ctx, name) => ctx.$el.querySelectorAll(name).length,
				optionClass
			);

			const getItem = (item, index) => target.evaluate(
				(ctx, {item, index}) => ctx.$el.querySelector(`#${item.id}_${index}`) != null,
				{item, index}
			);

			const
				results = await Promise.all(options.map(getItem));

			expect(results.every((v) => v)).toEqual(true);
			expect(optionsCount).toEqual(3);
		});

		it('loading options with the external `optionProps` as an object', async () => {
			const
				options = [{id: 'foo'}, {id: 'bar'}, {id: 'baz'}];

			const target = await initSlider(page, {
				attrs: {
					option: 'b-checkbox',
					options,
					optionProps: {name: 'foo'}
				}
			});

			const namedCount = await target.evaluate(
				(ctx) => ctx.$el.querySelectorAll('[name="foo"]').length
			);

			expect(namedCount).toEqual(3);
		});
	});
};
