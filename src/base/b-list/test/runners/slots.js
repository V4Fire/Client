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

/** @param {Page} page */
module.exports = (page) => {
	beforeEach(async () => {
		await page.evaluate(() => {
			globalThis.removeCreatedComponents();
		});
	});

	describe('b-list providing of slots', () => {
		const init = async (params = {}) => {
			await page.evaluate(({content, attrs}) => {
				Object.forEach(content, (el, key) => {
					// eslint-disable-next-line no-new-func
					content[key] = /return /.test(el) ? Function(el)() : el;
				});

				const scheme = [
					{
						content,

						attrs: {
							id: 'target',

							items: [
								{
									label: 'Foo',
									value: 0
								},

								{
									label: 'Bla',
									value: 1
								}
							],

							...attrs
						}
					}
				];

				globalThis.renderComponents('b-list', scheme);
			}, params);

			await h.component.waitForComponentStatus(page, '#target', 'ready');
			return h.component.waitForComponent(page, '#target');
		};

		it('default slot', async () => {
			const target = await init({
				content: {
					default: 'return ({item}) => "Label: " + item.label'
				}
			});

			expect(
				await target.evaluate((ctx) => Array.from(ctx.block.elements('link-value'))
					.map((el) => el.textContent.trim()))

			).toEqual(['Label: Foo', 'Label: Bla']);
		});

		it('icon slots', async () => {
			const target = await init({
				content: {
					icon: 'return ({icon}) => icon',
					preIcon: 'return ({icon}) => icon',
					progressIcon: 'return ({icon}) => icon'
				},

				attrs: {
					items: [
						{
							label: 'Foo',
							icon: 'foo',
							preIcon: 'foo2',
							progressIcon: 'foo3'
						},

						{
							label: 'Bla',
							icon: 'bla',
							preIcon: 'bla2',
							progressIcon: 'bla3'
						}
					]
				}
			});

			expect(
				await target.evaluate((ctx) => Array.from(ctx.block.elements('link-post-icon'))
					.map((el) => el.textContent.trim()))

			).toEqual(['foo', 'bla']);

			expect(
				await target.evaluate((ctx) => Array.from(ctx.block.elements('link-pre-icon'))
					.map((el) => el.textContent.trim()))

			).toEqual(['foo2', 'bla2']);

			expect(
				await target.evaluate((ctx) => Array.from(ctx.block.elements('link-progress'))
					.map((el) => el.textContent.trim()))

			).toEqual(['foo3', 'bla3']);
		});
	});
};
