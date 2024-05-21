/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { JSHandle } from 'playwright';

import test from 'tests/config/unit/test';

import { Component } from 'tests/helpers';

import type bFriendsBlockDummy from 'components/friends/block/test/b-friends-block-dummy/b-friends-block-dummy';

test.describe('friends/block', () => {
	let
		target: JSHandle<bFriendsBlockDummy>,
		componentId: string;

	const componentName = 'b-friends-block-dummy';

	/**
	 * Returns a string prefixed with "b-friends-block-dummy"
	 *
	 * @param [strings]
	 * @example
	 * ```typescript
	 * prefix`__button` // b-friends-block-dummy__button
	 * ```
	 */
	const prefix = (strings?: TemplateStringsArray) => `${componentName}${strings?.join(' ') ?? ''}`;

	test.beforeEach(async ({demoPage, page}) => {
		await demoPage.goto();

		// Render component
		await Component.waitForComponentTemplate(page, componentName);
		target = await Component.createComponent(page, componentName);

		// Prepare const
		componentId = await target.evaluate((ctx) => ctx.componentId);

		// Prepare global this
		await page.evaluate((componentName) => {
			globalThis.prefix = (strings?: TemplateStringsArray) => `${componentName}${strings?.join(' ') ?? ''}`;
		}, componentName);
	});

	test.describe('`getFullBlockName`', () => {
		test('should return the full block name', async () => {
			const testVal = await target.evaluate((ctx) => ctx.unsafe.block?.getFullBlockName());

			test.expect(testVal).toBe(componentName);
		});

		test('should return the full block name concatenated with the provided modifier and its value', async () => {
			const testVal = await target.evaluate((ctx) => ctx.unsafe.block?.getFullBlockName('focused', true));

			test.expect(testVal).toBe(prefix`_focused_true`);
		});
	});

	test.describe('`getBlockSelector`', () => {
		test('should return a selector for the block', async () => {
			const testVal = await target.evaluate((ctx) => ctx.unsafe.block?.getBlockSelector());

			test.expect(testVal).toBe(`.${componentName}`);
		});

		test('should return a selector consisting of the full block name and the provided modifier', async () => {
			const testVal = await target.evaluate((ctx) => ctx.unsafe.block?.getBlockSelector({focused: true}));

			test.expect(testVal).toBe(`.${componentName}.${prefix`_focused_true`}`);
		});
	});

	test.describe('`getFullElementName`', () => {
		test('should return the full element name', async () => {
			const testVal = await target.evaluate((ctx) => ctx.unsafe.block?.getFullElementName('test'));

			test.expect(testVal).toBe(prefix`__test`);
		});

		test('should return the full element name concatenated with the provided modifier and its value', async () => {
			const testVal = await target.evaluate((ctx) =>
				ctx.unsafe.block?.getFullElementName('test', 'focused', true));

			test.expect(testVal).toBe(prefix`__test_focused_true`);
		});
	});

	test.describe('`getElementSelector`', () => {
		test('should return a selector consisting of the provided element name and component ID', async () => {
			const testVal = await target.evaluate((ctx) => ctx.unsafe.block?.getElementSelector('test'));

			test.expect(testVal).toBe(`.${prefix`__test`}.${componentId}`);
		});

		test([
			'should return a selector consisting of the provided element name,',
			'the component ID, and the provided modifier'
		].join(' '), async () => {
			const testVal = await target.evaluate((ctx) =>
				ctx.unsafe.block?.getElementSelector('test', {focused: true}));

			test.expect(testVal).toBe(`.${prefix`__test`}.${componentId}.${prefix`__test_focused_true`}`);
		});
	});

	test.describe('`element`', () => {
		test.beforeEach(async () => {
			await target.evaluate((ctx) => {
				const
					dummyEl = document.createElement('div'),
					dummyElMod = document.createElement('div');

				dummyEl.classList.add(prefix`__test`, ctx.componentId);
				dummyElMod.classList.add(prefix`__test`, prefix`__test_focused_true`, ctx.componentId);

				ctx.$el!.append(dummyEl, dummyElMod);
			});
		});

		test('should return DOM node for the specified element name', async () => {
			const elExists = await target.evaluate((ctx) => Boolean(ctx.unsafe.block?.element('test')));

			test.expect(elExists).toBeTruthy();
		});

		test('should return DOM node for the specified element name and modifier', async () => {
			const elExists = await target.evaluate((ctx) =>
				Boolean(ctx.unsafe.block?.element('test', {focused: true})));

			test.expect(elExists).toBeTruthy();
		});

		test('should return `null` for the non-existing element', async () => {
			const elExists = await target.evaluate((ctx) => Boolean(ctx.unsafe.block?.element('unreachable')));

			test.expect(elExists).toBeFalsy();
		});

		test('should return `null` for the element with the non-existing modifier', async () => {
			const elExists = await target.evaluate((ctx) =>
				Boolean(ctx.unsafe.block?.element('test', {unreachableMod: true})));

			test.expect(elExists).toBeFalsy();
		});

		test('should return DOM node for the specified context and element name', async () => {
			const elExists = await target.evaluate((ctx) => Boolean(ctx.unsafe.block?.element(ctx.$el!, 'test')));

			test.expect(elExists).toBeTruthy();
		});
	});

	test.describe('`elements`', () => {
		test.beforeEach(async () => {
			await target.evaluate((ctx) => {
				const
					dummyEl = document.createElement('div'),
					dummyElMod = document.createElement('div');

				dummyEl.classList.add(prefix`__test`, ctx.componentId);
				dummyElMod.classList.add(prefix`__test`, prefix`__test_focused_true`, ctx.componentId);

				ctx.$el!.append(dummyEl, dummyElMod);
			});
		});

		test('should return DOM nodes for the specified element name', async () => {
			const elsExist = await target.evaluate((ctx) => Boolean(ctx.unsafe.block?.elements('test').length));

			test.expect(elsExist).toBeTruthy();
		});

		test('should return DOM nodes for the specified element name and modifier', async () => {
			const elsExist = await target.evaluate((ctx) =>
				Boolean(ctx.unsafe.block?.elements('test', {focused: true}).length));

			test.expect(elsExist).toBeTruthy();
		});

		test('should return empty array for the non-existing element', async () => {
			const elsExist = await target.evaluate((ctx) =>
				Boolean(ctx.unsafe.block?.elements('unreachable').length));

			test.expect(elsExist).toBeFalsy();
		});
	});

	test.describe('`setMod`', () => {
		test('should add a modifier class to the element', async ({page}) => {
			await target.evaluate((ctx) => ctx.setMod('focused', true));

			await test.expect(page.locator(`.${componentName}`))
				.toHaveClass(new RegExp(prefix`_focused_true`));
		});

		test('should emit the `block.mod.set.*` events', async () => {
			const blockModSetEventPr = target.evaluate((ctx) =>
				ctx.unsafe.localEmitter.promisifyOnce('block.mod.set.focused.true'));

			await target.evaluate((ctx) => ctx.setMod('focused', true));

			await test.expect(blockModSetEventPr).toBeResolved();
		});

		test('should update component\'s `mods` state', async () => {
			await target.evaluate((ctx) => ctx.setMod('focused', true));

			const storedModVal = await target.evaluate((ctx) => ctx.mods.focused);

			test.expect(storedModVal).toBe('true');
		});
	});

	test.describe('`removeMod`', () => {
		test.beforeEach(async () => {
			await target.evaluate((ctx) => ctx.setMod('focused', true));
		});

		test('should remove a modifier class from the element', async ({page}) => {
			await target.evaluate((ctx) => ctx.removeMod('focused'));

			await test.expect(page.locator(`.${componentName}`))
				.not.toHaveClass(new RegExp(prefix`_focused_true`));
		});

		test('should emit the `block.mod.remove.*` events', async () => {
			const blockModRemoveEventPr = target.evaluate((ctx) =>
				ctx.unsafe.localEmitter.promisifyOnce('block.mod.remove.focused.true'));

			await target.evaluate((ctx) => ctx.removeMod('focused', true));

			await test.expect(blockModRemoveEventPr).toBeResolved();
		});

		test('should remove modifier value from the component\'s `mods` state', async () => {
			await target.evaluate((ctx) => ctx.removeMod('focused', true));

			const storedModVal = await target.evaluate((ctx) => ctx.mods.focused);

			test.expect(storedModVal).toBeUndefined();
		});
	});

	test.describe('`getMod`', () => {
		test('should return component\'s modifier value from it\'s state', async () => {
			await target.evaluate((ctx) => ctx.setMod('focused', true));

			const modVal = await target.evaluate((ctx) => ctx.unsafe.block?.getMod('focused', false));

			test.expect(modVal).toBe('true');
		});

		test('should return `undefined` if the modifier is not set', async () => {
			const modVal = await target.evaluate((ctx) => ctx.unsafe.block?.getMod('focused', false));

			test.expect(modVal).toBeUndefined();
		});
	});

	test.describe('`setElementMod`', () => {
		test.beforeEach(async () => {
			await target.evaluate((ctx) => {
				const dummyEl = document.createElement('div');

				dummyEl.classList.add(prefix`__test`, ctx.componentId);

				ctx.$el!.append(dummyEl);
				globalThis._testEl = dummyEl;
			});
		});

		test('should set a modifier class for the provided DOM node', async ({page}) => {
			await target.evaluate((ctx) =>
				ctx.unsafe.block?.setElementMod(globalThis._testEl, 'test', 'focused', true));

			await test.expect(page.locator(`.${prefix`__test`}`))
				.toHaveClass(new RegExp(prefix`__test_focused_true`));
		});

		test('should emit the `el.mod.set.{elementName}.*` events', async () => {
			const elModSetEvent = target.evaluate((ctx) =>
				ctx.unsafe.localEmitter.promisifyOnce('el.mod.set.test.focused.true'));

			await target.evaluate((ctx) =>
				ctx.unsafe.block?.setElementMod(globalThis._testEl, 'test', 'focused', true));

			await test.expect(elModSetEvent).toBeResolved();
		});
	});

	test.describe('`removeElementMod`', () => {
		test.beforeEach(async () => {
			await target.evaluate((ctx) => {
				const dummyEl = document.createElement('div');

				dummyEl.classList.add(prefix`__test`, ctx.componentId);

				ctx.$el!.append(dummyEl);
				globalThis._testEl = dummyEl;
			});

			await target.evaluate((ctx) =>
				ctx.unsafe.block?.setElementMod(globalThis._testEl, 'test', 'focused', true));
		});

		test('should remove a modifier class from the provided DOM node', async ({page}) => {
			await target.evaluate((ctx) =>
				ctx.unsafe.block?.removeElementMod(globalThis._testEl, 'test', 'focused'));

			await test.expect(page.locator(`.${prefix`__test`}`))
				.not.toHaveClass(new RegExp(prefix`__test_focused_true`));
		});

		test('should emit the `el.mod.remove.{elementName}.*` events', async () => {
			const elModSetEvent = target.evaluate((ctx) =>
				ctx.unsafe.localEmitter.promisifyOnce('el.mod.remove.test.focused.true'));

			await target.evaluate((ctx) =>
				ctx.unsafe.block?.removeElementMod(globalThis._testEl, 'test', 'focused'));

			await test.expect(elModSetEvent).toBeResolved();
		});
	});

	test.describe('`getElementMod`', () => {
		test.beforeEach(async () => {
			await target.evaluate((ctx) => {
				const dummyEl = document.createElement('div');

				dummyEl.classList.add(prefix`__test`, ctx.componentId);

				ctx.$el!.append(dummyEl);
				globalThis._testEl = dummyEl;
			});

		});

		test('should return modifier value for the provided DOM node', async () => {
			await target.evaluate((ctx) =>
				ctx.unsafe.block?.setElementMod(globalThis._testEl, 'test', 'focused', true));

			const modVal = await target.evaluate((ctx) =>
				ctx.unsafe.block?.getElementMod(globalThis._testEl, 'test', 'focused'));

			test.expect(modVal).toBe('true');
		});

		test('should return `undefined` if the modifier is not set on the provided DOM node', async () => {
			const modVal = await target.evaluate((ctx) =>
				ctx.unsafe.block?.getElementMod(globalThis._testEl, 'test', 'focused'));

			test.expect(modVal).toBeUndefined();
		});
	});
});
