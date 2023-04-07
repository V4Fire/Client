/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { JSHandle, Page } from 'playwright';

import type bWindow from 'components/base/b-window/b-window';

import Component from 'tests/helpers/component';

/**
 * Renders `bWindow` component in the test page
 *
 * @param page
 * @param param1 Component params
 */
export async function renderWindow(
  page: Page, {attrs, children}: RenderComponentsVnodeParams = {}
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

/**
 * Returns element selector for the given component
 *
 * @param target
 * @param elementName
 */
export async function getComponentElementSelector(
	target: JSHandle<bWindow>,
	elementName: string
): Promise<string> {
	return target
		.evaluate((ctx, elementName) => ctx.unsafe.block!.getElementSelector(elementName), elementName);
}
