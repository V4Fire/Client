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
module.exports = (page, params) => {
	const initialUrl = page.url();

	let
		dummyNode,
		dummyComponent;

	describe('i-block/dom', () => {
		beforeEach(async () => {
			page = await params.context.newPage();
			await page.goto(initialUrl);

			dummyNode = await page.waitForSelector('.b-dummy', {state: 'attached'});
			dummyComponent = await h.component.waitForComponent(page, '.b-dummy');

			await page.evaluate(() => {
				const
					el = document.createElement('div');

				el.id = 'newNode';
				Object.assign(el.style, {height: '20px', width: '20px'});

				globalThis._testEl = el;
			});
		});

		// afterEach(() => page.close());

		describe('getId', () => {
			it('null | undefined', async () => {
				const
					result = await dummyComponent.evaluate((ctx) => [ctx.dom.getId(undefined), ctx.dom.getId(null)]);

				expect(result).toEqual([undefined, undefined]);
			});

			it('someString', async () => {
				const
					idAndResult = await dummyComponent.evaluate((ctx) => [ctx.componentId, ctx.dom.getId('someString')]);

				expect(`${idAndResult[1]}`).toEqual(`${idAndResult[0]}-someString`);
			});
		});

		describe('delegate', () => {
			// ...
		});

		describe('delegateElement', () => {
			// ...
		});

		describe('putInStream', () => {
			it('puts a newNode into the document', async () => {
				const isConnected = await dummyComponent.evaluate((ctx) => new Promise((res) =>
					ctx.dom.putInStream((el) => res(el.isConnected), globalThis._testEl)));

				expect(isConnected).toBeTrue();
			});
		});

		describe('appendChild', () => {
			it('appends newNode to the parentNode', async () => {
				await dummyComponent.evaluate((ctx) => {
					ctx.dom.appendChild(ctx.$el, globalThis._testEl);
				});

				const
					isIn = await dummyComponent.evaluate((ctx) => globalThis._testEl.parentNode === ctx.$el);

				expect(isIn).toBeTrue();
			});

			it('removes newNode from the parentNode on async clear', async () => {
				await dummyComponent.evaluate((ctx) => {
					ctx.dom.appendChild(ctx.$el, globalThis._testEl, '_test-group');
				});

				await dummyComponent.evaluate((ctx) => ctx.async.clearAll({group: '_test-group'}));

				const
					isConnected = await page.evaluate(() => globalThis._testEl.isConnected);

				expect(isConnected).toBeFalse();
			});

			it('destroys newNode component on async clear', async () => {
				await dummyComponent.evaluate((ctx) => {
					// ...
				});
			});
		});

		describe('replaceWith', () => {
			it('replaces oldNode with newNode', async () => {
				// ...
			});

			it('removes newNode on async clear', async () => {
				// ...
			});

			it('destroys newNode component on async clear', async () => {
				// ...
			});
		});

		describe('getComponent', () => {
			it('.b-dummy', async () => {
				// ...
			});

			it('dummyComponent', async () => {
				// ...
			});

			it('nestedNodeInDummyComponent', async () => {
				// ...
			});

			it('unreachable component', async () => {
				// ...
			});
		});

		describe('createBlockCtxFromNode', () => {
			it('creates a new block instance', async () => {
				// ...
			});
		});

		describe('watchForIntersection', () => {
			// ...
		});

		describe('watchForResize', () => {
			// ...
		});
	});
};
