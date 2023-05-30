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

test.describe('<b-button> passing the `type` prop as', () => {
	let
		$el: ElementHandle<ComponentElement<bButton>>,
		bButton: JSHandle<bButton>;

	test.beforeEach(async ({demoPage}) => {
		await demoPage.goto();
	});

	test.describe('`type` is not set', () => {
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
				changeEventPr = bButton.evaluate((ctx) => ctx.promisifyOnce('change').then(() => undefined));

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

			test('when a file is selected, the component should emit the `change` event', async () => {
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

	/**
	 * @param page
	 * @param attrs
	 */
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
