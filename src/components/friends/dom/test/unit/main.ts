/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { JSHandle, Page } from 'playwright';

import test from 'tests/config/unit/test';

import { BOM, Component } from 'tests/helpers';

import type iBlock from 'components/super/i-block/i-block';

test.describe('friends/dom', () => {
	let target: JSHandle<iBlock>;

	test.beforeEach(async ({demoPage, page}) => {
		await demoPage.goto();

		await Component.waitForComponentTemplate(page, 'b-friends-dom-dummy');
		target = await Component.createComponent(page, 'b-friends-dom-dummy');

		await page.evaluate(() => {
			const el = document.createElement('div');

			el.id = 'emptyDiv';
			Object.assign(el.style, {height: '20px', width: '20px'});

			globalThis.emptyDiv = el;
		});
	});

	test.describe('`getId`', () => {
		test('should return `undefined` for `null | undefined`', async () => {
			const result = await target.evaluate((ctx) =>
				[ctx.unsafe.dom.getId(undefined), ctx.unsafe.dom.getId(null)]);

			test.expect(result).toEqual([undefined, undefined]);
		});

		test('should return the specified string prefixed with the component id', async () => {
			const [id, result] = await target.evaluate((ctx) =>
				[ctx.componentId, ctx.unsafe.dom.getId('someString')]);

			test.expect(result).toEqual(`${id}-someString`);
		});
	});

	test.describe('`unwrapId`', () => {
		test('should return the original id for the result of `getId`', async () => {
			const value = 'someString';

			const id = await target.evaluate((ctx, value) => ctx.unsafe.dom.getId(value), value);
			await test.expect(id).toMatch(new RegExp(`-${value}$`));

			const unwrappedId = await target.evaluate((ctx, id) => ctx.unsafe.dom.unwrapId(id), id);
			await test.expect(unwrappedId).toEqual(value);
		});
	});

	test.describe('`delegate`', () => {
		test('the callback should be fired when a click is performed inside of the specified element', async ({page}) => {
			const clickResult = target.evaluate((ctx) => {
				const fooEl = document.createElement('div');
				fooEl.id = 'foo';

				// Place an empty div inside the foo element
				fooEl.appendChild(globalThis.emptyDiv);
				ctx.$el!.appendChild(fooEl);

				return new Promise((resolve) => {
					globalThis.emptyDiv.addEventListener('click', ctx.unsafe.dom.delegate('#foo', () => resolve(1)));
				});
			});

			await page.locator('#emptyDiv').click();

			await test.expect(clickResult).toBeResolvedTo(1);
		});

		test('the callback should not be fired when a click is performed outside of the specified element', async ({page}) => {
			await target.evaluate((ctx) => {
				const fooEl = document.createElement('div');
				fooEl.id = 'foo';

				// Place an empty div near the foo element
				ctx.$el!.appendChild(fooEl);
				ctx.$el!.appendChild(globalThis.emptyDiv);

				globalThis.emptyDiv.addEventListener('click', ctx.unsafe.dom.delegate('#foo', () => globalThis.testClicked = true));
			});

			await page.locator('#emptyDiv').click();
			await BOM.waitForIdleCallback(page);

			await test.expect(page.evaluate(() => globalThis.testClicked)).resolves.toBeUndefined();
		});
	});

	test.describe('`renderTemporarily`', () => {
		test('the specified node should be temporarily rendered in the document', async ({page}) => {
			const isConnected = await target.evaluate((ctx) => new Promise((res) =>
				ctx.unsafe.dom.renderTemporarily(globalThis.emptyDiv, (el) => res(el.isConnected))));

			test.expect(isConnected).toBeTruthy();

			await test.expect(page.evaluate(() => globalThis.emptyDiv.isConnected)).resolves.toBeFalsy();
		});
	});

	test.describe('`appendChild`', () => {
		test('should append a new node to the specified node', async () => {
			await target.evaluate((ctx) => {
				ctx.unsafe.dom.appendChild(ctx.$el!, globalThis.emptyDiv);
			});

			const isIn = await target.evaluate((ctx) => globalThis.emptyDiv.parentNode === ctx.$el);

			test.expect(isIn).toBeTruthy();
		});

		test(
			[
				'the appended node should be removed from the parent node',
				'when `async.clearAll` is invoked'
			].join(' '),

			async ({page}) => {
				await target.evaluate((ctx) => {
					ctx.unsafe.dom.appendChild(ctx.$el!, globalThis.emptyDiv, 'test-group');
				});

				await test.expect(page.evaluate(() => globalThis.emptyDiv.isConnected))
					.resolves.toBeTruthy();

				await target.evaluate((ctx) => ctx.unsafe.async.clearAll({group: 'test-group'}));

				await test.expect(page.evaluate(() => globalThis.emptyDiv.isConnected))
					.resolves.toBeFalsy();
			}
		);

		test(
			[
				'if the appended node has a component and `destroyIfComponent` option is provided,',
				'the associated component should be destroyed when `async.clearAll` is invoked'
			].join(' '),

			async ({page}) => {
				await renderComponent(page);

				await target.evaluate((ctx) => {
					ctx.unsafe.dom.appendChild(ctx.$el!, globalThis.testComponent, {group: 'test-group', destroyIfComponent: true});
				});

				await target.evaluate((ctx) => ctx.unsafe.async.clearAll({group: 'test-group'}));

				const [isConnected, componentIsDestroyed] = await page.evaluate(() => [
					globalThis.testComponent.isConnected,
					globalThis.testComponent.component === undefined
				]);

				test.expect(isConnected).toBeFalsy();
				test.expect(componentIsDestroyed).toBeTruthy();
			}
		);
	});

	test.describe('`replaceWith`', () => {
		test.beforeEach(async () => {
			await target.evaluate((ctx) => {
				globalThis.emptyDiv2 = document.createElement('div');
				ctx.$el!.appendChild(globalThis.emptyDiv2);
			});
		});

		test('should replace an old node with a new one', async ({page}) => {
			await target.evaluate((ctx) => {
				ctx.unsafe.dom.replaceWith(globalThis.emptyDiv2, globalThis.emptyDiv);
			});

			const [aIsConnected, bIsConnected] = await page.evaluate(() => [
				globalThis.emptyDiv2.isConnected,
				globalThis.emptyDiv.isConnected
			]);

			test.expect(aIsConnected).toBeFalsy();
			test.expect(bIsConnected).toBeTruthy();
		});

		test('should remove the new node when `async.clearAll` is invoked', async ({page}) => {
			await target.evaluate((ctx) => {
				ctx.unsafe.dom.replaceWith(globalThis.emptyDiv2, globalThis.emptyDiv, 'test-group');
			});

			await test.expect(page.evaluate(() => globalThis.emptyDiv.isConnected))
				.resolves.toBeTruthy();

			await target.evaluate((ctx) => ctx.unsafe.async.clearAll({group: 'test-group'}));

			const [aIsConnected, bIsConnected] = await page.evaluate(() => [
				globalThis.emptyDiv2.isConnected,
				globalThis.emptyDiv.isConnected
			]);

			test.expect(aIsConnected).toBeFalsy();
			test.expect(bIsConnected).toBeFalsy();
		});

		test(
			[
				'if the new node has a component and `destroyIfComponent` option is provided,',
				'the associated component should be destroyed when `async.clearAll` is invoked'
			].join(' '),

			async ({page}) => {
				await renderComponent(page);

				await target.evaluate((ctx) => {
					ctx.unsafe.dom.replaceWith(globalThis.emptyDiv2, globalThis.testComponent, {group: 'test-group', destroyIfComponent: true});
				});

				await target.evaluate((ctx) => ctx.unsafe.async.clearAll({group: 'test-group'}));

				const [isConnected, componentIsDestroyed] = await page.evaluate(() => [
					globalThis.testComponent.isConnected,
					globalThis.testComponent.component === undefined
				]);

				test.expect(isConnected).toBeFalsy();
				test.expect(componentIsDestroyed).toBeTruthy();
			}
		);
	});

	test.describe('`getComponent`', () => {
		let targetComponentId;

		test.beforeEach(async () => {
			targetComponentId = await target.evaluate((ctx) => ctx.componentId);
		});

		test('should find the component by a selector', async () => {
			const componentId = await target.evaluate((ctx) =>
				ctx.unsafe.dom.getComponent('.b-friends-dom-dummy')!.componentId);

			test.expect(componentId).toBe(targetComponentId);
		});

		test('should find the component by a node', async () => {
			const componentId = await target.evaluate((ctx) =>
				ctx.unsafe.dom.getComponent(ctx.$el!)!.componentId);

			test.expect(componentId).toBe(targetComponentId);
		});

		test('should find the component by a nested node', async () => {
			const componentId = await target.evaluate((ctx) => {
				ctx.$el!.appendChild(globalThis.emptyDiv);
				return ctx.unsafe.dom.getComponent(globalThis.emptyDiv)!.componentId;
			});

			test.expect(componentId).toBe(targetComponentId);
		});

		test('should return `null` if the component is not found', async () => {
			const component = await target.evaluate((ctx) => ctx.unsafe.dom.getComponent('.unreachable-selector'));

			test.expect(component).toBeNull();
		});

		test('should return `null` if the component with the root selector is not found', async () => {
			const component = await target.evaluate((ctx) => ctx.unsafe.dom.getComponent('.b-friends-dom-dummy', '.unreachable-root-selector'));

			test.expect(component).toBeNull();
		});

		test('should find the component with the correct root selector', async ({page}) => {
			const rootSelectorTarget = await Component.createComponent(page, 'b-button', {
				attrs: {
					class: 'correct-root-selector'
				}
			});

			const componentId = await rootSelectorTarget.evaluate((ctx) => ctx.unsafe.dom.getComponent('.b-button', '.correct-root-selector')!.componentId);
			const targetComponentId = await rootSelectorTarget.evaluate((ctx) => ctx.componentId);

			test.expect(componentId).toBe(targetComponentId);
		});
	});

	test.describe('`watchForIntersection`', () => {
		test.beforeEach(async () => {
			await target.evaluate((ctx) => {
				ctx.$el!.appendChild(globalThis.emptyDiv);

				return ctx.unsafe.dom.watchForIntersection(globalThis.emptyDiv, {
					threshold: 0.1,
					delay: 150,
					group: 'test-group'
				}, () => globalThis.intersectionDetected = true);
			});
		});

		test('should detect the intersection of the node and a viewport', async ({page}) => {
			await test.expect(page.waitForFunction(() => globalThis.intersectionDetected)).toBeResolved();
		});

		test('should remove the intersection observer when `async.clearAll` is invoked', async ({page}) => {
			await target.evaluate((ctx) => ctx.unsafe.async.clearAll({group: 'test-group'}));
			await BOM.waitForIdleCallback(page, {sleepAfterIdles: 300});

			await test.expect(page.evaluate(() => globalThis.intersectionDetected)).resolves.toBeUndefined();
		});
	});

	test.describe('`watchForResize`', () => {
		test.beforeEach(async () => {
			await target.evaluate((ctx) => {
				ctx.$el!.appendChild(globalThis.emptyDiv);

				return ctx.unsafe.dom.watchForResize(globalThis.emptyDiv, {
					group: 'test-group',
					watchInit: false
				}, () => globalThis.resizeDetected = true);
			});
		});

		test('should detect the resize of the node', async ({page}) => {
			await BOM.waitForIdleCallback(page);

			await page.evaluate(() => {
				Object.assign(globalThis.emptyDiv.style, {
					width: '400px',
					height: '400px'
				});
			});

			await test.expect(page.waitForFunction(() => globalThis.resizeDetected)).toBeResolved();
		});

		test('should remove the resize observer when `async.clearAll` is invoked', async ({page}) => {
			await target.evaluate((ctx) => ctx.unsafe.async.clearAll({group: 'test-group'}));

			await page.evaluate(() => globalThis.emptyDiv.style.width = '400px');
			await BOM.waitForIdleCallback(page, {sleepAfterIdles: 300});

			await test.expect(page.evaluate(() => globalThis.resizeDetected)).resolves.toBeUndefined();
		});
	});

	async function renderComponent(page: Page): Promise<void> {
		await Component.createComponent(page, 'b-button', {
			attrs: {
				id: 'testComponent'
			},

			children: {
				default: () => 'Hello there, General Kenobi!'
			}
		});

		await page.evaluate(() => {
			globalThis.testComponent = document.getElementById('testComponent');
		});
	}
});
