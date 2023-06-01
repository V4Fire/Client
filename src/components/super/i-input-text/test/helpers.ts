/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { JSHandle, Page } from 'playwright';

import { Component } from 'tests/helpers';

import type bSuperIInputTextDummy from 'components/super/i-input-text/test/b-super-i-input-text-dummy/b-super-i-input-text-dummy';

/**
 * Returns the rendered `b-super-i-input-text-dummy` component
 *
 * @param page - playwright page
 * @param [attrs] - component attributes
 */
export async function renderDummyInput(
	page: Page, attrs: RenderComponentsVnodeParams['attrs'] = {}
): Promise<JSHandle<bSuperIInputTextDummy>> {
	await Component.waitForComponentTemplate(page, 'b-super-i-input-text-dummy');
	return Component.createComponent(
		page,
		'b-super-i-input-text-dummy-functional',
		{attrs}
	);
}
