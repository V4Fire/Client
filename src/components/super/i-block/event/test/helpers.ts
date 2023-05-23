/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { JSHandle, Page } from 'playwright';

import { Component } from 'tests/helpers';

import type bDummy from 'components/dummies/b-dummy/b-dummy';

/**
 * Returns the rendered dummy component
 *
 * @param page
 * @param attrs
 */
export async function renderDummy(
	page: Page, attrs: RenderComponentsVnodeParams['attrs'] = {}
): Promise<JSHandle<bDummy>> {
	return Component.createComponent(page, 'b-dummy', attrs);
}
