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

import type bSuperIBlockDecoratorsDummy from 'components/super/i-block/decorators/test/b-super-i-block-decorators-dummy/b-super-i-block-decorators-dummy';

test.describe('<i-block> decorators', () => {
	test.beforeEach(async ({demoPage}) => {
		await demoPage.goto();
	});

	// Refer to the `b-super-i-block-decorators-dummy` component
	// and check its decorators to understand this test
	test.describe('initial values should be correct and all their changes should be registered', () => {
		test('when the component is regular', async ({page}) => {
			const target = await renderDummy(page);

			await runTest(target);
		});

		test('when the component is functional', async ({page}) => {
			const target = await renderDummy(page, true);

			await runTest(target);
		});

		/**
		 * Runs a decorator tests for the specified target
		 * @param target
		 */
		async function runTest(target: JSHandle<bSuperIBlockDecoratorsDummy>) {
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

	async function renderDummy(
		page: Page,
		functional: boolean = false
	): Promise<JSHandle<bSuperIBlockDecoratorsDummy>> {
		return Component.createComponent(
			page, `b-super-i-block-decorators-dummy${functional ? '-functional' : ''}`
		);
	}
});
