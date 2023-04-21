/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import test from 'tests/config/unit/test';

import { renderSelect } from 'components/form/b-select/test/helpers';

test.describe('<b-select> form API `info` / `error` messages', () => {

	test.beforeEach(async ({demoPage}) => {
		await demoPage.goto();
	});

	test('without `messageHelpers`', async ({page}) => {
		const target = await renderSelect(page, {
			info: 'Hello',
			error: 'Error'
		});

		test.expect(await target.evaluate((ctx) => Boolean(ctx.unsafe.block!.element('info-box'))))
			.toBeFalsy();

		test.expect(await target.evaluate((ctx) => Boolean(ctx.unsafe.block!.element('error-box'))))
			.toBeFalsy();
	});

	test('providing `info`', async ({page}) => {
		const target = await renderSelect(page, {
			info: 'Hello',
			messageHelpers: true
		});

		test.expect(await target.evaluate((ctx) => ctx.info))
			.toBe('Hello');

		test.expect(await target.evaluate((ctx) => ctx.unsafe.block!.element('info-box').textContent.trim()))
			.toBe('Hello');

		test.expect(await target.evaluate((ctx) => ctx.mods.showInfo))
			.toBe('true');

		await target.evaluate((ctx) => {
			ctx.info = 'Bla';
		});

		test.expect(await target.evaluate((ctx) => ctx.info))
			.toBe('Bla');

		test.expect(await target.evaluate((ctx) => ctx.unsafe.block!.element('info-box').textContent.trim()))
			.toBe('Bla');

		test.expect(await target.evaluate((ctx) => ctx.mods.showInfo))
			.toBe('true');

		await target.evaluate((ctx) => {
			ctx.info = undefined;
		});

		test.expect(await target.evaluate((ctx) => ctx.info))
			.toBeUndefined();

		test.expect(await target.evaluate((ctx) => ctx.unsafe.block!.element('info-box').textContent.trim()))
			.toBe('');

		test.expect(await target.evaluate((ctx) => ctx.mods.showInfo))
			.toBe('false');
	});

	test('providing `error`', async ({page}) => {
		const target = await renderSelect(page, {
			error: 'Error',
			messageHelpers: true
		});

		test.expect(await target.evaluate((ctx) => ctx.error))
			.toBe('Error');

		test.expect(await target.evaluate((ctx) => ctx.unsafe.block!.element('error-box').textContent.trim()))
			.toBe('Error');

		test.expect(await target.evaluate((ctx) => ctx.mods.showError))
			.toBe('true');

		await target.evaluate((ctx) => {
			ctx.error = 'Bla';
		});

		test.expect(await target.evaluate((ctx) => ctx.error))
			.toBe('Bla');

		test.expect(await target.evaluate((ctx) => ctx.unsafe.block!.element('error-box').textContent.trim()))
			.toBe('Bla');

		test.expect(await target.evaluate((ctx) => ctx.mods.showError))
			.toBe('true');

		await target.evaluate((ctx) => {
			ctx.error = undefined;
		});

		test.expect(await target.evaluate((ctx) => ctx.error))
			.toBeUndefined();

		test.expect(await target.evaluate((ctx) => ctx.unsafe.block!.element('error-box').textContent.trim()))
			.toBe('');

		test.expect(await target.evaluate((ctx) => ctx.mods.showError))
			.toBe('false');
	});

	test('providing `info` and `error`', async ({page}) => {
		const target = await renderSelect(page, {
			info: 'Hello',
			error: 'Error',
			messageHelpers: true
		});

		test.expect(await target.evaluate((ctx) => ctx.info))
			.toBe('Hello');

		test.expect(await target.evaluate((ctx) => ctx.unsafe.block!.element('info-box').textContent.trim()))
			.toBe('Hello');

		test.expect(await target.evaluate((ctx) => ctx.mods.showInfo))
			.toBe('true');

		test.expect(await target.evaluate((ctx) => ctx.error))
			.toBe('Error');

		test.expect(await target.evaluate((ctx) => ctx.unsafe.block!.element('error-box').textContent.trim()))
			.toBe('Error');

		test.expect(await target.evaluate((ctx) => ctx.mods.showError))
			.toBe('true');
	});
});
