/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { Page } from 'playwright';

import test from 'tests/config/unit/test';

import Component from 'tests/helpers/component';
import BOM from 'tests/helpers/bom';

test.describe('b-button', () => {
	let
		buttonNode,
		buttonCtx;

	test.beforeEach(async ({demoPage}) => {
		await demoPage.goto();
	});

	test.describe('providing `type`', () => {
		test.describe('`file`', () => {
			test.beforeEach(async ({page}) => {
				await renderButton(page, {
					type: 'file'
				});
			});

			test('renders a button with a `file` type', async () => {
				const
					fileEl = await buttonNode.$('[type="file"]');

				test.expect(fileEl).toBeTruthy();
			});

			test('opens a file chooser on click', async ({page}) => {
				const
					event = page.waitForEvent('filechooser');

				await buttonNode.click();
				await test.expect(event).resolves.toBeTruthy();
			});

			test.describe('file chooser has been opened, and the file has been selected', () => {
				let changeEventPr;

				test.beforeEach(async ({page}) => {
					const
						fileChooserPr = page.waitForEvent('filechooser');

					changeEventPr = buttonCtx.evaluate((ctx) => ctx.promisifyOnce('change'));

					await buttonNode.click();

					const
						fileChooser = await fileChooserPr;

					await fileChooser.setFiles({
						name: 'somefile.pdf',
						mimeType: 'application/pdf',
						buffer: Buffer.from([])
					});
				});

				test('stores the provided file', async () => {
					const
						filesLength = await buttonCtx.evaluate((ctx) => ctx.files.length);

					test.expect(filesLength).toBe(1);
				});

				test('fires a `change` event', async () => {
					await test.expect(changeEventPr).resolves.toBeUndefined();
				});

				test('resets the provided files on the `reset` method call', async () => {
					await buttonCtx.evaluate((ctx) => ctx.reset());

					const
						filesLength = await buttonCtx.evaluate((ctx) => ctx.files.length);

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

			test('renders a button with a `submit` type', async () => {
				const
					submitEl = await buttonNode.$('[type="submit"]');

				test.expect(submitEl).toBeTruthy();
			});

			test('fires a `submit` event on click', async ({page}) => {
				const pr = page.evaluate(() => new Promise<void>((res) => {
					const
						form = document.createElement('form');

					document.body.prepend(form);
					form.appendChild(globalThis.buttonNode);
					form.onsubmit = (e) => {
						e.preventDefault();
						res();
					};
				}));

				await buttonNode.click();

				await test.expect(pr).resolves.toBeUndefined();
			});
		});

		test.describe('`link`', () => {
			const
				url = 'https://someurl.com/';

			test.beforeEach(async ({page}) => {
				await renderButton(page, {
					href: url,
					type: 'link'
				});
			});

			test('renders a button with the provided `href`', async () => {
				const
					linkEl = await buttonNode.$(`[href="${url}"]`);

				test.expect(linkEl).toBeTruthy();
			});

			test('navigates to the provided `href`', async ({page}) => {
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

				await buttonNode.click();

				const
					navigationUrl = await pr;

				test.expect(navigationUrl).toBe(url);
			});
		});

	});

	test.describe('`href`', () => {
		test('provides the base URL to a data provider', async ({page}) => {
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

			await buttonNode.click();
			await test.expect(pr).resolves.toBeUndefined();
		});
	});

	test.describe('providing `disabled`', () => {
		test.describe('`true`', () => {
			test('does not fire any click event', async ({page}) => {
				await renderButton(page, {
					disabled: true
				});

				await buttonCtx.evaluate((ctx) => ctx.on('click', () => globalThis._t = 1));
				await buttonNode.click({force: true});
				await BOM.waitForIdleCallback(page);

				const
					testVal = await page.evaluate(() => globalThis._t);

				test.expect(testVal).toBeUndefined();
			});

			test('does not fire a navigation', async ({page}) => {
				await renderButton(page, {
					disabled: true,
					type: 'link',
					href: 'https://someurl.com/'
				});

				let hasNavRequest = false;

				await page.route('**/*', (r) => {
					if (r.request().isNavigationRequest()) {
						hasNavRequest = true;
					}

					return r.continue();
				});

				await buttonNode.click({force: true});
				await BOM.waitForIdleCallback(page, {sleepAfterIdles: 300});

				test.expect(hasNavRequest).toBe(false);
			});
		});

		test.describe('`false`', () => {
			test('fires a `click` event', async ({page}) => {
				await renderButton(page, {
					disabled: false
				});

				await buttonCtx.evaluate((ctx) => ctx.on('click', () => globalThis._t = 1));
				await buttonNode.click();
				await BOM.waitForIdleCallback(page);

				const
					testVal = await page.evaluate(() => globalThis._t);

				test.expect(testVal).toBe(1);
			});
		});
	});

	test.describe('providing `autofocus`', () => {
		test('`true`', async ({page}) => {
			await renderButton(page, {
				autofocus: true
			});

			const
				autofocusEl = await buttonNode.$('[autofocus="autofocus"]');

			test.expect(autofocusEl).toBeTruthy();
		});

		test('`false`', async ({page}) => {
			await renderButton(page, {
				autofocus: false
			});

			const
				autofocusEl = await buttonNode.$('[autofocus="autofocus"]');

			test.expect(autofocusEl).toBeNull();
		});
	});

	test.describe('providing `tabIndex`', () => {
		test('`-1`', async ({page}) => {
			await renderButton(page, {
				tabIndex: -1
			});

			const
				tabIndexEl = await buttonNode.$('[tabindex="-1"]');

			test.expect(tabIndexEl).toBeTruthy();
		});

		test('`1`', async ({page}) => {
			await renderButton(page, {
				tabIndex: 1
			});

			const
				tabIndexEl = await buttonNode.$('[tabindex="1"]');

			test.expect(tabIndexEl).toBeTruthy();
		});
	});

	test.describe('providing `preIcon`', () => {
		test('`dropdown`', async ({page}) => {
			const
				iconName = 'foo';

			await renderButton(page, {
				preIcon: iconName
			});

			const
				bIcon = await buttonNode.$('.b-icon'),
				iconProvidedName = await bIcon.evaluate((ctx) => ctx.component.value);

			test.expect(iconProvidedName).toBe(iconName);
		});

		test('`undefined`', async ({page}) => {
			await renderButton(page, {
				preIcon: undefined
			});

			const
				bIcon = await buttonNode.$('.b-icon');

			test.expect(bIcon).toBeNull();
		});
	});

	test.describe('click event', () => {
		test.beforeEach(async ({page}) => {
			await renderButton(page);
		});

		test('fires on click', async () => {
			const
				pr = buttonCtx.evaluate((ctx) => ctx.promisifyOnce('click'));

			await buttonNode.click();

			await test.expect(pr).resolves.toBeUndefined();
		});

		test('does not emit an event without a click', async ({page}) => {
			await buttonCtx.evaluate((ctx) => ctx.once('click', () => globalThis._t = 1));
			await BOM.waitForIdleCallback(page, {sleepAfterIdles: 400});

			const
				res = await page.evaluate(() => globalThis._t);

			test.expect(res).toBeUndefined();
		});
	});

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

			content: {
				default: () => 'Hello there general kenobi'
			}
		});

		buttonNode = await page.waitForSelector('#target');
		buttonCtx = await Component.waitForComponentByQuery(page, '#target');

		await page.evaluate(() => globalThis.buttonNode = document.querySelector('#target'));
	}
});
