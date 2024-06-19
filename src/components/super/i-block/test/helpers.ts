/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { JSHandle, Page } from 'playwright';
import { Component } from 'tests/helpers';

import type bSuperIBlockDummy from 'components/super/i-block/test/b-super-i-block-dummy/b-super-i-block-dummy';
import type bSuperIBlockWatchDummy from 'components/super/i-block/test/b-super-i-block-watch-dummy/b-super-i-block-watch-dummy';
import type bSuperIBlockDestructorDummy from 'components/super/i-block/test/b-super-i-block-destructor-dummy/b-super-i-block-destructor-dummy';

/**
 * Returns the rendered `b-super-i-block-dummy` component
 *
 * @param page
 * @param attrs
 */
export async function renderDummy(
	page: Page,
	attrs: RenderComponentsVnodeParams['attrs'] = {}
): Promise<JSHandle<bSuperIBlockDummy>> {
	return Component.createComponent(page, 'b-super-i-block-dummy', attrs);
}

/**
 * Returns the rendered `b-super-i-block-watch-dummy` component
 * @param page
 */
export async function renderWatchDummy(
	page: Page
): Promise<JSHandle<bSuperIBlockWatchDummy>> {
	return Component.createComponent(page, 'b-super-i-block-watch-dummy');
}

/**
 * Returns the rendered `b-super-i-block-destructor-dummy` component
 * @param page
 */
export async function renderDestructorDummy(
	page: Page
): Promise<JSHandle<bSuperIBlockDestructorDummy>> {
	return Component.createComponent(page, 'b-super-i-block-destructor-dummy');
}
