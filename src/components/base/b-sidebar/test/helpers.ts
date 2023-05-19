/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { Page, JSHandle } from 'playwright';

import DOM from 'tests/helpers/dom';
import Component from 'tests/helpers/component';

import type bSidebar from 'components/base/b-sidebar/b-sidebar';

/**
 * Renders the `bSidebar` component and returns `Promise<JSHandle>`
 * @param page
 */
export async function renderSidebar(page: Page): Promise<JSHandle<bSidebar>> {
	return Component.createComponent<bSidebar>(page, 'b-sidebar', {
		attrs: {},
		children: {
			default: {
				type: 'div',
				children: {
					default: 'Hello content'
				},

				attrs: {
					id: 'test-div'
				}
			}
		}
	});
}

/**
 * Returns the class list of the root node `bSidebar`
 * @param target
 */
export function getClassList(target: JSHandle<bSidebar>): Promise<string[] | undefined> {
	return target.evaluate((ctx) => ctx.$el?.className.split(' '));
}

/**
 * Returns a selector for the element
 * @param elName
 */
export const createSidebarSelector = DOM.elNameSelectorGenerator('b-sidebar');
