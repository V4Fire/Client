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
	 * @example
	 * ```typescript
	 * prefix`__button` // b-friends-block-dummy__button
	 * ```
	 */
	const prefix = (strings?: TemplateStringsArray) => `${componentName}${strings?.join(' ') ?? ''}`;

	test.beforeEach(async ({demoPage, page}) => {
		await demoPage.goto();
		await Component.waitForComponentTemplate(page, componentName);
		target = await Component.createComponent(page, componentName);
		componentId = await target.evaluate((ctx) => ctx.componentId);
	});

	test.describe('`getFullBlockName`', () => {
		test('simple usage', async () => {
			const
				testVal = await target.evaluate((ctx) => ctx.unsafe.block?.getFullBlockName());

			test.expect(testVal).toBe('b-friends-block-dummy');
		});

		test('`providing modifiers', async () => {
			const testVal = await target.evaluate((ctx) =>
				ctx.unsafe.block?.getFullBlockName('focused', true));

			test.expect(testVal).toBe('b-friends-block-dummy_focused_true');
		});
	});

	test.describe('`getBlockSelector`', () => {
		test('simple usage', async () => {
			const
				testVal = await target.evaluate((ctx) => ctx.unsafe.block?.getBlockSelector());

			test.expect(testVal).toBe('.b-friends-block-dummy');
		});

		test('providing modifiers', async () => {
			const
				testVal = await target.evaluate((ctx) => ctx.unsafe.block?.getBlockSelector({focused: true}));

			test.expect(testVal).toBe('.b-friends-block-dummy.b-friends-block-dummy_focused_true');
		});
	});

	test.describe('`getFullElementName`', () => {
		test('simple usage', async () => {
			const
				testVal = await target.evaluate((ctx) => ctx.unsafe.block?.getFullElementName('test'));

			test.expect(testVal).toBe('b-friends-block-dummy__test');
		});

		test('providing modifiers', async () => {
			const testVal = await target.evaluate((ctx) =>
				ctx.unsafe.block?.getFullElementName('test', 'focused', true));

			test.expect(testVal).toBe('b-friends-block-dummy__test_focused_true');
		});
	});

	test.describe('`getElementSelector`', () => {
		test('simple usage', async () => {
			const
				testVal = await target.evaluate((ctx) => ctx.unsafe.block?.getElementSelector('test'));

			test.expect(testVal).toBe(`.b-friends-block-dummy__test.${componentId}`);
		});

		test('providing modifiers', async () => {
			const testVal = await target.evaluate((ctx) =>
				ctx.unsafe.block?.getElementSelector('test', {focused: true}));

			test.expect(testVal).toBe(`.b-friends-block-dummy__test.${componentId}.b-friends-block-dummy__test_focused_true`);
		});
	});

	test.describe('`element`', () => {
		test.beforeEach(async () => {
			await target.evaluate((ctx) => {
				const
					dummyElSelector = document.createElement('div'),
					dummyElModSelector = document.createElement('div');

				dummyElSelector.classList.add('b-friends-block-dummy__test', ctx.componentId);
				dummyElModSelector.classList.add('b-friends-block-dummy__test', 'b-friends-block-dummy__test_focused_true', ctx.componentId);

				ctx.$el!.append(dummyElSelector, dummyElModSelector);
			});
		});

		test('simple usage', async () => {
			const
				isElFounded = await target.evaluate((ctx) => Boolean(ctx.unsafe.block?.element('test')));

			test.expect(isElFounded).toBeTruthy();
		});

		test('providing additional modifiers to search', async () => {
			const isElFounded = await target.evaluate((ctx) =>
				Boolean(ctx.unsafe.block?.element('test', {focused: true})));

			test.expect(isElFounded).toBeTruthy();
		});

		test('finding an unreachable element', async () => {
			const
				isElFounded = await target.evaluate((ctx) => Boolean(ctx.unsafe.block?.element('unreachable')));

			test.expect(isElFounded).toBeFalsy();
		});

		test('finding an element with an unreachable modifier', async () => {
			const isElFounded = await target.evaluate((ctx) =>
				Boolean(ctx.unsafe.block?.element('test', {unreachableMod: true})));

			test.expect(isElFounded).toBeFalsy();
		});

		test('providing the context to search', async () => {
			const
				isElFounded = await target.evaluate((ctx) => Boolean(ctx.unsafe.block?.element(ctx.$el!, 'test')));

			test.expect(isElFounded).toBeTruthy();
		});
	});

	test.describe('`elements`', () => {
		test.beforeEach(async () => {
			await target.evaluate((ctx) => {
				const
					dummyElSelector = document.createElement('div'),
					dummyElModSelector = document.createElement('div');

				dummyElSelector.classList.add('b-friends-block-dummy__test', ctx.componentId);
				dummyElModSelector.classList.add('b-friends-block-dummy__test', 'b-friends-block-dummy__test_focused_true', ctx.componentId);

				ctx.$el!.append(dummyElSelector, dummyElModSelector);
			});
		});

		test('simple usage', async () => {
			const
				isElsFounded = await target.evaluate((ctx) => Boolean(ctx.unsafe.block?.elements('test').length));

			test.expect(isElsFounded).toBeTruthy();
		});

		test('providing additional modifiers to search', async () => {
			const isElsFounded = await target.evaluate((ctx) =>
				Boolean(ctx.unsafe.block?.elements('test', {focused: true}).length));

			test.expect(isElsFounded).toBeTruthy();
		});

		test('finding unreachable elements', async () => {
			const
				isElsFounded = await target.evaluate((ctx) => Boolean(ctx.unsafe.block?.elements('unreachable').length));

			test.expect(isElsFounded).toBeFalsy();
		});
	});

	test.describe('`setMod`', () => {
		test('sets a class name to the element', async () => {
			await target.evaluate((ctx) => ctx.setMod('focused', true));

			const
				hasClass = await target.evaluate((ctx) => ctx.$el!.classList.contains('b-friends-block-dummy_focused_true'));

			test.expect(hasClass).toBeTruthy();
		});

		test('emits events', async () => {
			const blockModSetEventPr = target.evaluate((ctx) =>
				ctx.unsafe.localEmitter.promisifyOnce('block.mod.set.focused.true'));

			await target.evaluate((ctx) => ctx.setMod('focused', true));

			await test.expect(blockModSetEventPr).toBeResolved();
		});

		test('stores a modifier to the component state', async () => {
			await target.evaluate((ctx) => ctx.setMod('focused', true));

			const
				storedModVal = await target.evaluate((ctx) => ctx.mods.focused);

			test.expect(storedModVal).toBe('true');
		});
	});

	test.describe('`removeMod`', () => {
		test.beforeEach(async () => {
			await target.evaluate((ctx) => ctx.setMod('focused', true));
		});

		test('removes a class name from the element', async () => {
			await target.evaluate((ctx) => ctx.removeMod('focused'));

			const
				hasClass = await target.evaluate((ctx) => ctx.$el!.classList.contains('b-friends-block-dummy_focused_true'));

			test.expect(hasClass).toBeFalsy();
		});

		test('emits events', async () => {
			const blockModRemoveEventPr = target.evaluate((ctx) =>
				ctx.localEmitter.promisifyOnce('block.mod.remove.focused.true'));

			await target.evaluate((ctx) => ctx.removeMod('focused', true));

			await test.expect(blockModRemoveEventPr).toBeResolved();
		});

		test('removes a modifier from the component state', async () => {
			await target.evaluate((ctx) => ctx.removeMod('focused', true));

			const
				storedModVal = await target.evaluate((ctx) => ctx.mods.focused);

			test.expect(storedModVal).toBeUndefined();
		});
	});

	test.describe('`getMod`', () => {
		test('gets a modifier from the component state', async () => {
			await target.evaluate((ctx) => ctx.setMod('focused', true));

			const
				modVal = await target.evaluate((ctx) => ctx.unsafe.block?.getMod('focused', false));

			test.expect(modVal).toBe('true');
		});

		test('returns `undefined` if the modifier is not settled', async () => {
			const
				modVal = await target.evaluate((ctx) => ctx.unsafe.block?.getMod('focused', false));

			test.expect(modVal).toBeUndefined();
		});
	});

	test.describe('`setElementMod`', () => {
		test.beforeEach(async () => {
			await target.evaluate((ctx) => {
				const
					dummyElSelector = document.createElement('div');

				dummyElSelector.classList.add('b-friends-block-dummy__test', ctx.componentId);

				ctx.$el!.append(dummyElSelector);

				globalThis._testEl = dummyElSelector;
			});
		});

		test('sets a class name to the element', async ({page}) => {
			await target.evaluate((ctx) =>
				ctx.unsafe.block?.setElementMod(globalThis._testEl, 'test', 'focused', 'true'));

			const hasClass = await page.evaluate(() =>
				globalThis._testEl.classList.contains('b-friends-block-dummy__test_focused_true'));

			test.expect(hasClass).toBeTruthy();
		});

		test('emits an event', async () => {
			const elModSetEvent = target.evaluate((ctx) =>
				ctx.unsafe.localEmitter.promisifyOnce('el.mod.set.test.focused.true'));

			await target.evaluate((ctx) =>
				ctx.unsafe.block?.setElementMod(globalThis._testEl, 'test', 'focused', 'true'));

			await test.expect(elModSetEvent).toBeResolved();
		});
	});

	test.describe('`removeElementMod`', () => {
		test.beforeEach(async () => {
			await target.evaluate((ctx) => {
				const
					dummyElSelector = document.createElement('div');

				dummyElSelector.classList.add('b-friends-block-dummy__test', ctx.componentId);

				ctx.$el!.append(dummyElSelector);
				globalThis._testEl = dummyElSelector;
			});

			await target.evaluate((ctx) =>
				ctx.unsafe.block?.setElementMod(globalThis._testEl, 'test', 'focused', 'true'));
		});

		test('removed a class name from the element', async ({page}) => {
			await target.evaluate((ctx) =>
				ctx.unsafe.block?.removeElementMod(globalThis._testEl, 'test', 'focused'));

			const hasClass = await page.evaluate(() =>
				globalThis._testEl.classList.contains('b-friends-block-dummy__test_focused_true'));

			test.expect(hasClass).toBeFalsy();
		});

		test('emits an event', async () => {
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
				const
					dummyElSelector = document.createElement('div');

				dummyElSelector.classList.add('b-friends-block-dummy__test', ctx.componentId);

				ctx.$el!.append(dummyElSelector);
				globalThis._testEl = dummyElSelector;
			});

		});

		test('gets a modifier value', async () => {
			await target.evaluate((ctx) =>
				ctx.unsafe.block?.setElementMod(globalThis._testEl, 'test', 'focused', 'true'));

			const modVal = await target.evaluate((ctx) =>
				ctx.unsafe.block?.getElementMod(globalThis._testEl, 'test', 'focused'));

			test.expect(modVal).toBe('true');
		});

		test('returns `undefined` if the modifier was not settled', async () => {
			const modVal = await target.evaluate((ctx) =>
				ctx.unsafe.block?.getElementMod(globalThis._testEl, 'test', 'focused'));

			test.expect(modVal).toBeUndefined();
		});
	});
});
