/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { JSHandle, Page } from 'playwright';

import test from 'tests/config/unit/test';

import { Component } from 'tests/helpers';
import { createSelector, assertResultText, waitForRender } from 'components/friends/async-render/test/helpers';

import type bFriendsAsyncRenderDummy from 'components/friends/async-render/test/b-friends-async-render-dummy/b-friends-async-render-dummy';

test.describe('friends/async-render inside functional component', () => {
	const componentName = 'b-friends-async-render-dummy-functional';

	test.beforeEach(async ({demoPage}) => {
		await demoPage.goto();
	});

	test.describe('`iterate`', () => {
		test.describe('should create an infinite render when `true` is passed', () => {
			[
				'infinite rendering with the removal of a node by the passed name when re-rendering',
				'infinite rendering with the removal of the node returned by the function when re-rendering'
			].forEach((desc) => {
				test(desc, async ({page}) => {
					const target = await renderDummy(page, desc);

					await assertResultText(page, 'Element: 0; Hook: beforeDataCreate;');

					await waitForRender(target, () => page.locator(createSelector('force')).click());
					await assertResultText(page, 'Element: 1; Hook: mounted;');

					await waitForRender(target, () => page.locator(createSelector('defer-force')).click());
					await assertResultText(page, 'Element: 2; Hook: mounted;');
				});
			});
		});
	});

	async function renderDummy(page: Page, stage: string): Promise<JSHandle<bFriendsAsyncRenderDummy>> {
		return Component.createComponent(page, componentName, {stage});
	}
});
