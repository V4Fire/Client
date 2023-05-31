/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { JSHandle, Page } from 'playwright';

import test from 'tests/config/unit/test';

import { Component, DOM } from 'tests/helpers';

import type bTraitsIControlListDummy from 'components/traits/i-control-list/test/b-traits-i-control-list-dummy/b-traits-i-control-list-dummy';

test.describe('components/traits/i-control-list', () => {
	const
		componentName = 'b-traits-i-control-list-dummy',
		createSelector = DOM.elNameSelectorGenerator(componentName);

	test.beforeEach(async ({demoPage}) => {
		await demoPage.goto();
	});

	test.describe('simple usage', () => {
		const attrs = {
			controls: [
				createControl('test-button'),
				createControl('link-button', {attrs: {
					type: 'link',
					href: 'https://v4fire.rocks'
				}})
			]
		};

		const getControl = (index: number) => attrs.controls[index];

		test.beforeEach(async ({page}) => {
			await renderDummy(page, attrs);
		});

		test('renders the provided component', async ({page}) => {
			const componentName = await page.evaluate(() =>
				// @ts-ignore component prop exists
				document.getElementById('test-button')!.component.componentName);

			test.expect(componentName).toBe(getControl(0).component);
		});

		test('provides a content from `text` into the `default` slot', async ({page}) => {
			await test.expect(page.locator('#test-button')).toHaveText(getControl(0).text);
		});

		test('provides attributes to the component', async ({page}) => {
			const attributes = await page.evaluate(() => {
				// @ts-ignore component prop exists
				const c = document.getElementById('link-button').component;
				return [c.type, c.href];
			});

			const {attrs: {type, href}} = getControl(1);

			test.expect(attributes).toEqual([type, href]);
		});

		test('renders all of the provided controls', async ({page}) => {
			const {attrs: {id: id1}} = getControl(0);
			const {attrs: {id: id2}} = getControl(1);

			await test.expect(page.locator(`#${id1}`).isVisible()).resolves.toBeTruthy();
			await test.expect(page.locator(`#${id2}`).isVisible()).resolves.toBeTruthy();
		});

		test('creates control wrappers with the provided class name', async ({page}) => {
			const locator = page.locator(createSelector('control-wrapper'));
			await test.expect(locator).toHaveCount(2);

			const createHas = (index: number) => ({has: page.locator(`#${getControl(index).attrs.id}`)});

			await test.expect(locator.filter(createHas(0)).isVisible()).resolves.toBeTruthy();
			await test.expect(locator.filter(createHas(1)).isVisible()).resolves.toBeTruthy();
		});

		test('provides the specified class name to controls', async ({page}) => {
			await test.expect(page.locator(createSelector('control-wrapper'))).toHaveCount(2);
		});
	});

	test.describe('`action`', () => {
		test('as `function`', async ({page}) => {
			await renderDummy(page, {
				controls: [createControl('target', {action: () => globalThis._t = 1})]
			});

			await page.click('#target');

			await test.expect(page.waitForFunction(() => globalThis._t === 1)).toBeResolved();
		});

		test('as `string', async ({page}) => {
			await renderDummy(page, {
				controls: [createControl('target', {action: 'testFn'})]
			});

			await page.click('#target');

			await test.expect(page.waitForFunction(() => globalThis._t === 1)).toBeResolved();
		});

		test.describe('as `ControlActionObject`', () => {
			test('with `args` provided', async ({page}) => {
				await renderDummy(page, {
					controls: [createControl('target', {action: {handler: 'testFn', args: [1, 2, 3, 4]}})]
				});

				await Promise.all([
					page.click('#target'),
					page.waitForFunction(() => globalThis._args?.length === 4)
				]);

				const
					args = await page.evaluate(() => globalThis._args);

				test.expect(args).toEqual([1, 2, 3, 4]);
			});

			test('providing `defArgs` to `true`', async ({page}) => {
				await renderDummy(page, {
					controls: [createControl('target', {action: {handler: 'testFn', defArgs: true, args: [1, 2, 3, 4]}})]
				});

				await Promise.all([
					page.click('#target'),
					page.waitForFunction(() => globalThis._args?.length === 6)
				]);

				const result = await page.evaluate(() => {
					const
						[ctx, event, ...rest] = globalThis._args;

					return [
						// @ts-ignore component prop exist
						ctx === document.getElementById('target').component,
						event.target != null,
						...rest
					];
				});

				test.expect(result).toEqual([true, true, 1, 2, 3, 4]);
			});

			test.describe('providing `argsMap`', () => {
				test('as `string`', async ({page}) => {
					await renderDummy(page, {
						controls: [
							createControl('target', {
								action: {
									handler: 'testFn',
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

					test.expect(args).toEqual([1, 2, 3, 4]);
				});

				test('as `function`', async ({page}) => {
					await renderDummy(page, {
						controls: [
							createControl('target', {
								action: {
									handler: 'testFn',
									args: [1, 2, 3, 4],
									argsMap: (...args) => args[0].sort((a, b) => b - a)
								}
							})
						]
					});

					await Promise.all([
						page.click('#target'),
						page.waitForFunction(() => globalThis._args?.length === 4)
					]);

					const
						args = await page.evaluate(() => globalThis._args);

					test.expect(args).toEqual([4, 3, 2, 1]);
				});
			});
		});
	});

	function createControl(id: string, props: any = {}) {
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

	async function renderDummy(
		page: Page, attrs: RenderComponentsVnodeParams['attrs'] = {}
	): Promise<JSHandle<bTraitsIControlListDummy>> {
		await Component.waitForComponentTemplate(page, componentName);
		return Component.createComponent(page, componentName, attrs);
	}
});
