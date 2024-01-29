/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */
import test from 'tests/config/unit/test';

import { renderSlider } from 'components/base/b-slider/test/helpers';
import type { JSHandle } from 'playwright';
import type bSlider from 'components/base/b-slider/b-slider';

test.use({
	isMobile: true,
	hasTouch: true,
	viewport: {
		width: 375,
		height: 667
	}
});

test.describe('<b-slider> in scroll snap mode', () => {
	let
		slider: JSHandle<bSlider>;

	test.beforeEach(async ({page, demoPage}) => {
		await demoPage.goto();

		slider = await renderSlider(page, {
			childrenIds: [1, 2, 3, 4],
			attrs: {
				useScrollSnap: true,
				mode: 'scroll'
			}
		});
	});

	test('should render g-slider', async ({page}) => {
		await test.expect(page.locator('.g-slider')).toBeVisible();
	});
});
