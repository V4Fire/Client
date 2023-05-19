/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { JSHandle, Page } from 'playwright';

import test from 'tests/config/unit/test';

import { BOM, Component, DOM } from 'tests/helpers';

import type bFriendsAsyncRenderDummy from 'components/friends/async-render/test/b-friends-async-render-dummy/b-friends-async-render-dummy';
import type { ComponentInterface } from 'components/friends/async-render/test/b-friends-async-render-dummy/b-friends-async-render-dummy';

test.describe('friends/async-render', () => {
	const
		componentName = 'b-friends-async-render-dummy',
		createSelector = DOM.elNameSelectorGenerator(componentName);

	test.beforeEach(async ({demoPage}) => {
		await demoPage.goto();
	});

	test('nullish rendering', async ({page}) => {
		await renderDummy(page, 'nullish rendering');
		await test.expect(page.locator(createSelector('result')).innerHTML()).resolves.toEqual('');
	});

	// FIXME: broken tests
	[
		'infinite rendering',
		'infinite rendering with providing a function'
	].forEach((desc) => {
		test.skip(desc, async ({page}) => {
			const target = await renderDummy(page, desc);
			await assertResultText(page, 'Element: 0; Hook: renderTracked;');

			await waitForRender(target, () => page.locator(createSelector('force')).click());
			await assertResultText(page, 'Element: 1; Hook: mounted;');

			await waitForRender(target, () => page.locator(createSelector('defer-force')).click());
			await assertResultText(page, 'Element: 2; Hook: mounted;');
		});
	});

	test('deactivating/activating the parent component while rendering', async ({page}) => {
		const target = await renderDummy(page, 'deactivating/activating the parent component while rendering');

		await assertResultText(page, '');

		await page.locator(createSelector('deactivate')).click();
		await BOM.waitForIdleCallback(page);
		await assertResultText(page, '');

		await waitForRender(target, () => page.locator(createSelector('activate')).click());
		await assertResultText(page, 'Element: 0; Hook: activated; Element: 1; Hook: activated;');
	});

	test('updating the parent component state', async ({page}) => {
		const target = await renderDummy(page, 'updating the parent component state');
		await assertResultText(page, 'Element: 0; Hook: renderTracked;  Element: 1; Hook: renderTracked;');

		await waitForRender(target, () => page.locator(createSelector('update')).click());
		await assertResultText(page, 'Element: 0; Hook: beforeUpdate;  Element: 1; Hook: renderTracked;');

		const hooks = await target.evaluate((ctx) => {
			const oldRefs = <ComponentInterface[]>ctx.unsafe.tmp.oldRefs;

			return [oldRefs[0].hook, oldRefs[1].hook];
		});

		test.expect(hooks).toEqual([
			'updated',
			'destroyed'
		]);
	});

	test('clearing by the specified group name', async ({page}) => {
		const target = await renderDummy(page, 'clearing by the specified group name');
		await assertResultText(page, 'Element: 0; Hook: renderTracked; Element: 1; Hook: mounted;');

		await waitForRender(target, () => page.locator(createSelector('update')).click());
		await assertResultText(page, 'Element: 0; Hook: beforeUpdate; Element: 1; Hook: mounted; Element: 1; Hook: updated;');

		await page.locator(createSelector('clear')).click();
		await assertResultText(page, 'Element: 0; Hook: beforeUpdate;');
	});

	test('loading dynamic modules', async ({page}) => {
		const target = await renderDummy(page, 'loading dynamic modules');

		await waitForRender(target);
		await assertResultText(page, 'Ok 1  Ok 2');
	});

	[
		[
			'simple array rendering',
			'Element: 4',
			'Element: 1; Hook: renderTracked; Element: 2; Hook: mounted; Element: 3; Hook: mounted; Element: 4; Hook: mounted;'
		],

		[
			'array rendering with specifying a chunk size',
			'Element: 4',
			'Element: 1; Hook: renderTracked; Element: 2; Hook: renderTracked; Element: 3; Hook: renderTracked; Element: 4; Hook: mounted;'
		],

		[
			'array rendering with specifying a start position and chunk size',
			'Element: 4',
			'Element: 2; Hook: renderTracked; Element: 3; Hook: renderTracked; Element: 4; Hook: mounted;'
		],

		[
			'simple object rendering',
			'Element: b,',
			'Element: a,1; Hook: renderTracked; Element: b,2; Hook: mounted;'
		],

		[
			'object rendering with specifying a start position',
			'Element: b,',
			'Element: b,2; Hook: renderTracked;'
		],

		[
			'simple string rendering',
			'Element: 🇷🇺',
			'Element: 1; Hook: renderTracked; Element: 😃; Hook: mounted; Element: à; Hook: mounted; Element: 🇷🇺; Hook: mounted;'
		],

		[
			'simple iterable rendering',
			'Element: 2',
			'Element: 1; Hook: renderTracked; Element: 2; Hook: mounted;'
		],

		[
			'range rendering with specifying a filter',
			'Element: 2',
			'Element: 0; Hook: renderTracked; Element: 2; Hook: mounted;'
		],

		[
			'range rendering with `useRAF`',
			'Element: 1',
			'Element: 0; Hook: renderTracked; Element: 1; Hook: mounted;'
		]
	].forEach(([desc, last, expected]) => {
		test(desc, async ({page}) => {
			const target = await renderDummy(page, desc);

			await target.evaluate(async (ctx, last) => {
				const wrapper = ctx.unsafe.block!.element('result');

				if (!new RegExp(RegExp.escape(last)).test(wrapper?.textContent ?? '')) {
					await ctx.unsafe.localEmitter.promisifyOnce('asyncRenderComplete');
				}
			}, last);

			await assertResultText(page, expected);
		});
	});

	[
		// FIXME: broken test
		['range rendering by click', 'Element: 0; Hook: mounted;'],
		['iterable with promises rendering by click', 'Element: 1; Hook: mounted; Element: 2; Hook: mounted;'],
		['promise with iterable rendering by click', 'Element: 1; Hook: mounted; Element: 2; Hook: mounted;'],
		['promise with nullish rendering by click', '']

	].forEach(([desc, expected]) => {
		test(desc, async ({page}) => {
			const target = await renderDummy(page, desc);

			await test.expect(page.locator(createSelector('result')).innerHTML()).resolves.toEqual('');

			const renderDone = target.evaluate(async (ctx) => Promise.race([
				ctx.unsafe.localEmitter.promisifyOnce('asyncRenderComplete'),
				ctx.unsafe.async.sleep(300)
			]));

			await page.locator(createSelector('emit')).click();
			await renderDone;

			await assertResultText(page, expected);
		});
	});

	/**
	 * Returns the rendered dummy component
	 *
	 * @param page
	 * @param stage
	 */
	async function renderDummy(page: Page, stage: string): Promise<JSHandle<bFriendsAsyncRenderDummy>> {
		return Component.createComponent(page, componentName, {stage});
	}

	/**
	 * Asserts that the result element has the specified text
	 *
	 * @param page
	 * @param text
	 */
	async function assertResultText(page: Page, text: string): Promise<void> {
		await test.expect(page.locator(createSelector('result'))).toHaveText(text);
	}

	/**
	 * Performs action if needed and waits for the async render to complete
	 *
	 * @param target
	 * @param [action]
	 */
	async function waitForRender(
		target: JSHandle<bFriendsAsyncRenderDummy>,
		action?: () => Promise<void>
	): Promise<void> {
		const renderDone = target.evaluate((ctx) => ctx.unsafe.localEmitter.promisifyOnce('asyncRenderChunkComplete'));
		await action?.();
		await renderDone;
	}
});
