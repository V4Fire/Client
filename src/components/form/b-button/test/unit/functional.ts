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

test.describe('b-button', () => {
	let
		$el: ElementHandle<ComponentElement<bButton>>,
		bButton: JSHandle<bButton>;

	test.beforeEach(async ({demoPage}) => {
		await demoPage.goto();
	});

	test.describe('passing the `type` prop as', () => {
		test.describe('default behaviour', () => {
			test.describe('`when passing the prop `href` and when clicking on the component, the associated data provider should be called`', () => {
				test('the date provider should send a GET request to the given URL', async ({page}) => {
					const pr = new Promise<void>(async (res) => {
						await page.route('**/api/test/base', (r) => {
							res();

							return r.fulfill({
								status: 200,
								contentType: 'application/json',
								body: JSON.stringify({})
							});
						});
					});

					await renderButton(page, {
						href: 'test/base'
					});

					await $el.click();
					await test.expect(pr).resolves.toBeUndefined();
				});
			});
		});

		test.describe('`file`', () => {
			test.beforeEach(async ({page}) => {
				await renderButton(page, {
					type: 'file'
				});
			});

			test('the component markup should have a <button type="file"/> tag', async () => {
				const
					button = await $el.$('[type="file"]'),
					get = button!.evaluate.bind(button);

				test.expect(await get((node) => node.tagName)).toBe('BUTTON');
				test.expect(await get((node) => node.getAttribute('type'))).toBe('file');
			});

			test('when you click on the component, a file selection window should open', async ({page}) => {
				const event = page.waitForEvent('filechooser');
				await $el.click();
				await test.expect(event).resolves.toBeTruthy();
			});

			test.describe('clicked on the component and selected a file', () => {
				let changeEventPr;

				test.beforeEach(async ({page}) => {
					const fileChooserPr = page.waitForEvent('filechooser');
					changeEventPr = bButton.evaluate((ctx) => ctx.promisifyOnce('change'));

					await $el.click();

					const
						fileChooser = await fileChooserPr;

					await fileChooser.setFiles({
						name: 'somefile.pdf',
						mimeType: 'application/pdf',
						buffer: Buffer.from([])
					});
				});

				test('the selected files should be stored in the `files` property', async () => {
					const files = await bButton.evaluate((ctx) => {
						const {files} = ctx;
						return Array.from(files!).map(({name, size, type}) => ({name, type, size}));
					});

					test.expect(files).toEqual([
						{
							name: 'somefile.pdf',
							type: 'application/pdf',
							size: 0
						}
					]);
				});

				test('when a file is selected, the component should emit the native `change` event', async () => {
					await test.expect(changeEventPr).resolves.toBeUndefined();
				});

				test('calling the `reset` method should reset all selected files', async () => {
					await bButton.evaluate((ctx) => ctx.reset());
					const filesLength = await bButton.evaluate((ctx) => ctx.files!.length);
					test.expect(filesLength).toBe(0);
				});
			});
		});

		test.describe('`submit`', () => {
			test.beforeEach(async ({page}) => {
				await renderButton(page, {
					type: 'submit'
				});
			});

			test('the component markup should have a <button type="submit"/> tag', async () => {
				const
					button = await $el.$('[type="submit"]'),
					get = button!.evaluate.bind(button);

				test.expect(await get((node) => node.tagName)).toBe('BUTTON');
				test.expect(await get((node) => node.getAttribute('type'))).toBe('submit');
			});

			test('on click the tied form should emit the `submit` event', async ({page}) => {
				const pr = page.evaluate(() => new Promise<void>((res) => {
					const form = document.createElement('form');

					document.body.prepend(form);
					form.appendChild(globalThis.$el);

					form.onsubmit = (e) => {
						e.preventDefault();
						res();
					};
				}));

				await $el.click();
				await test.expect(pr).resolves.toBeUndefined();
			});
		});

		test.describe('`link`', () => {
			const
				HREF = 'https://someurl.com/';

			test.beforeEach(async ({page}) => {
				await renderButton(page, {
					href: HREF,
					type: 'link'
				});
			});

			test('the component markup should have a <a href="$href"/> tag', async () => {
				const
					button = await $el.$(`a[href="${HREF}"]`),
					get = button!.evaluate.bind(button);

				test.expect(await get((node) => node.tagName)).toBe('A');
				test.expect(await get((node) => node.getAttribute('href'))).toBe(HREF);
			});

			test('when clicking on the component, the transition to the given `href` should occur', async ({page}) => {
				const pr = new Promise(async (res) => {
					await page.route('**/*', (r) => {
						if (r.request().isNavigationRequest()) {
							res(r.request().url());
							return r.fulfill({
								status: 200
							});
						}

						return r.continue();
					});
				});

				await $el.click();
				test.expect(await pr).toBe(HREF);
			});
		});
	});

	// test.describe('providing `disabled`', () => {
	// 	test.describe('`true`', () => {
	// 		test('does not fire any click event', async ({page}) => {
	// 			await renderButton(page, {
	// 				disabled: true
	// 			});
	//
	// 			await bButton.evaluate((ctx) => ctx.on('click', () => globalThis._t = 1));
	// 			await $el.click({force: true});
	// 			await BOM.waitForIdleCallback(page);
	//
	// 			const
	// 				testVal = await page.evaluate(() => globalThis._t);
	//
	// 			test.expect(testVal).toBeUndefined();
	// 		});
	//
	// 		test('does not fire a navigation', async ({page}) => {
	// 			await renderButton(page, {
	// 				disabled: true,
	// 				type: 'link',
	// 				href: 'https://someurl.com/'
	// 			});
	//
	// 			let hasNavRequest = false;
	//
	// 			await page.route('**/*', (r) => {
	// 				if (r.request().isNavigationRequest()) {
	// 					hasNavRequest = true;
	// 				}
	//
	// 				return r.continue();
	// 			});
	//
	// 			await $el.click({force: true});
	// 			await BOM.waitForIdleCallback(page, {sleepAfterIdles: 300});
	//
	// 			test.expect(hasNavRequest).toBe(false);
	// 		});
	// 	});
	//
	// 	test.describe('`false`', () => {
	// 		test('fires a `click` event', async ({page}) => {
	// 			await renderButton(page, {
	// 				disabled: false
	// 			});
	//
	// 			await bButton.evaluate((ctx) => ctx.on('click', () => globalThis._t = 1));
	// 			await $el.click();
	// 			await BOM.waitForIdleCallback(page);
	//
	// 			const
	// 				testVal = await page.evaluate(() => globalThis._t);
	//
	// 			test.expect(testVal).toBe(1);
	// 		});
	// 	});
	// });
	//
	// test.describe('providing `autofocus`', () => {
	// 	test('`true`', async ({page}) => {
	// 		await renderButton(page, {
	// 			autofocus: true
	// 		});
	//
	// 		const
	// 			autofocusEl = await $el.$('[autofocus="autofocus"]');
	//
	// 		test.expect(autofocusEl).toBeTruthy();
	// 	});
	//
	// 	test('`false`', async ({page}) => {
	// 		await renderButton(page, {
	// 			autofocus: false
	// 		});
	//
	// 		const
	// 			autofocusEl = await $el.$('[autofocus="autofocus"]');
	//
	// 		test.expect(autofocusEl).toBeNull();
	// 	});
	// });
	//
	// test.describe('providing `tabIndex`', () => {
	// 	test('`-1`', async ({page}) => {
	// 		await renderButton(page, {
	// 			tabIndex: -1
	// 		});
	//
	// 		const
	// 			tabIndexEl = await $el.$('[tabindex="-1"]');
	//
	// 		test.expect(tabIndexEl).toBeTruthy();
	// 	});
	//
	// 	test('`1`', async ({page}) => {
	// 		await renderButton(page, {
	// 			tabIndex: 1
	// 		});
	//
	// 		const
	// 			tabIndexEl = await $el.$('[tabindex="1"]');
	//
	// 		test.expect(tabIndexEl).toBeTruthy();
	// 	});
	// });
	//
	// test.describe('providing `preIcon`', () => {
	// 	test('`dropdown`', async ({page}) => {
	// 		const
	// 			iconName = 'foo';
	//
	// 		await renderButton(page, {
	// 			preIcon: iconName
	// 		});
	//
	// 		const
	// 			bIcon = await $el.$('.b-icon'),
	// 			iconProvidedName = await bIcon.evaluate((ctx) => ctx.component.value);
	//
	// 		test.expect(iconProvidedName).toBe(iconName);
	// 	});
	//
	// 	test('`undefined`', async ({page}) => {
	// 		await renderButton(page, {
	// 			preIcon: undefined
	// 		});
	//
	// 		const
	// 			bIcon = await $el.$('.b-icon');
	//
	// 		test.expect(bIcon).toBeNull();
	// 	});
	// });
	//
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
