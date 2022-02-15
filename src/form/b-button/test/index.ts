/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/* eslint-disable max-lines-per-function */

import type { Page } from 'playwright';

import h from 'tests/helpers';

/**
 * Starts a test
 *
 * @param {Page} page
 * @param {!Object} params
 * @returns {void}
 */
export default function run(page: Page, params: BrowserTests.TestParams): void {
	const initialUrl = page.url();

	describe('b-button', () => {
		beforeEach(async () => {
			page = await params.context.newPage();
			await page.goto(initialUrl);
		});

		afterEach(() => page.close());

		let
			buttonNode,
			buttonCtx;

		beforeEach(async () => {
			await page.evaluate(() => {
				globalThis._t = undefined;
				globalThis.removeCreatedComponents();
			});
		});

		describe('providing `type`', () => {
			describe('`file`', () => {
				beforeEach(async () => {
					await renderButton({
						type: 'file'
					});
				});

				it('renders a button with a `file` type', async () => {
					const
						fileEl = await buttonNode.$('[type="file"]');

					expect(fileEl).toBeTruthy();
				});

				it('opens a file chooser on click', async () => {
					const
						event = page.waitForEvent('filechooser');

					await buttonNode.click();
					await expectAsync(event).toBeResolved();
				});

				describe('file chooser has been opened, and the file has been selected', () => {
					let changeEventPr;

					beforeEach(async () => {
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

					it('stores the provided file', async () => {
						const
							filesLength = await buttonCtx.evaluate((ctx) => ctx.files.length);

						expect(filesLength).toBe(1);
					});

					it('fires a `change` event', async () => {
						await expectAsync(changeEventPr).toBeResolved();
					});

					it('resets the provided files on the `reset` method call', async () => {
						await buttonCtx.evaluate((ctx) => ctx.reset());

						const
							filesLength = await buttonCtx.evaluate((ctx) => ctx.files.length);

						expect(filesLength).toBe(0);
					});
				});
			});

			describe('`submit`', () => {
				beforeEach(async () => {
					await renderButton({
						type: 'submit'
					});
				});

				it('renders a button with a `submit` type', async () => {
					const
						submitEl = await buttonNode.$('[type="submit"]');

					expect(submitEl).toBeTruthy();
				});

				it('fires a `submit` event on click', async () => {
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

					await expectAsync(pr).toBeResolved();
				});
			});

			describe('`link`', () => {
				const
					url = 'https://someurl.com/';

				beforeEach(async () => {
					await renderButton({
						href: url,
						type: 'link'
					});
				});

				it('renders a button with the provided `href`', async () => {
					const
						linkEl = await buttonNode.$(`[href="${url}"]`);

					expect(linkEl).toBeTruthy();
				});

				it('navigates to the provided `href`', async () => {
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

					expect(navigationUrl).toBe(url);
				});
			});

		});

		describe('`href`', () => {
			it('provides the base URL to a data provider', async () => {
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

				await renderButton({
					href: 'test/base'
				});

				await buttonNode.click();
				await expectAsync(pr).toBeResolved();
			});
		});

		describe('providing `disabled`', () => {
			describe('`true`', () => {
				it('does not fire any click event', async () => {
					await renderButton({
						disabled: true
					});

					await buttonCtx.evaluate((ctx) => ctx.on('click', () => globalThis._t = 1));
					await buttonNode.click({force: true});
					await h.bom.waitForIdleCallback(page);

					const
						testVal = await page.evaluate(() => globalThis._t);

					expect(testVal).toBeUndefined();
				});

				it('does not fire a navigation', async () => {
					await renderButton({
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
					await h.bom.waitForIdleCallback(page, {sleepAfterIdles: 300});

					expect(hasNavRequest).toBeFalse();
				});
			});

			describe('`false`', () => {
				it('fires a `click` event', async () => {
					await renderButton({
						disabled: false
					});

					await buttonCtx.evaluate((ctx) => ctx.on('click', () => globalThis._t = 1));
					await buttonNode.click();
					await h.bom.waitForIdleCallback(page);

					const
						testVal = await page.evaluate(() => globalThis._t);

					expect(testVal).toBe(1);
				});
			});
		});

		describe('providing `autofocus`', () => {
			it('`true`', async () => {
				await renderButton({
					autofocus: true
				});

				const
					autofocusEl = await buttonNode.$('[autofocus="autofocus"]');

				expect(autofocusEl).toBeTruthy();
			});

			it('`false`', async () => {
				await renderButton({
					autofocus: false
				});

				const
					autofocusEl = await buttonNode.$('[autofocus="autofocus"]');

				expect(autofocusEl).toBeNull();
			});
		});

		describe('providing `tabIndex`', () => {
			it('`-1`', async () => {
				await renderButton({
					tabIndex: -1
				});

				const
					tabIndexEl = await buttonNode.$('[tabindex="-1"]');

				expect(tabIndexEl).toBeTruthy();
			});

			it('`1`', async () => {
				await renderButton({
					tabIndex: 1
				});

				const
					tabIndexEl = await buttonNode.$('[tabindex="1"]');

				expect(tabIndexEl).toBeTruthy();
			});
		});

		describe('providing `preIcon`', () => {
			it('`dropdown`', async () => {
				const
					iconName = 'foo';

				await renderButton({
					preIcon: iconName
				});

				const
					bIcon = await buttonNode.$('.b-icon'),
					iconProvidedName = await bIcon.evaluate((ctx) => ctx.component.value);

				expect(iconProvidedName).toBe(iconName);
			});

			it('`undefined`', async () => {
				await renderButton({
					preIcon: undefined
				});

				const
					bIcon = await buttonNode.$('.b-icon');

				expect(bIcon).toBeNull();
			});
		});

		describe('click event', () => {
			beforeEach(async () => {
				await renderButton();
			});

			it('fires on click', async () => {
				const
					pr = buttonCtx.evaluate((ctx) => ctx.promisifyOnce('click'));

				await buttonNode.click();

				await expectAsync(pr).toBeResolved();
			});

			it('does not emit an event without a click', async () => {
				await buttonCtx.evaluate((ctx) => ctx.once('click', () => globalThis._t = 1));
				await h.bom.waitForIdleCallback(page, {sleepAfterIdles: 400});

				const
					res = await page.evaluate(() => globalThis._t);

				expect(res).toBeUndefined();
			});
		});

		async function renderButton(p: Dictionary = {}) {
			await page.evaluate((p) => {
				const defaultRequestFilter = Object.isString(p.defaultRequestFilter) ?
					// eslint-disable-next-line no-new-func
					new Function(p.defaultRequestFilter) :
					p.defaultRequestFilter;

				const scheme = [
					{
						attrs: {
							id: 'target',
							...p,
							defaultRequestFilter
						},

						content: {
							default: () => 'Hello there general kenobi'
						}
					}
				];

				globalThis.renderComponents('b-button', scheme);

				globalThis.buttonNode = document.getElementById('target');
				globalThis.buttonCtx = globalThis.buttonNode.component;

			}, p);

			buttonNode = await page.waitForSelector('#target');
			buttonCtx = await h.component.getComponentById(page, 'target');
		}
	});
}
