/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { Page, JSHandle, ElementHandle } from 'playwright';

import type { ComponentElement } from 'core/component';
import type bButton from 'components/form/b-button/b-button';

import test from 'tests/config/unit/test';

import Component from 'tests/helpers/component';
import BOM from 'tests/helpers/bom';

test.describe('<b-button>', () => {
	let
		$el: ElementHandle<ComponentElement<bButton>>,
		bButton: JSHandle<bButton>;

	test.beforeEach(async ({demoPage}) => {
		await demoPage.goto();
	});

	test.describe('passing the `autofocus` prop as', () => {
		test('`true`', async ({page}) => {
			await renderButton(page, {
				autofocus: true
			});

			const autofocusEl = await $el.$('[autofocus]');
			test.expect(autofocusEl).toBeTruthy();
		});

		test('`false`', async ({page}) => {
			await renderButton(page, {
				autofocus: false
			});

			const autofocusEl = await $el.$('[autofocus]');
			test.expect(autofocusEl).toBeNull();
		});
	});

	test.describe('passing the `autofocus` prop as', () => {
		test('`-1`', async ({page}) => {
			await renderButton(page, {
				tabIndex: -1
			});

			const tabIndexEl = await $el.$('[tabindex="-1"]');
			test.expect(tabIndexEl).toBeTruthy();
		});

		test('`1`', async ({page}) => {
			await renderButton(page, {
				tabIndex: 1
			});

			const tabIndexEl = await $el.$('[tabindex="1"]');
			test.expect(tabIndexEl).toBeTruthy();
		});
	});

	test.describe('passing the `preIcon` prop as', () => {
		test("`'dropdown'`", async ({page}) => {
			const
				iconName = 'foo';

			await renderButton(page, {
				preIcon: iconName
			});

			const
				icon = await $el.$('svg'),
				iconProvidedName = await icon!.evaluate((ctx) => ctx.href);

			console.log(iconProvidedName);

			//test.expect(iconProvidedName).toBe(iconName);
		});

		// test('`undefined`', async ({page}) => {
		// 	await renderButton(page, {
		// 		preIcon: undefined
		// 	});
		//
		// 	const
		// 		bIcon = await $el.$('.b-icon');
		//
		// 	test.expect(bIcon).toBeNull();
		// });
	});

	// test.describe('click event', () => {
	// 	test.beforeEach(async ({page}) => {
	// 		await renderButton(page);
	// 	});
	//
	// 	test('fires on click', async () => {
	// 		const
	// 			pr = bButton.evaluate((ctx) => ctx.promisifyOnce('click'));
	//
	// 		await $el.click();
	//
	// 		await test.expect(pr).resolves.toBeUndefined();
	// 	});
	//
	// 	test('does not emit an event without a click', async ({page}) => {
	// 		await bButton.evaluate((ctx) => ctx.once('click', () => globalThis._t = 1));
	// 		await BOM.waitForIdleCallback(page, {sleepAfterIdles: 400});
	//
	// 		const
	// 			res = await page.evaluate(() => globalThis._t);
	//
	// 		test.expect(res).toBeUndefined();
	// 	});
	// });

	/**
	 * @param page
	 * @param attrs
	 */
	async function renderButton(page: Page, attrs: Dictionary = {}) {
		await Component.createComponent(page, 'b-button', {
			attrs: {
				id: 'target',
				...attrs
			},

			children: {
				default: 'Hello there general Kenobi'
			}
		});

		$el = await page.waitForSelector('#target');
		bButton = await Component.waitForComponentByQuery(page, '#target');

		await page.evaluate(() => globalThis.$el = document.querySelector('#target'));
	}
});
