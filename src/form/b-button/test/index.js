/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

// @ts-check

const
	h = include('tests/helpers');

module.exports = (page) => {
	describe('b-button', () => {
		beforeAll(async () => {
			await page.waitForSelector('#root-component', {timeout: (20).seconds()});
			await h.component.waitForComponent(page, '#root-component');

			await page.evaluate(() => {
				globalThis.removeCreatedComponents();

				const scheme = [
					{
						attrs: {
							id: 'target'
						}
					}
				];

				globalThis.renderComponents('b-button', scheme);
			});
		});

		it('getting a component instance from a DOM node', async () => {
			const
				component = await (await page.$('.b-button')).getProperty('component'),
				componentName = await component.getProperty('componentName');

			expect(await componentName.jsonValue()).toBe('b-button');
		});
	});
};
