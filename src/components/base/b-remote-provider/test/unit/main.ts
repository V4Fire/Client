/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { JSHandle, Page } from 'playwright';

import test from 'tests/config/unit/test';
import Component from 'tests/helpers/component';

import type bRemoteProvider from 'components/base/b-remote-provider/b-remote-provider';
import { mockAPI } from 'components/base/b-remote-provider/test/helpers';

test.describe('<b-remote-provider>', () => {
	test.beforeEach(async ({demoPage}) => {
		await demoPage.goto();
	});

	test('the component should render as a div element with the provided attributes', async ({page}) => {
		const
			id = 'foo',
			dataVal = 'bar';

		await renderProvider(page, {
			id,
			'data-val': dataVal
		});

		const
			provider = page.locator(`#${id}`);

		test.expect(provider).not.toBeNull();

		const attrs = await provider.evaluate((ctx) => [
			ctx.id,
			ctx.dataset.val,
			ctx.tagName
		]);

		test.expect(attrs).toEqual([id, dataVal, 'DIV']);
	});

	test('if the `field` prop is provided to the component, it should save the provider data to the parent component at the path specified in that prop', async ({page, context}) => {
		const
			data = {foo: 'bar'},
			field = 'foo-bar-baz';

		await mockAPI(context, data);

		const provider = await renderProvider(page, {
			dataProvider: 'Provider',
			field
		});

		const
			str = await provider.evaluate((ctx, fieldName) => ctx.$parent?.field.get<string>(fieldName), field),
			val = JSON.parse(str ?? 'null');

		test.expect(val).toEqual(data);
	});

	function renderProvider(page: Page, attrs: RenderComponentsVnodeParams['attrs'] = {}): Promise<JSHandle<bRemoteProvider>> {
		return Component.createComponent(page, 'b-remote-provider', {
			attrs
		});
	}
});
