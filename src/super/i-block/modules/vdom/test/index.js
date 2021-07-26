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
		context;

	describe('`iBlock.vdom`', () => {
		beforeEach(async () => {
			context = await browser.newContext(contextOpts);

			page = await context.newPage();
			page.goto(initialUrl);

			dummyComponent = await h.component.waitForComponent(page, '.b-dummy');
		});

		afterEach(() => context.close());

		describe('`getSlot`', () => {
			it('returns `slot` if the slot exists', async () => {
				const
					slot = await dummyComponent.evaluateHandle((ctx) => ctx.getSlot('default'));

				expect(slot).toBeTruthy();
			});

			it('returns `undefined` if the does not exists', async () => {
				const
					slot = await dummyComponent.evaluateHandle((ctx) => ctx.getSlot('unreachableSlot'));

				expect(slot).toBeUndefined();
			});
		});

		describe('`closest`', () => {
			describe('component name provided', () => {
				// ...
			});

			describe('component constructor provided', () => {
				// ...
			});
		});

		describe('`findElFromVNode`', () => {
			// ...
		});

		describe('`render`', () => {
			// ...
		});

		describe('`getRenderObject`', () => {
			// ...
		});

		describe('`bindRenderObject`', () => {
			// ...
		});

		describe('`execRenderObject`', () => {
			// ...
		});
	});
};
