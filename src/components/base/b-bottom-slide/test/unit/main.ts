/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import test from 'tests/config/unit/test';

import {

	renderBottomSlide,

	getAbsoluteComponentWindowOffset

} from 'components/base/b-bottom-slide/test/helpers';

test.use({
	isMobile: true,
	viewport: {
		width: 375,
		height: 667
	}
});

test.describe('<b-bottom-slide>', () => {
	test.beforeEach(async ({demoPage}) => {
		await demoPage.goto();
	});

	test('should be hidden by default', async ({page}) => {
		const component = await renderBottomSlide(page, {
			heightMode: 'content'
		});

		const
			windowTopOffset = await getAbsoluteComponentWindowOffset(component);

		test.expect(windowTopOffset).toBe(0);
	});
});
