/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/* eslint-disable no-bitwise */

import type { Page } from 'playwright';

import test from 'tests/config/unit/test';

import { Component } from 'tests/helpers';

import type { VNode } from 'core/component/engines';
import { flagValues } from 'core/component/render/helpers/flags';

import type bComponentRenderFlagsDummy from 'core/component/render/helpers/test/b-component-render-flags-dummy/b-component-render-flags-dummy';

test.describe('core/component/render/helpers/flags', () => {
	test.beforeEach(async ({demoPage, page}) => {
		await demoPage.goto();
		await Component.waitForComponentTemplate(page, 'b-component-render-flags-dummy');
	});

	test.describe('with a functional component', () => {
		test('should add `props` to `patchFlag` if a node has an event handler', async ({page}) => {
			await renderDummy(page, true);
			const vnode = page.getByTestId('vnode');

			// FIXME: don't use private API
			const patchFlag = await vnode.evaluate(
				(ctx) => (<{__vnode?: VNode}>ctx).__vnode?.patchFlag ?? 0
			);

			test.expect(patchFlag & flagValues.props).toEqual(flagValues.props);
		});
	});

	['default', 'v-attrs'].forEach((stage) => {
		test.describe(`attrs mode: ${stage}`, () => {
			test('the event handler should be patched during the rerender', async ({page}) => {
				const target = await Component.createComponentInDummy<bComponentRenderFlagsDummy>(
					page, 'b-component-render-flags-dummy-functional', {attrs: {stage}}
				);

				const button = page.getByRole('button');

				await button.click();
				await target.update({attrs: {stage}});
				await button.click();

				// Get the current context of the functional component from the DOM
				const clickCount = await page.locator('.b-component-render-flags-dummy')
					.evaluate((ctx) => (<{component: bComponentRenderFlagsDummy} & HTMLElement>ctx).component.clickCount);

				test.expect(clickCount).toEqual(2);
			});
		});
	});

	async function renderDummy(page: Page, functional: boolean = false) {
		const component = `b-component-render-flags-dummy${functional ? '-functional' : ''}`;
		await Component.createComponent(page, component, {stage: 'default'});
	}
});
