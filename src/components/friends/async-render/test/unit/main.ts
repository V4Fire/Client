/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { JSHandle, Page } from 'playwright';

import test from 'tests/config/unit/test';

import { BOM, Component } from 'tests/helpers';
import { createSelector, assertResultText, waitForRender } from 'components/friends/async-render/test/helpers';

import type bFriendsAsyncRenderDummy from 'components/friends/async-render/test/b-friends-async-render-dummy/b-friends-async-render-dummy';
import type { ComponentInterface } from 'components/friends/async-render/test/b-friends-async-render-dummy/b-friends-async-render-dummy';

// Disclaimer:
// To understand the tests refer to the `b-friends-async-render-dummy` component template
test.describe('friends/async-render', () => {
	const componentName = 'b-friends-async-render-dummy';

	test.beforeEach(async ({demoPage}) => {
		await demoPage.goto();
	});

	test('should not render anything when `null` is passed', async ({page}) => {
		await renderDummy(page, 'nullish rendering');
		await test.expect(page.locator(createSelector('result')).innerHTML()).resolves.toEqual('');
	});

	test.describe('`iterate`', () => {
		test('should not render anything when `null` is passed', async ({page}) => {
			await renderDummy(page, 'nullish rendering');
			await test.expect(page.locator(createSelector('result')).innerHTML()).resolves.toEqual('');
		});

		test.describe('should create an infinite render when `true` is passed', () => {
			[
				'infinite rendering with the removal of a node by the passed name when re-rendering',
				'infinite rendering with the removal of the node returned by the function when re-rendering'
			].forEach((desc) => {
				test(desc, async ({page}) => {
					const target = await renderDummy(page, desc);

					await assertResultText(page, 'Element: 0; Hook: beforeMount;');

					await waitForRender(target, () => page.locator(createSelector('force')).click());
					await assertResultText(page, 'Element: 1; Hook: mounted;');

					await waitForRender(target, () => page.locator(createSelector('defer-force')).click());
					await assertResultText(page, 'Element: 2; Hook: mounted;');
				});
			});
		});

		[
			[
				'simple array rendering',
				'Element: 4',
				'Element: 1; Hook: beforeMount; Element: 2; Hook: mounted; Element: 3; Hook: mounted; Element: 4; Hook: mounted;'
			],

			[
				'array rendering with the specified chunk size',
				'Element: 4',
				'Element: 1; Hook: beforeMount; Element: 2; Hook: beforeMount; Element: 3; Hook: beforeMount; Element: 4; Hook: mounted;'
			],

			[
				'array rendering with the specified start position and chunk size',
				'Element: 4',
				'Element: 2; Hook: beforeMount; Element: 3; Hook: beforeMount; Element: 4; Hook: mounted;'
			],

			[
				'simple object rendering',
				'Element: b,',
				'Element: a,1; Hook: beforeMount; Element: b,2; Hook: mounted;'
			],

			[
				'object rendering with the specified start position',
				'Element: b,',
				'Element: b,2; Hook: beforeMount;'
			],

			[
				'simple string rendering',
				'Element: 🇷🇺',
				'Element: 1; Hook: beforeMount; Element: 😃; Hook: mounted; Element: à; Hook: mounted; Element: 🇷🇺; Hook: mounted;'
			],

			[
				'simple iterable rendering',
				'Element: 2',
				'Element: 1; Hook: beforeMount; Element: 2; Hook: mounted;'
			],

			[
				'range rendering with the specified filter',
				'Element: 2',
				'Element: 0; Hook: beforeMount; Element: 2; Hook: mounted;'
			],

			[
				'range rendering with `useRAF`',
				'Element: 1',
				'Element: 0; Hook: beforeMount; Element: 1; Hook: mounted;'
			]
		].forEach(([desc, last, expected]) => {
			test(`${desc} should work`, async ({page}) => {
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
			['range rendering by a click', 'Element: 0; Hook: mounted;'],
			['iterable with promises rendering by a click', 'Element: 1; Hook: mounted; Element: 2; Hook: mounted;'],
			['promise with iterable rendering by a click', 'Element: 1; Hook: mounted; Element: 2; Hook: mounted;'],
			['promise with nullish rendering by a click', '']
		].forEach(([desc, expected]) => {
			test(`${desc} should work`, async ({page}) => {
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
	});

	test.describe('asynchronous rendering if component is deactivated', () => {
		test([
			'should not render async content when the component is deactivated,',
			'asynchronous content should only be rendered after a component has been activated'
		].join(' '), async ({page}) => {
			const target = await renderDummy(page, 'deactivating/activating the parent component while rendering');

			await assertResultText(page, '');
			await page.locator(createSelector('deactivate')).click();

			// There is a 200ms delay for async render in the template,
			// so we wait until page becomes idle and after that nothing should be rendered
			await BOM.waitForIdleCallback(page);
			await assertResultText(page, '');

			await waitForRender(target, () => page.locator(createSelector('activate')).click());
			await assertResultText(page, 'Element: 0; Hook: activated; Element: 1; Hook: activated;');
		});
	});

	test('should re-render async content when the parent component is updated', async ({page}) => {
		const target = await renderDummy(page, 'updating the parent component state');
		await assertResultText(page, 'Element: 0; Hook: beforeMount;  Element: 1; Hook: beforeMount;');

		await waitForRender(target, () => page.locator(createSelector('update')).click());
		await assertResultText(page, 'Element: 0; Hook: beforeUpdate;  Element: 1; Hook: beforeMount;');

		const hooks = await target.evaluate((ctx) => {
			const oldRefs = <ComponentInterface[]>ctx.unsafe.tmp.oldRefs;
			return [oldRefs[0].hook, oldRefs[1]?.hook];
		});

		test.expect(hooks).toEqual([
			'updated',
			'destroyed'
		]);
	});

	test('should clear async content when `async.clearAll` is invoked', async ({page}) => {
		const target = await renderDummy(page, 'clearing by the specified group name');
		await assertResultText(page, 'Element: 0; Hook: beforeMount; Element: 1; Hook: mounted;');

		await waitForRender(target, () => page.locator(createSelector('update')).click());
		await assertResultText(page, 'Element: 0; Hook: beforeUpdate; Element: 1; Hook: mounted; Element: 1; Hook: updated;');

		await page.locator(createSelector('clear')).click();
		await assertResultText(page, 'Element: 0; Hook: beforeUpdate;');
	});

	test('should load and render dynamic modules using the async render', async ({page}) => {
		const target = await renderDummy(page, 'loading dynamic modules');

		await waitForRender(target);
		await assertResultText(page, 'Ok 1  Ok 2');
	});

	test('nested asyncRender tasks should work correctly with nested async-target nodes', async ({page}) => {
		const target = await renderDummy(page, 'check nested async render target');
		await page.locator(createSelector('update')).click();

		await waitForRender(target);
		await assertResultText(page, '01');
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
});
