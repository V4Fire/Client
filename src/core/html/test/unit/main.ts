/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { JSHandle } from 'playwright';

import test from 'tests/config/unit/test';
import Utils from 'tests/helpers/utils';

import type * as HTMLAPI from 'core/html';

test.describe('core/html', () => {
	let htmlAPI: JSHandle<typeof HTMLAPI>;

	test.beforeEach(async ({demoPage, page}) => {
		await demoPage.goto();
		htmlAPI = await Utils.import(page, 'core/html');
	});

	test.describe('`getSrcSet`', () => {
		test('should return an srcset string', async () => {
			const res = (await htmlAPI.evaluate((html) => html.getSrcSet({
				'2x': 'http://img-hdpi.png',
				'3x': 'http://img-xhdpi.png'
			}))).trim();

			test.expect(res).toBe('http://img-hdpi.png 2x, http://img-xhdpi.png 3x');
		});
	});
});
