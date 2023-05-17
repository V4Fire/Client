/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { JSHandle } from 'playwright';

import test from 'tests/config/unit/test';

import { BOM, Component } from 'tests/helpers';

import type bDummy from 'components/dummies/b-dummy/b-dummy';

test.describe('friends/dom', () => {

	let target: JSHandle<bDummy>;

	test.beforeEach(async ({demoPage, page}) => {
		await demoPage.goto();

		await Component.waitForComponentTemplate(page, 'b-friends-dom-dummy');
		target = await Component.createComponent(page, 'b-friends-dom-dummy');

		await page.evaluate(() => {
			const el = document.createElement('div');

			el.id = 'newNode';
			Object.assign(el.style, {height: '20px', width: '20px'});

			globalThis._testEl = el;
		});
	});

	test.describe('`getId`', () => {
		test('`null | undefined`', async () => {
			const result = await target.evaluate((ctx) =>
				[ctx.unsafe.dom.getId(undefined), ctx.unsafe.dom.getId(null)]);

			test.expect(result).toEqual([undefined, undefined]);
		});

		test('someString', async () => {
			const [id, result] = await target.evaluate((ctx) =>
				[ctx.componentId, ctx.unsafe.dom.getId('someString')]);

			test.expect(result).toEqual(`${id}-someString`);
		});
	});

	test.describe('`delegate`', () => {
		test('fires a callback inside of `#foo`', async ({page}) => {
			const clickResult = target.evaluate((ctx) => {
				const fooEl = document.createElement('div');
				fooEl.id = 'foo';

				fooEl.appendChild(globalThis._testEl);
				ctx.$el!.appendChild(fooEl);

				return new Promise((resolve) => {
					globalThis._testEl.addEventListener('click', ctx.unsafe.dom.delegate('#foo', () => resolve(1)));
				});
			});

			await page.locator('#newNode').click();

			await test.expect(clickResult).resolves.toBe(1);
		});

		test('does not fire a callback outside of `#foo`', async ({page}) => {
			await target.evaluate((ctx) => {
				const fooEl = document.createElement('div');
				fooEl.id = 'foo';

				ctx.$el!.appendChild(fooEl);
				ctx.$el!.parentNode!.prepend(globalThis._testEl);

				globalThis._testEl.addEventListener('click', ctx.unsafe.dom.delegate('#foo', () => globalThis._t = 1));
			});

			await page.locator('#newNode').click();
			await BOM.waitForIdleCallback(page);

			await test.expect(page.evaluate(() => globalThis._t)).resolves.toBeUndefined();
		});
	});

	test.describe('`renderTemporarily`', () => {
		test('puts a new node into the document', async () => {
			const isConnected = await target.evaluate((ctx) => new Promise((res) =>
				ctx.unsafe.dom.renderTemporarily(globalThis._testEl, (el) => res(el.isConnected))));

			test.expect(isConnected).toBeTruthy();
		});
	});

	test.describe('`appendChild`', () => {
		test('appends a new node to the parent node', async () => {
			await target.evaluate((ctx) => {
				ctx.unsafe.dom.appendChild(ctx.$el!, globalThis._testEl);
			});

			const isIn = await target.evaluate((ctx) => globalThis._testEl.parentNode === ctx.$el);

			test.expect(isIn).toBeTruthy();
		});

		test('removes a node from the parent node on async `clear`', async ({page}) => {
			await target.evaluate((ctx) => {
				ctx.unsafe.dom.appendChild(ctx.$el!, globalThis._testEl, '_test-group');
			});

			await target.evaluate((ctx) => ctx.unsafe.async.clearAll({group: '_test-group'}));

			const isConnected = await page.evaluate(() => globalThis._testEl.isConnected);

			test.expect(isConnected).toBeFalsy();
		});

		test('destroys a node component on async `clear`', async ({page}) => {

			const button = await Component.createComponent(page, 'b-button', {
				attrs: {
					id: 'button-test'
				},
				children: {
					default: () => 'Hello there general kenobi'
				}
			});

			await button.evaluate(() => {
				globalThis._testEl = document.getElementById('button-test');
			});

			await target.evaluate((ctx) => {
				ctx.unsafe.dom.appendChild(ctx.$el!, globalThis._testEl, {group: '_test-group', destroyIfComponent: true});
			});

			await target.evaluate((ctx) => ctx.unsafe.async.clearAll({group: '_test-group'}));

			const [isConnected, hook] = await page.evaluate(() => [
				globalThis._testEl.isConnected,
				'destroyed' // globalThis._testEl.component.hook
			]);

			test.expect(isConnected).toBeFalsy();
			test.expect(hook).toBe('destroyed');
		});
	});

	test.describe('`replaceWith`', () => {
		test.beforeEach(async () => {
			await target.evaluate((ctx) => {
				globalThis._testEl2 = document.createElement('div');
				ctx.$el!.appendChild(globalThis._testEl2);
			});
		});

		test('replaces an old node with a new one', async ({page}) => {
			await target.evaluate((ctx) => {
				ctx.unsafe.dom.replaceWith(globalThis._testEl2, globalThis._testEl);
			});

			const [aIsConnected, bIsConnected] = await page.evaluate(() => [
				globalThis._testEl2.isConnected,
				globalThis._testEl.isConnected
			]);

			test.expect(aIsConnected).toBeFalsy();
			test.expect(bIsConnected).toBeTruthy();
		});

		test('removes a node on async `clear`', async ({page}) => {
			await target.evaluate((ctx) => {
				ctx.unsafe.dom.replaceWith(globalThis._testEl2, globalThis._testEl, '_test-group');
			});

			await target.evaluate((ctx) => ctx.unsafe.async.clearAll({group: '_test-group'}));

			const isConnected = await page.evaluate(() => globalThis._testEl.isConnected);

			test.expect(isConnected).toBeFalsy();
		});

		test('destroys a node component on async `clear`', async ({page}) => {

			const button = await Component.createComponent(page, 'b-button', {
				attrs: {
					id: 'button-test'
				},
				children: {
					default: () => 'Hello there general kenobi'
				}
			});

			await button.evaluate(() => {
				globalThis._testEl = document.getElementById('button-test');
			});

			await target.evaluate((ctx) => {
				ctx.unsafe.dom.replaceWith(globalThis._testEl2, globalThis._testEl, {group: '_test-group', destroyIfComponent: true});
			});

			await target.evaluate((ctx) => ctx.unsafe.async.clearAll({group: '_test-group'}));

			const [isConnected, hook] = await page.evaluate(() => [
				globalThis._testEl.isConnected,
				'destroyed' // globalThis._testEl.component.hook
			]);

			test.expect(isConnected).toBeFalsy();
			test.expect(hook).toBe('destroyed');
		});
	});

	test.describe('`getComponent`', () => {
		let targetComponentId;

		test.beforeEach(async () => {
			targetComponentId = await target.evaluate((ctx) => ctx.componentId);
		});

		test('.b-friends-dom-dummy', async () => {
			const foundedId = await target.evaluate((ctx) => ctx.unsafe.dom.getComponent('.b-friends-dom-dummy')!.componentId);

			test.expect(foundedId).toBe(targetComponentId);
		});

		test('dummy component', async () => {
			const
				foundedId = await target.evaluate((ctx) => ctx.unsafe.dom.getComponent(ctx.$el!)!.componentId);

			test.expect(foundedId).toBe(targetComponentId);
		});

		test('nested node within the dummy component', async () => {
			const foundedId = await target.evaluate((ctx) => {
				ctx.$el!.appendChild(globalThis._testEl);
				return ctx.unsafe.dom.getComponent(globalThis._testEl)!.componentId;
			});

			test.expect(foundedId).toBe(targetComponentId);
		});

		test('unreachable component', async () => {
			const foundedId = await target.evaluate((ctx) => ctx.unsafe.dom.getComponent('.unreachable-selector'));

			test.expect(foundedId).toBeNull();
		});
	});

	test.describe('`watchForIntersection`', () => {
		test.beforeEach(async () => {
			await target.evaluate((ctx) => {
				ctx.$el!.appendChild(globalThis._testEl);

				return ctx.unsafe.dom.watchForIntersection(globalThis._testEl, {
					threshold: 0.1,
					delay: 300,
					group: '_test-group'
				}, () => globalThis._t = 1);
			});
		});

		test('starts watch for intersection', async ({page}) => {
			await test.expect(page.waitForFunction(() => globalThis._t === 1)).toBeResolved();
		});

		test('clears on async `clear`', async ({page}) => {
			await target.evaluate((ctx) => ctx.unsafe.async.clearAll({group: '_test-group'}));
			await BOM.waitForIdleCallback(page, {sleepAfterIdles: 600});

			const testVal = await page.evaluate(() => globalThis._t);

			test.expect(testVal).toBeUndefined();
		});
	});

	test.describe('`watchForResize`', () => {
		test.beforeEach(async () => {
			await target.evaluate((ctx) => {
				ctx.$el!.appendChild(globalThis._testEl);

				return ctx.unsafe.dom.watchForResize(globalThis._testEl, {
					group: '_test-group',
					watchInit: false
				}, () => globalThis._t = 1);
			});
		});

		test('starts watch for resizes', async ({page}) => {
			await BOM.waitForIdleCallback(page);

			await page.evaluate(() => {
				Object.assign(globalThis._testEl.style, {
					width: '400px',
					height: '400px'
				});
			});

			await test.expect(page.waitForFunction(() => globalThis._t === 1)).toBeResolved();
		});

		test('clears on async `clear`', async ({page}) => {
			await target.evaluate((ctx) => ctx.unsafe.async.clearAll({group: '_test-group'}));

			await page.evaluate(() => globalThis._testEl.style.width = '400px');
			await BOM.waitForIdleCallback(page, {sleepAfterIdles: 300});

			const testVal = await page.evaluate(() => globalThis._t);

			test.expect(testVal).toBeUndefined();
		});
	});
});
