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

import type bCoreComponentDecoratorsDummy from 'core/component/decorators/test/b-core-component-decorators-dummy/b-core-component-decorators-dummy';

test.describe('core/component/decorators', () => {
	test.beforeEach(async ({demoPage}) => {
		await demoPage.goto();
	});

	// Refer to the `b-core-component-decorators-dummy` component
	// and check it's decorators to understand this test
	test.describe('initial values should be correct and all their changes should be registered', () => {
		test('when component is regular', async ({page}) => {
			const target = await renderDummy(page);

			await runTest(target);
		});

		test('when component is functional', async ({page}) => {
			const target = await renderDummy(page, true);

			await runTest(target);
		});

		/**
		 * Runs a decorators test for the specified target
		 * @param target
		 */
		async function runTest(target: JSHandle<bCoreComponentDecoratorsDummy>) {
			const {i, j, tmp} = await target.evaluate((ctx) => ({
				i: ctx.i,
				j: ctx.j,
				tmp: Object.fastClone(ctx.unsafe.tmp)
			}));

			test.expect(i).toEqual(7);
			test.expect(j).toEqual(1);

			test.expect(tmp.immediateChanges).toEqual([
				['created', 0, 1],
				['created', 0, 1],
				['created', 3, 1],
				['created', 6, 1],
				['created', 7, 1],
				['created', 7, 1],
				['mounted', 7, 1]
			]);

			test.expect(tmp.changes).toEqual([
				[7, 6, ['i']],
				[undefined, undefined, undefined],
				['boom!', undefined, undefined]
			]);
		}
	});

	/**
	 * Returns the rendered dummy component. It can be a regular or a functional component.s
	 *
	 * @param page
	 * @param functional
	 */
	async function renderDummy(
		page: Page, functional: boolean = false
	): Promise<JSHandle<bCoreComponentDecoratorsDummy>> {
		return Component.createComponent(
			page, `b-core-component-decorators-dummy${functional ? '-functional' : ''}`
		);
	}
});
