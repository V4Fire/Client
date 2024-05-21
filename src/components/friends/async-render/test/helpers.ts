/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { JSHandle, Page } from 'playwright';

import test from 'tests/config/unit/test';

import { DOM } from 'tests/helpers';

import type bFriendsAsyncRenderDummy from 'components/friends/async-render/test/b-friends-async-render-dummy/b-friends-async-render-dummy';

export const createSelector = DOM.elNameSelectorGenerator('b-friends-async-render-dummy');

/**
 * Asserts that the result element has the specified text
 *
 * @param page
 * @param text
 */
export async function assertResultText(page: Page, text: string): Promise<void> {
	await test.expect(page.locator(createSelector('result'))).toHaveText(text);
}

/**
 * Performs arbitrary action if needed and waits for the async render to complete
 *
 * @param target
 * @param [action]
 */
export async function waitForRender(
	target: JSHandle<bFriendsAsyncRenderDummy>,
	action?: () => Promise<void>
): Promise<void> {
	const renderDone = target.evaluate((ctx) => ctx.unsafe.localEmitter.promisifyOnce('asyncRenderChunkComplete'));
	await action?.();
	await renderDone;
}
