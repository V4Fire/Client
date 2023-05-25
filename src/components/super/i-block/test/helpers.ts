/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { JSHandle, Page } from 'playwright';
import { Component } from 'tests/helpers';
import type bSuperIBlockWatchDummy from './b-super-i-block-watch-dummy/b-super-i-block-watch-dummy';

/**
 * Returns the rendered `b-super-i-block-watch-dummy` component
 * @param page
 */
export async function renderWatchDummy(
	page: Page
): Promise<JSHandle<bSuperIBlockWatchDummy>> {
	return Component.createComponent(page, 'b-super-i-block-watch-dummy');
}
