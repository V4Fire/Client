/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

// @ts-check

const
	h = include('tests/helpers');

/**
 * Starts a test
 *
 * @param {Playwright.Page} page
 * @param {object} params
 * @returns {void}
 */
module.exports = (page, {browser, contextOpts}) => {
	const initialUrl = page.url();

	let
		dummyComponent,
		componentId,
		context;

	describe('`iBlock.block`', () => {
		beforeEach(async () => {
			context = await browser.newContext(contextOpts);

			page = await context.newPage();
			await page.goto(initialUrl);

			dummyComponent = await h.component.waitForComponent(page, '.b-dummy');
			componentId = await dummyComponent.evaluate((ctx) => ctx.componentId);
		});

		afterEach(() => context.close());

		describe('`getFullBlockName`', () => {
			it('simple usage', async () => {
				const
					testVal = await dummyComponent.evaluate((ctx) => ctx.block.getFullBlockName());

				expect(testVal).toBe('b-dummy');
			});

			it('`providing modifiers', async () => {
				const testVal = await dummyComponent.evaluate((ctx) =>
					ctx.block.getFullBlockName('focused', true));

				expect(testVal).toBe('b-dummy_focused_true');
			});
		});

		describe('`getBlockSelector`', () => {
			it('simple usage', async () => {
				const
					testVal = await dummyComponent.evaluate((ctx) => ctx.block.getBlockSelector());

				expect(testVal).toBe('.b-dummy');
			});

			it('providing modifiers', async () => {
				const
					testVal = await dummyComponent.evaluate((ctx) => ctx.block.getBlockSelector({focused: true}));

				expect(testVal).toBe('.b-dummy.b-dummy_focused_true');
			});
		});

		describe('`getFullElName`', () => {
			it('simple usage', async () => {
				const
					testVal = await dummyComponent.evaluate((ctx) => ctx.block.getFullElName('test'));

				expect(testVal).toBe('b-dummy__test');
			});

			it('providing modifiers', async () => {
				const testVal = await dummyComponent.evaluate((ctx) =>
					ctx.block.getFullElName('test', 'focused', true));

				expect(testVal).toBe('b-dummy__test_focused_true');
			});
		});

		describe('`getElSelector`', () => {
			it('simple usage', async () => {
				const
					testVal = await dummyComponent.evaluate((ctx) => ctx.block.getElSelector('test'));

				expect(testVal).toBe(`.${componentId}.b-dummy__test`);
			});

			it('providing modifiers', async () => {
				const testVal = await dummyComponent.evaluate((ctx) =>
					ctx.block.getElSelector('test', {focused: true}));

				expect(testVal).toBe(`.${componentId}.b-dummy__test.b-dummy__test_focused_true`);
			});
		});

		describe('`element`', () => {
			beforeEach(async () => {
				await dummyComponent.evaluate((ctx) => {
					const
						dummyElSelector = document.createElement('div'),
						dummyElModSelector = document.createElement('div');

					dummyElSelector.classList.add('b-dummy__test', ctx.componentId);
					dummyElModSelector.classList.add('b-dummy__test', 'b-dummy__test_focused_true', ctx.componentId);

					ctx.$el.append(dummyElSelector, dummyElModSelector);
				});
			});

			it('simple usage', async () => {
				const
					isElFounded = await dummyComponent.evaluate((ctx) => Boolean(ctx.block.element('test')));

				expect(isElFounded).toBeTrue();
			});

			it('providing additional modifiers to search', async () => {
				const isElFounded = await dummyComponent.evaluate((ctx) =>
					Boolean(ctx.block.element('test', {focused: true})));

				expect(isElFounded).toBeTrue();
			});

			it('finding an unreachable element', async () => {
				const
					isElFounded = await dummyComponent.evaluate((ctx) => Boolean(ctx.block.element('unreachable')));

				expect(isElFounded).toBeFalse();
			});

			it('finding an element with an unreachable modifier', async () => {
				const isElFounded = await dummyComponent.evaluate((ctx) =>
					Boolean(ctx.block.element('test', {unreachableMod: true})));

				expect(isElFounded).toBeFalse();
			});

			it('providing the context to search', async () => {
				const
					isElFounded = await dummyComponent.evaluate((ctx) => Boolean(ctx.block.element(ctx.$el, 'test')));

				expect(isElFounded).toBeTrue();
			});
		});

		describe('`elements`', () => {
			beforeEach(async () => {
				await dummyComponent.evaluate((ctx) => {
					const
						dummyElSelector = document.createElement('div'),
						dummyElModSelector = document.createElement('div');

					dummyElSelector.classList.add('b-dummy__test', ctx.componentId);
					dummyElModSelector.classList.add('b-dummy__test', 'b-dummy__test_focused_true', ctx.componentId);

					ctx.$el.append(dummyElSelector, dummyElModSelector);
				});
			});

			it('simple usage', async () => {
				const
					isElsFounded = await dummyComponent.evaluate((ctx) => Boolean(ctx.block.elements('test').length));

				expect(isElsFounded).toBeTrue();
			});

			it('providing additional modifiers to search', async () => {
				const isElsFounded = await dummyComponent.evaluate((ctx) =>
					Boolean(ctx.block.elements('test', {focused: true}).length));

				expect(isElsFounded).toBeTrue();
			});

			it('finding unreachable elements', async () => {
				const
					isElsFounded = await dummyComponent.evaluate((ctx) => Boolean(ctx.block.elements('unreachable').length));

				expect(isElsFounded).toBeFalse();
			});
		});

		describe('`setMod`', () => {
			it('sets a class name to the element', async () => {
				await dummyComponent.evaluate((ctx) => ctx.setMod('focused', true));

				const
					hasClass = await dummyComponent.evaluate((ctx) => ctx.$el.classList.contains('b-dummy_focused_true'));

				expect(hasClass).toBeTrue();
			});

			it('emits events', async () => {
				const blockModSetEventPr = dummyComponent.evaluate((ctx) =>
					ctx.localEmitter.promisifyOnce('block.mod.set.focused.true'));

				await dummyComponent.evaluate((ctx) => ctx.setMod('focused', true));

				await expectAsync(blockModSetEventPr).toBeResolved();
			});

			it('stores a modifier to the component state', async () => {
				await dummyComponent.evaluate((ctx) => ctx.setMod('focused', true));

				const
					storedModVal = await dummyComponent.evaluate((ctx) => ctx.mods.focused);

				expect(storedModVal).toBe('true');
			});
		});

		describe('`removeMod`', () => {
			beforeEach(async () => {
				await dummyComponent.evaluate((ctx) => ctx.setMod('focused', true));
			});

			it('removes a class name from the element', async () => {
				await dummyComponent.evaluate((ctx) => ctx.removeMod('focused'));

				const
					hasClass = await dummyComponent.evaluate((ctx) => ctx.$el.classList.contains('b-dummy_focused_true'));

				expect(hasClass).toBeFalse();
			});

			it('emits events', async () => {
				const blockModRemoveEventPr = dummyComponent.evaluate((ctx) =>
					ctx.localEmitter.promisifyOnce('block.mod.remove.focused.true'));

				await dummyComponent.evaluate((ctx) => ctx.removeMod('focused', true));

				await expectAsync(blockModRemoveEventPr).toBeResolved();
			});

			it('removes a modifier from the component state', async () => {
				await dummyComponent.evaluate((ctx) => ctx.removeMod('focused', true));

				const
					storedModVal = await dummyComponent.evaluate((ctx) => ctx.mods.focused);

				expect(storedModVal).toBeUndefined();
			});
		});

		describe('`getMod`', () => {
			it('gets a modifier from the component state', async () => {
				await dummyComponent.evaluate((ctx) => ctx.setMod('focused', true));

				const
					modVal = await dummyComponent.evaluate((ctx) => ctx.block.getMod('focused', false));

				expect(modVal).toBe('true');
			});

			it('returns `undefined` if the modifier is not settled', async () => {
				const
					modVal = await dummyComponent.evaluate((ctx) => ctx.block.getMod('focused', false));

				expect(modVal).toBeUndefined();
			});
		});

		describe('`setElMod`', () => {
			beforeEach(async () => {
				await dummyComponent.evaluate((ctx) => {
					const
						dummyElSelector = document.createElement('div');

					dummyElSelector.classList.add('b-dummy__test', ctx.componentId);

					ctx.$el.append(dummyElSelector);

					globalThis._testEl = dummyElSelector;
				});
			});

			it('sets a class name to the element', async () => {
				await dummyComponent.evaluate((ctx) =>
					ctx.block.setElMod(globalThis._testEl, 'test', 'focused', 'true'));

				const hasClass = await page.evaluate(() =>
					globalThis._testEl.classList.contains('b-dummy__test_focused_true'));

				expect(hasClass).toBeTrue();
			});

			it('emits an event', async () => {
				const elModSetEvent = dummyComponent.evaluate((ctx) =>
					ctx.localEmitter.promisifyOnce('el.mod.set.test.focused.true'));

				await dummyComponent.evaluate((ctx) =>
					ctx.block.setElMod(globalThis._testEl, 'test', 'focused', 'true'));

				await expectAsync(elModSetEvent).toBeResolved();
			});
		});

		describe('`removeElMod`', () => {
			beforeEach(async () => {
				await dummyComponent.evaluate((ctx) => {
					const
						dummyElSelector = document.createElement('div');

					dummyElSelector.classList.add('b-dummy__test', ctx.componentId);

					ctx.$el.append(dummyElSelector);
					globalThis._testEl = dummyElSelector;
				});

				await dummyComponent.evaluate((ctx) =>
					ctx.block.setElMod(globalThis._testEl, 'test', 'focused', 'true'));
			});

			it('removed a class name from the element', async () => {
				await dummyComponent.evaluate((ctx) =>
					ctx.block.removeElMod(globalThis._testEl, 'test', 'focused'));

				const hasClass = await page.evaluate(() =>
					globalThis._testEl.classList.contains('b-dummy__test_focused_true'));

				expect(hasClass).toBeFalse();
			});

			it('emits an event', async () => {
				const elModSetEvent = dummyComponent.evaluate((ctx) =>
					ctx.localEmitter.promisifyOnce('el.mod.remove.test.focused.true'));

				await dummyComponent.evaluate((ctx) =>
					ctx.block.removeElMod(globalThis._testEl, 'test', 'focused'));

				await expectAsync(elModSetEvent).toBeResolved();
			});
		});

		describe('`getElMod`', () => {
			beforeEach(async () => {
				await dummyComponent.evaluate((ctx) => {
					const
						dummyElSelector = document.createElement('div');

					dummyElSelector.classList.add('b-dummy__test', ctx.componentId);

					ctx.$el.append(dummyElSelector);
					globalThis._testEl = dummyElSelector;
				});

			});

			it('gets a modifier value', async () => {
				await dummyComponent.evaluate((ctx) =>
					ctx.block.setElMod(globalThis._testEl, 'test', 'focused', 'true'));

				const modVal = await dummyComponent.evaluate((ctx) =>
					ctx.block.getElMod(globalThis._testEl, 'test', 'focused'));

				expect(modVal).toBe('true');
			});

			it('returns `undefined` if the modifier was not settled', async () => {
				const modVal = await dummyComponent.evaluate((ctx) =>
					ctx.block.getElMod(globalThis._testEl, 'test', 'focused'));

				expect(modVal).toBeUndefined();
			});
		});
	});
};
