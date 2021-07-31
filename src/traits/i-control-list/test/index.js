// @ts-check

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * Starts a test
 *
 * @param {Playwright.Page} page
 * @returns {void}
 */
module.exports = (page) => {
	describe('`traits/i-control-list`', () => {
		beforeAll(async () => {
			await page.evaluate(() => {
				globalThis.createControl = (id, props = {}) => ({
					text: 'hello there general kenobi',
					component: 'b-button',
					...props,
					attrs: {
						id,
						...props.attrs
					}
				});
			});
		});

		beforeEach(async () => {
			await page.evaluate(() => {
				globalThis.removeCreatedComponents();

				globalThis._t = undefined;
				globalThis._args = undefined;
				globalThis._tArgsMap = undefined;
			});
		});

		describe('simple usage', () => {
			const p = {
				controls: [
					createControl('test-button'),
					createControl('link-button', {attrs: {
						type: 'link',
						href: 'https://v4fire.rocks'
					}})
				]
			};

			beforeEach(async () => {
				await page.evaluate(() => {
					globalThis.removeCreatedComponents();

					globalThis._t = undefined;
					globalThis._args = undefined;
					globalThis._tArgsMap = undefined;
				});

				await init(p);
			});

			it('renders the provided component', async () => {
				const componentName = await page.evaluate(() =>
					document.getElementById('test-button').component.componentName);

				expect(componentName).toBe(p.controls[0].component);
			});

			it('provides a content from `text` into the `default` slot', async () => {
				const textContent = await page.evaluate(() =>
					document.getElementById('test-button').textContent);

				expect(textContent.trim()).toBe(p.controls[0].text.trim());
			});

			it('provides attributes to the component', async () => {
				const attributes = await page.evaluate(() => {
					// @ts-ignore
					const c = document.getElementById('link-button').component;
					return [c.type, c.href];
				});

				expect(attributes).toEqual([p.controls[1].attrs.type, p.controls[1].attrs.href]);
			});

			it('renders all of the provided controls', async () => {
				const [aButton, bButton] = await Promise.all([
					page.$(`#${p.controls[0].attrs.id}`),
					page.$(`#${p.controls[1].attrs.id}`)
				]);

				expect(aButton).toBeTruthy();
				expect(bButton).toBeTruthy();
			});

			it('creates control wrappers with the provided class name', async () => {
				const
					selector = '.b-dummy-control-list__control-wrapper',
					wrappers = await page.$$(selector);

				expect(wrappers.length).toBe(2);

				const
					isContainsTestButton = Boolean(await wrappers[0].$(`#${p.controls[0].attrs.id}`)),
					isContainsLinkButton = Boolean(await wrappers[1].$(`#${p.controls[1].attrs.id}`));

				expect(isContainsTestButton).toBeTrue();
				expect(isContainsLinkButton).toBeTrue();
			});

			it('provides the specified class name to controls', async () => {
				const
					selector = '.b-dummy-control-list__control',
					elements = await page.$$(selector);

				expect(elements.length).toBe(2);
			});
		});

		describe('`action`', () => {
			it('as `function`', async () => {
				await page.evaluate(() => {
					globalThis.renderComponents('b-dummy-control-list', [
						{
							attrs: {
								controls: [createControl('target', {action: () => globalThis._t = 1})]
							}
						}
					]);
				});

				await page.click('#target');

				await expectAsync(page.waitForFunction(() => globalThis._t === 1)).toBeResolved();
			});

			it('as `string', async () => {
				await init({
					controls: [createControl('target', {action: 'testFn'})]
				});

				await page.click('#target');

				await expectAsync(page.waitForFunction(() => globalThis._t === 1)).toBeResolved();
			});

			describe('as `ControlActionObject`', () => {
				it('with `args` provided', async () => {
					await init({
						controls: [createControl('target', {action: {method: 'testFn', args: [1, 2, 3, 4]}})]
					});

					await Promise.all([
						page.click('#target'),
						page.waitForFunction(() => globalThis._args?.length === 4)
					]);

					const
						args = await page.evaluate(() => globalThis._args);

					expect(args).toEqual([1, 2, 3, 4]);
				});

				it('providing `defArgs` to `true`', async () => {
					await init({
						controls: [createControl('target', {action: {method: 'testFn', defArgs: true, args: [1, 2, 3, 4]}})]
					});

					await Promise.all([
						page.click('#target'),
						page.waitForFunction(() => globalThis._args?.length === 6)
					]);

					const result = await page.evaluate(() => {
						const
							[ctx, event, ...rest] = globalThis._args;

						return [
							// @ts-ignore
							ctx === document.getElementById('target').component,
							event.target != null,
							...rest
						];
					});

					expect(result).toEqual([true, true, 1, 2, 3, 4]);
				});

				describe('providing `argsMap`', () => {
					it('as `string`', async () => {
						await init({
							controls: [
								createControl('target', {
									action: {
										method: 'testFn',
										args: [1, 2, 3, 4],
										argsMap: 'testArgsMapFn'
									}
								})
							]
						});

						await Promise.all([
							page.click('#target'),
							page.waitForFunction(() => globalThis._tArgsMap?.[0]?.length === 4)
						]);

						const
							args = await page.evaluate(() => globalThis._tArgsMap[0]);

						expect(args).toEqual([1, 2, 3, 4]);
					});

					it('as `function`', async () => {
						await page.evaluate(() => {
							globalThis.renderComponents('b-dummy-control-list', [
								{
									attrs: {
										controls: [
											createControl('target', {
												action: {
													method: 'testFn',
													args: [1, 2, 3, 4],
													argsMap: (...args) => args[0].sort((a, b) => b - a)
												}
											})
										]
									}
								}
							]);
						});

						await Promise.all([
							page.click('#target'),
							page.waitForFunction(() => globalThis._args?.length === 4)
						]);

						const
							args = await page.evaluate(() => globalThis._args);

						expect(args).toEqual([4, 3, 2, 1]);
					});
				});
			});
		});

		function createControl(id, props = {}) {
			return {
				text: 'hello there general kenobi',
				component: 'b-button',
				...props,
				attrs: {
					id,
					...props.attrs
				}
			};
		}

		async function init(props = {}) {
			await page.evaluate((props) => {
				globalThis.removeCreatedComponents();

				const scheme = [
					{
						attrs: {
							id: 'dummy-control-list',
							...props
						}
					}
				];

				globalThis.renderComponents('b-dummy-control-list', scheme);
			}, props);
		}
	});
};
