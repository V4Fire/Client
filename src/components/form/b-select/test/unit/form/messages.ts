/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { JSHandle, Page } from 'playwright';

import test from 'tests/config/unit/test';

import type bSelect from 'components/form/b-select/b-select';
import { createSelector, renderSelect } from 'components/form/b-select/test/helpers';

test.describe('<b-select> form API', () => {

	test.beforeEach(async ({demoPage}) => {
		await demoPage.goto();
	});

	test('should not display `info` and `error` when `messageHelpers` prop is not set', async ({page}) => {
		await renderSelect(page, {
			info: 'Hello',
			error: 'Error'
		});

		await test.expect(page.locator(createSelector('info-box')).isHidden()).resolves.toBeTruthy();
		await test.expect(page.locator(createSelector('error-box')).isHidden()).resolves.toBeTruthy();
	});

	test('should display `info` message', async ({page}) => {
		const target = await renderSelect(page, {
			info: 'Hello',
			messageHelpers: true
		});

		await assertComponentInfo(page, target, 'Hello');

		await target.evaluate((ctx) => {
			ctx.info = 'Bla';
		});

		await assertComponentInfo(page, target, 'Bla');

		await target.evaluate((ctx) => {
			ctx.info = undefined;
		});

		await assertComponentInfo(page, target, undefined);
	});

	test('should display `error` message', async ({page}) => {
		const target = await renderSelect(page, {
			error: 'Error',
			messageHelpers: true
		});

		await assertComponentError(page, target, 'Error');

		await target.evaluate((ctx) => {
			ctx.error = 'Bla';
		});

		await assertComponentError(page, target, 'Bla');

		await target.evaluate((ctx) => {
			ctx.error = undefined;
		});

		await assertComponentError(page, target, undefined);
	});

	test('should display `info` and `error` messages simultaneously', async ({page}) => {
		const target = await renderSelect(page, {
			info: 'Hello',
			error: 'Error',
			messageHelpers: true
		});

		await assertComponentInfo(page, target, 'Hello');
		await assertComponentError(page, target, 'Error');
	});

	/**
	 * Checks that component's `info` message is set correctly
	 *
	 * @param page
	 * @param target
	 * @param text
	 */
	async function assertComponentInfo(page: Page, target: JSHandle<bSelect>, text: CanUndef<string>): Promise<void> {
		await test.expect(target.evaluate((ctx) => ctx.info))
			.toBeResolvedTo(text);

		await test.expect(page.locator(createSelector('info-box')))
			.toHaveText(text ?? '');

		await test.expect(target.evaluate((ctx) => ctx.mods.showInfo))
			.toBeResolvedTo(text == null ? 'false' : 'true');
	}

	/**
	 * Checks that component's `error` message is set correctly
	 *
	 * @param page
	 * @param target
	 * @param text
	 */
	async function assertComponentError(page: Page, target: JSHandle<bSelect>, text: CanUndef<string>): Promise<void> {
		await test.expect(target.evaluate((ctx) => ctx.error))
			.toBeResolvedTo(text);

		await test.expect(page.locator(createSelector('error-box')))
			.toHaveText(text ?? '');

		await test.expect(target.evaluate((ctx) => ctx.mods.showError))
			.toBeResolvedTo(text == null ? 'false' : 'true');
	}
});
