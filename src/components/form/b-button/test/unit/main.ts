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
		test("`'foo'`", async ({page}) => {
			const
				iconName = 'foo';

			await renderButton(page, {
				preIcon: iconName
			});

			const
				icon = await $el.$('svg'),
				svgText = await icon!.evaluate((ctx) => ctx.innerHTML);

			test.expect(svgText).toBe('<use xlink:href="#foo"></use>');
		});

		test('`undefined`', async ({page}) => {
			await renderButton(page, {
				preIcon: undefined
			});

			const icon = await $el.$('svg');
			test.expect(icon).toBeNull();
		});
	});

	test.describe('passing the `icon` prop as', () => {
		test("`'foo'`", async ({page}) => {
			const
				iconName = 'foo';

			await renderButton(page, {
				icon: iconName
			});

			const
				icon = await $el.$('svg'),
				svgText = await icon!.evaluate((ctx) => ctx.innerHTML);

			test.expect(svgText).toBe('<use xlink:href="#foo"></use>');
		});

		test('`undefined`', async ({page}) => {
			await renderButton(page, {
				icon: undefined
			});

			const icon = await $el.$('svg');
			test.expect(icon).toBeNull();
		});
	});

	test.describe('component events', () => {
		test.beforeEach(async ({page}) => {
			await renderButton(page);
		});

		test('when clicked, the component should emit the `click` event', async () => {
			const pr = bButton.evaluate((ctx) => ctx.promisifyOnce('click').then(() => undefined));
			await $el.click();
			await test.expect(pr).resolves.toBeUndefined();
		});
	});

	async function renderButton(page: Page, attrs: RenderComponentsVnodeParams['attrs'] = {}) {
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
