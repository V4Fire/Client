/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { Page, JSHandle } from 'playwright';
import type bTextarea from 'components/form/b-textarea/b-textarea';

import test from 'tests/config/unit/test';
import Component from 'tests/helpers/component';

test.describe('<b-textarea> disallow form value', () => {
	test.beforeEach(async ({demoPage}) => {
		await demoPage.goto();
	});

	test('without explicitly enabling the `messageHelpers` prop, the `info` and `error` props should not affect the component markup', async ({page}) => {
		const target = await renderTextarea(page, {
			info: 'Hello',
			error: 'Error'
		});

		test.expect(await target.evaluate(({unsafe}) => Boolean(unsafe.block!.element('info-box'))))
			.toBe(false);

		test.expect(await target.evaluate(({unsafe}) => Boolean(unsafe.block!.element('error-box'))))
			.toBe(false);
	});

	test('passing the `info` prop with `messageHelpers` enabled should affect the component layout', async ({page}) => {
		const target = await renderTextarea(page, {
			info: 'Hello',
			messageHelpers: true
		});

		test.expect(await target.evaluate((ctx) => ctx.info))
			.toBe('Hello');

		test.expect(await target.evaluate(({unsafe}) => unsafe.block!.element('info-box')!.textContent!.trim()))
			.toBe('Hello');

		test.expect(await target.evaluate((ctx) => ctx.mods.showInfo))
			.toBe('true');

		await target.evaluate((ctx) => {
			ctx.info = 'Bla';
		});

		test.expect(await target.evaluate((ctx) => ctx.info))
			.toBe('Bla');

		test.expect(await target.evaluate(({unsafe}) => unsafe.block!.element('info-box')!.textContent!.trim()))
			.toBe('Bla');

		test.expect(await target.evaluate((ctx) => ctx.mods.showInfo))
			.toBe('true');

		await target.evaluate((ctx) => {
			ctx.info = undefined;
		});

		test.expect(await target.evaluate((ctx) => ctx.info))
			.toBeUndefined();

		test.expect(await target.evaluate(({unsafe}) => unsafe.block!.element('info-box')!.textContent!.trim()))
			.toBe('');

		test.expect(await target.evaluate((ctx) => ctx.mods.showInfo))
			.toBe('false');
	});

	test('passing the `error` prop with `messageHelpers` enabled should affect the component layout', async ({page}) => {
		const target = await renderTextarea(page, {
			error: 'Error',
			messageHelpers: true
		});

		test.expect(await target.evaluate((ctx) => ctx.error))
			.toBe('Error');

		test.expect(await target.evaluate(({unsafe}) => unsafe.block!.element('error-box')!.textContent!.trim()))
			.toBe('Error');

		test.expect(await target.evaluate((ctx) => ctx.mods.showError))
			.toBe('true');

		await target.evaluate((ctx) => {
			ctx.error = 'Bla';
		});

		test.expect(await target.evaluate((ctx) => ctx.error))
			.toBe('Bla');

		test.expect(await target.evaluate(({unsafe}) => unsafe.block!.element('error-box')!.textContent!.trim()))
			.toBe('Bla');

		test.expect(await target.evaluate((ctx) => ctx.mods.showError))
			.toBe('true');

		await target.evaluate((ctx) => {
			ctx.error = undefined;
		});

		test.expect(await target.evaluate((ctx) => ctx.error))
			.toBeUndefined();

		test.expect(await target.evaluate(({unsafe}) => unsafe.block!.element('error-box')!.textContent!.trim()))
			.toBe('');

		test.expect(await target.evaluate((ctx) => ctx.mods.showError))
			.toBe('false');
	});

	test('passing the `info` and `error` props with `messageHelpers` enabled should affect the component layout', async ({page}) => {
		const target = await renderTextarea(page, {
			info: 'Hello',
			error: 'Error',
			messageHelpers: true
		});

		test.expect(await target.evaluate((ctx) => ctx.info))
			.toBe('Hello');

		test.expect(await target.evaluate(({unsafe}) => unsafe.block!.element('info-box')!.textContent!.trim()))
			.toBe('Hello');

		test.expect(await target.evaluate((ctx) => ctx.mods.showInfo))
			.toBe('true');

		test.expect(await target.evaluate((ctx) => ctx.error))
			.toBe('Error');

		test.expect(await target.evaluate(({unsafe}) => unsafe.block!.element('error-box')!.textContent!.trim()))
			.toBe('Error');

		test.expect(await target.evaluate((ctx) => ctx.mods.showError))
			.toBe('true');
	});

	/**
	 * @param page
	 * @param attrs
	 */
	async function renderTextarea(page: Page, attrs: RenderComponentsVnodeParams['attrs'] = {}): Promise<JSHandle<bTextarea>> {
		await Component.createComponent(page, 'b-textarea', {
			attrs: {
				'data-id': 'target',
				...attrs
			}
		});

		return Component.waitForComponentStatus(page, '[data-id="target"]', 'ready');
	}

});
