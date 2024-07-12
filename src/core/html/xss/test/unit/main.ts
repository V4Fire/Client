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

import type * as XSSLAPI from 'core/html/xss';

test.describe('core/html/xss', () => {
	let xssAPI: JSHandle<typeof XSSLAPI>;

	test.beforeEach(async ({demoPage, page}) => {
		await demoPage.goto();
		xssAPI = await Utils.import(page, 'core/html/xss');
	});

	test.describe('`sanitize`', () => {
		test('should automatically remove unsafe attributes', async () => {
			const res = await xssAPI.evaluate((xss) =>
				xss.sanitize('<button onclick="javascript:void(console.log(document.cookie))">Press on me!</button>'));

			test.expect(res).toBe('<button>Press on me!</button>');
		});

		test('should support passing additional options to DOMPurify', async () => {
			const res = await xssAPI.evaluate((xss) =>
				xss.sanitize('<button example="custom">Press on me!</button>', {ADD_ATTR: ['example']}));

			test.expect(res).toBe('<button example="custom">Press on me!</button>');
		});
	});
});
