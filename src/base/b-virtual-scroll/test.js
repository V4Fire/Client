/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

module.exports = async (page, {browserType, componentDir, tmpDir}) => {
	await page.screenshot({path: `${tmpDir}/example-${browserType}.png`});

	describe('b-virtual-scroll', () => {
		it('getting a component instance from a DOM node', async () => {
			const
				component = await (await page.$('.b-virtual-scroll')).getProperty('component'),
				componentName = await component.getProperty('componentName');

			expect(await componentName.jsonValue()).toBe('b-virtual-scroll');
		});
	});
};
