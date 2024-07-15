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

import type * as PageMetaDataAPI from 'core/page-meta-data';

test.describe('core/page-meta-data ssr', () => {
	let pageMetaDataAPI: JSHandle<typeof PageMetaDataAPI>;

	test.beforeEach(async ({demoPage, page}) => {
		await demoPage.goto();
		pageMetaDataAPI = await Utils.import(page, 'core/page-meta-data');
	});

	test.describe('an instance of a `Meta` element', () => {
		test('should be rendered to a string', async () => {
			const description = 'Cool description';

			const res = await pageMetaDataAPI.evaluate(
				({Meta, SSREngine}, description) =>
					new Meta(new SSREngine(), {name: 'description', content: description}).render(),

				description
			);

			test.expect(res).toBe(`<meta content="${description}" name="description">`);
		});

		test("the `update` method call should update the element's attributes", async () => {
			const
				description = 'Cool description',
				newDescription = 'Very cool description';

			const res = await pageMetaDataAPI.evaluate(
				({Meta, SSREngine}, [description, newDescription]) => {
					const meta = new Meta(new SSREngine(), {name: 'description', content: description});

					meta.update({content: newDescription});

					return meta.render();
				},

				[description, newDescription]
			);

			test.expect(res).toBe(`<meta content="${newDescription}" name="description">`);
		});
	});

	test.describe('an instance of a `Link` element', () => {
		test('should be rendered to a string', async () => {
			const href = 'https://example.com/';

			const res = await pageMetaDataAPI.evaluate(
				({Link, SSREngine}, href) =>
					new Link(new SSREngine(), {rel: 'canonical', href}).render(),

				href
			);

			test.expect(res).toBe(`<link href="${href}" rel="canonical">`);
		});
	});
});
