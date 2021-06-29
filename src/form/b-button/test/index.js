/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/* eslint-disable max-lines-per-function */

// @ts-check

/**
 * @typedef {import('playwright').Page} Page
 */

const
	h = include('tests/helpers');

/**
 * @param {Page} page
 */
module.exports = (page, params) => {
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

		const renderButton = async (props = {}) => {
			await page.evaluate((props) => {
				const scheme = [
					{
						attrs: {
							id: 'target',
							...props
						},

						content: {
							default: () => 'Hello there general kenobi'
						}
					}
				];

				globalThis.renderComponents('b-button', scheme);

				globalThis.buttonNode = document.getElementById('target');
				globalThis.buttonCtx = globalThis.buttonNode.component;

			}, props);

			buttonNode = await page.waitForSelector('#target');
			buttonCtx = await h.component.getComponentById(page, 'target');
		};

		beforeEach(async () => {
			await page.evaluate(() => {
				globalThis._t = undefined;
				globalThis.removeCreatedComponents();
			});
		});

		describe('buttonType', () => {
			describe('file', () => {
				beforeEach(async () => {
					await renderButton({
						type: 'file'
					});
				});

				it('renders button with file type', async () => {
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

				describe('file chooser has been open, and the file has been selected', () => {
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

					it('fires a change event', async () => {
						await expectAsync(changeEventPr).toBeResolved();
					});

					it('resets the provided files on `reset` method call', async () => {
						await buttonCtx.evaluate((ctx) => ctx.reset());

						const
							filesLength = await buttonCtx.evaluate((ctx) => ctx.files.length);

						expect(filesLength).toBe(0);
					});
				});
			});

			describe('submit', () => {
				beforeEach(async () => {
					await renderButton({
						type: 'submit'
					});
				});

				it('renders the button with submit type', async () => {
					const
						submitEl = await buttonNode.$('[type="submit"]');

					expect(submitEl).toBeTruthy();
				});

				it('fires the submit event on click', async () => {
					const pr = page.evaluate(() => new Promise((res) => {
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

			describe('link', () => {
				const
					url = 'https://someurl.com/';

				beforeEach(async () => {
					await renderButton({
						href: url,
						type: 'link'
					});
				});

				it('renders the button with href', async () => {
					const
						linkEl = await buttonNode.$(`[href="${url}"]`);

					expect(linkEl).toBeTruthy();
				});

				it('navigates to the provided href', async () => {
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

		describe('href', () => {
			it('provides a base url to the dataProvider', async () => {
				const pr = new Promise(async (res) => {
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
					dataProvider: 'demo.List',
					href: 'test/base',
					defaultRequestFilter: false
				});

				await buttonNode.click();

				await expectAsync(pr).toBeResolved();
			});
		});

		describe('disabled', () => {
			describe('true', () => {
				it('does not fires a click event on click', async () => {
					await renderButton({
						disabled: true
					});

					await buttonCtx.evaluate((ctx) => ctx.on('click', () => globalThis._t = 1));
					await buttonNode.click();
					await h.bom.waitForIdleCallback(page);

					const
						testVal = await page.evaluate(() => globalThis._t);

					expect(testVal).toBeUndefined();
				});

				it('does not fires a navigation on click', async () => {
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

					await buttonNode.click();
					await h.bom.waitForIdleCallback(page, {sleepAfterIdles: 300});

					expect(hasNavRequest).toBeFalse();
				});
			});

			describe('false', () => {
				it('fires a click event', async () => {
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

		describe('autofocus', () => {
			it('true', async () => {
				await renderButton({
					autofocus: true
				});

				const
					autofocusEl = await buttonNode.$('[autofocus="autofocus"]');

				expect(autofocusEl).toBeTruthy();
			});

			it('false', async () => {
				await renderButton({
					autofocus: false
				});

				const
					autofocusEl = await buttonNode.$('[autofocus="autofocus"]');

				expect(autofocusEl).toBeNull();
			});
		});

		describe('tabIndex', () => {
			it('-1', async () => {
				await renderButton({
					tabIndex: -1
				});

				const
					tabIndexEl = await buttonNode.$('[tabindex="-1"]');

				expect(tabIndexEl).toBeTruthy();
			});

			it('1', async () => {
				await renderButton({
					tabIndex: 1
				});

				const
					tabIndexEl = await buttonNode.$('[tabindex="1"]');

				expect(tabIndexEl).toBeTruthy();
			});
		});

		describe('preIcon', () => {
			it('dropdown', async () => {
				await renderButton({
					preIcon: 'foo'
				});

				const
					bIcon = await buttonNode.$('.b-icon'),
					useSvg = (await bIcon.$$('use')).pop(),
					href = await useSvg.evaluate((ctx) => ctx.href.baseVal);

				expect(href.endsWith('#foo')).toBeTrue();
			});

			it('undefined', async () => {
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

			it('emits on click', async () => {
				const
					pr = buttonCtx.evaluate((ctx) => ctx.promisifyOnce('click'));

				await buttonNode.click();

				await expectAsync(pr).toBeResolved();
			});

			it('does not emit an event without click', async () => {
				await buttonCtx.evaluate((ctx) => ctx.once('click', () => globalThis._t = 1));
				await h.bom.waitForIdleCallback(page, {sleepAfterIdles: 400});

				const
					res = await page.evaluate(() => globalThis._t);

				expect(res).toBeUndefined();
			});
		});
	});
};
