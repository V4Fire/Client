/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { BrowserContext, JSHandle, Page } from 'playwright';

import DOM from 'tests/helpers/dom';
import Component from 'tests/helpers/component';

import type bList from 'components/base/b-list/b-list';

/**
 * Provides an API to intercept and mock response for the `b-list` request
 * @param pageOrContext
 */
export async function interceptListRequest(
	pageOrContext: Page | BrowserContext
): Promise<void> {
	return pageOrContext.route(/api/, async (route) => route.fulfill({
		status: 200,
		contentType: 'application/json',
		body: JSON.stringify([
			{label: 'Foo', value: 'foo'},
			{label: 'Bar', value: 'bar'}
		])
	}));
}

/**
 * Returns the rendered `b-list` component
 *
 * @param page
 * @param paramsOrAttrs
 */
export async function renderList(
	page: Page,
	paramsOrAttrs: RenderComponentsVnodeParams | RenderComponentsVnodeParams['attrs'] = {}
): Promise<JSHandle<bList>> {
	let
		attrs: RenderComponentsVnodeParams['attrs'],
		children: RenderComponentsVnodeParams['children'];

	if (isRenderComponentsVNodeParams(paramsOrAttrs)) {
		attrs = paramsOrAttrs.attrs;
		children = paramsOrAttrs.children;

	} else {
		attrs = paramsOrAttrs;
	}

	return Component.createComponent(page, 'b-list', {
		attrs: {
			id: 'target',
			items: [
				{
					label: 'Foo',
					value: 0,
					attrs: {
						title: 'Custom attr'
					}
				},

				{
					label: 'Bla',
					value: 1
				}
			],

			...attrs
		},

		children
	});
}

/**
 * Checks if the given value is `RenderComponentsVNodeParams`
 * @param value
 */
function isRenderComponentsVNodeParams(
	value: RenderComponentsVnodeParams | RenderComponentsVnodeParams['attrs']
): value is RenderComponentsVnodeParams {
	return (<RenderComponentsVnodeParams>value).attrs != null || (<RenderComponentsVnodeParams>value).children != null;
}

/**
 * Returns a selector for the element
 * @param elName
 */
export const createListSelector = DOM.elNameSelectorGenerator('b-list');
