/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const
	h = include('tests/helpers');

module.exports = async (page, {browserType, tmpDir}) => {
	await page.screenshot({path: `${tmpDir}/example-${browserType}.png`});

	describe('b-button', () => {
		beforeAll(async () => {
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
