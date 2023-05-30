/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { JSHandle, Page } from 'playwright';

import Component from 'tests/helpers/component';

import type bWindow from 'components/base/b-window/b-window';

/**
 * Renders the `bWindow` component and returns `Promise<JSHandle>`
 *
 * @param page
 * @param params
 */
export async function renderWindow(
	page: Page,
	{attrs, children}: RenderComponentsVnodeParams = {}
): Promise<JSHandle<bWindow>> {
	return Component.createComponent<bWindow>(page, 'b-window', {
		attrs: {
			id: 'target',
			title: 'Bla',
			...attrs
		},

		children
	});
}
