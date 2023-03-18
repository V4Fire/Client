/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import test from 'tests/config/unit/test';

import { renderProvider, mockAPIResponse } from 'components/base/b-remote-provider/test/helpers';

test.describe('<b-remote-provider>', () => {
	test.beforeEach(async ({demoPage}) => {
		await demoPage.goto();
	});

	test('the component markup should have a <b-remote-provider /> tag with the provided attributes', async ({page}) => {
		const
			id = 'foo',
			dataVal = 'bar';

		await renderProvider(page, {
			id,
			'data-val': dataVal
		});

		const
			provider = await page.$(`#${id}`);

		test.expect(provider).not.toBeNull();

		const attrs = await provider!.evaluate((ctx) => [
			ctx.id,
			ctx.dataset.val,
			ctx.tagName
		]);

		test.expect(attrs).toEqual([id, dataVal, 'DIV']);
	});

	test('stores loaded data to the `db` field of the parent component', async ({page, context}) => {
		const
			data = {foo: 'bar'},
			field = 'foo-bar-baz';

		await mockAPIResponse(context, data);

		const provider = await renderProvider(page, {
			dataProvider: 'Provider',
			field
		});

		const val = await provider.evaluate((ctx, field) => ctx.$parent?.field.get(field), field);

		test.expect(val).toBeDefined();
		test.expect(JSON.parse(val!)).toEqual(data);
	});
});
