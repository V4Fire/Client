/*!
* V4Fire Client Core
* https://github.com/V4Fire/Client
*
* Released under the MIT license
* https://github.com/V4Fire/Client/blob/master/LICENSE
*/

// @ts-check

/**
 * @typedef {import('playwright').Page} Page
 */

const
	h = include('tests/helpers');

/**
 * @param {Page} page
 */
module.exports = (page) => {
	const
		textSlotContent = 'Lorem Ipsum';

	beforeEach(async () => {
		await page.evaluate(() => {
			globalThis.removeCreatedComponents();
		});
	});

	const init = async ({attrs, content} = {}) => {
		await page.evaluate(({attrs, content}) => {
			globalThis.removeCreatedComponents();

			Object.forEach(content, (el, key) => {
				// eslint-disable-next-line no-new-func
				content[key] = /return /.test(el) ? Function(el)() : el;
			});

			Object.forEach(attrs, (el, key) => {
				// eslint-disable-next-line no-new-func
				attrs[key] = /return /.test(el) ? Function(el)() : el;
			});

			const baseAttrs = {
				id: 'target'
			};

			const scheme = [
				{
					attrs: {
						...baseAttrs,
						...attrs
					},

					content
				}
			];

			globalThis.renderComponents('b-slider', scheme);
		}, {attrs, content});

		await h.bom.waitForIdleCallback(page);
		await h.component.waitForComponentStatus(page, '.b-slider', 'ready');
		return h.component.waitForComponent(page, '#target');
	};

	describe('b-slider providing of slots', () => {
		it('"beforeOptions" slot', async () => {
			const
				w = h.dom.elNameGenerator('.b-slider', 'view-content');

			const target = await init({
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

			const target = await init({
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
	});
};
