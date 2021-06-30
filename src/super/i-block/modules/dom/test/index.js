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
		dummyComponent;

	describe('i-block/dom', () => {
		beforeEach(async () => {
			page = await params.context.newPage();
			await page.goto(initialUrl);

			dummyComponent = await h.component.waitForComponent(page, '.b-dummy');

			await page.evaluate(() => {
				const
					el = document.createElement('div');

				el.id = 'newNode';
				Object.assign(el.style, {height: '20px', width: '20px'});

				globalThis._testEl = el;
			});
		});

		afterEach(() => page.close());

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
			it('fires a callback inside of #foo', async () => {
				await dummyComponent.evaluate((ctx) => {
					const fooEl = document.createElement('div');
					fooEl.id = 'foo';

					fooEl.appendChild(globalThis._testEl);
					ctx.$el.appendChild(fooEl);

					globalThis._testEl.addEventListener('click', ctx.dom.delegate('#foo', () => globalThis._t = 1));
				});

				await page.click('#newNode');

				const
					testVal = await page.evaluate(() => globalThis._t);

				expect(testVal).toBe(1);
			});

			it('does not fires a callback outside of #foo', async () => {
				await dummyComponent.evaluate((ctx) => {
					const fooEl = document.createElement('div');
					fooEl.id = 'foo';

					ctx.$el.appendChild(fooEl);
					ctx.$el.parentNode.prepend(globalThis._testEl);

					globalThis._testEl.addEventListener('click', ctx.dom.delegate('#foo', () => globalThis._t = 1));
				});

				await page.click('#newNode');
				await h.bom.waitForIdleCallback(page);

				const
					testVal = await page.evaluate(() => globalThis._t);

				expect(testVal).toBeUndefined();
			});
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
					const scheme = [
						{
							attrs: {
								id: 'button-test'
							},

							content: {
								default: () => 'Hello there general kenobi'
							}
						}
					];

					globalThis.renderComponents('b-button', scheme);
					globalThis._testEl = document.getElementById('button-test');

					ctx.dom.appendChild(ctx.$el, globalThis._testEl, {group: '_test-group', destroyIfComponent: true});
				});

				await dummyComponent.evaluate((ctx) => ctx.async.clearAll({group: '_test-group'}));

				const [isConnected, hook] = await page.evaluate(() => [
					globalThis._testEl.isConnected,
					globalThis._testEl.component.hook
				]);

				expect(isConnected).toBeFalse();
				expect(hook).toBe('destroyed');
			});
		});

		describe('replaceWith', () => {
			beforeEach(async () => {
				await dummyComponent.evaluate((ctx) => {
					globalThis._testEl2 = document.createElement('div');
					ctx.$el.appendChild(globalThis._testEl2);
				});
			});

			it('replaces oldNode with newNode', async () => {
				await dummyComponent.evaluate((ctx) => {
					ctx.dom.replaceWith(globalThis._testEl2, globalThis._testEl);
				});

				const [aIsConnected, bIsConnected] = await page.evaluate(() => [
					globalThis._testEl2.isConnected,
					globalThis._testEl.isConnected
				]);

				expect(aIsConnected).toBeFalse();
				expect(bIsConnected).toBeTrue();
			});

			it('removes newNode on async clear', async () => {
				await dummyComponent.evaluate((ctx) => {
					ctx.dom.replaceWith(globalThis._testEl2, globalThis._testEl, '_test-group');
				});

				await dummyComponent.evaluate((ctx) => ctx.async.clearAll({group: '_test-group'}));

				const
					isConnected = await page.evaluate(() => globalThis._testEl.isConnected);

				expect(isConnected).toBeFalse();
			});

			it('destroys newNode component on async clear', async () => {
				await dummyComponent.evaluate((ctx) => {
					const scheme = [
						{
							attrs: {
								id: 'button-test'
							},

							content: {
								default: () => 'Hello there general kenobi'
							}
						}
					];

					globalThis.renderComponents('b-button', scheme);
					globalThis._testEl = document.getElementById('button-test');

					ctx.dom.replaceWith(globalThis._testEl2, globalThis._testEl, {group: '_test-group', destroyIfComponent: true});
				});

				await dummyComponent.evaluate((ctx) => ctx.async.clearAll({group: '_test-group'}));

				const [isConnected, hook] = await page.evaluate(() => [
					globalThis._testEl.isConnected,
					globalThis._testEl.component.hook
				]);

				expect(isConnected).toBeFalse();
				expect(hook).toBe('destroyed');
			});
		});

		describe('getComponent', () => {
			let targetComponentId;

			beforeEach(async () => {
				targetComponentId = await dummyComponent.evaluate((ctx) => ctx.componentId);
			});

			it('.b-dummy', async () => {
				const
					foundedId = await dummyComponent.evaluate((ctx) => ctx.dom.getComponent('.b-dummy').componentId);

				expect(foundedId).toBe(targetComponentId);
			});

			it('dummyComponent', async () => {
				const
					foundedId = await dummyComponent.evaluate((ctx) => ctx.dom.getComponent(ctx.$el).componentId);

				expect(foundedId).toBe(targetComponentId);
			});

			it('nestedNodeInDummyComponent', async () => {
				const foundedId = await dummyComponent.evaluate((ctx) => {
					ctx.$el.appendChild(globalThis._testEl);
					return ctx.dom.getComponent(globalThis._testEl).componentId;
				});

				expect(foundedId).toBe(targetComponentId);
			});

			it('unreachable component', async () => {
				const
					foundedId = await dummyComponent.evaluate((ctx) => ctx.dom.getComponent('.unreachable-selector'));

				expect(foundedId).toBeUndefined();
			});
		});

		describe('createBlockCtxFromNode', () => {
			it('node without component', async () => {
				const [hasMethods, hasCorrectComponentName, hasContext] = await dummyComponent.evaluate((ctx) => {
					const
						cName = 'b-test-component';

					ctx.$el.parentNode.appendChild(globalThis._testEl);
					globalThis._testEl.classList.add(cName);

					const bl = ctx.dom.createBlockCtxFromNode(globalThis._testEl);

					return [
						Object.isFunction(bl.getFullBlockName),
						bl.componentName === cName,
						ctx != null,
						bl.getFullElName('test') === 'b-test-component__test'
					];
				});

				expect([hasMethods, hasCorrectComponentName, hasContext]).toEqual([true, true, true]);
			});

			it('node with component', async () => {
				const [
					hasMethods,
					hasCorrectComponentName,
					hasContext,
					buildsCorrectElName
				] = await dummyComponent.evaluate((ctx) => {
					const bl = ctx.dom.createBlockCtxFromNode(ctx.$el);

					return [
						Object.isFunction(bl.getFullBlockName),
						bl.componentName === ctx.componentName,
						ctx != null,
						bl.getFullElName('test') === 'b-dummy__test'
					];
				});

				expect([hasMethods, hasCorrectComponentName, hasContext, buildsCorrectElName])
					.toEqual([true, true, true, true]);
			});
		});

		describe('watchForIntersection', () => {
			beforeEach(async () => {
				await dummyComponent.evaluate((ctx) => {
					ctx.$el.appendChild(globalThis._testEl);

					return ctx.dom.watchForIntersection(globalThis._testEl, {
						callback: () => globalThis._t = 1,
						threshold: 0.1,
						delay: 300
					}, {group: '_test-group'});
				});
			});

			it('starts watch for intersection', async () => {
				await expectAsync(page.waitForFunction(() => globalThis._t === 1)).toBeResolved();
			});

			it('clears on async clear', async () => {
				await dummyComponent.evaluate((ctx) => ctx.async.clearAll({group: '_test-group'}));
				await h.bom.waitForIdleCallback(page, {sleepAfterIdles: 600});

				const
					testVal = await page.evaluate(() => globalThis._t);

				expect(testVal).toBeUndefined();
			});
		});

		describe('watchForResize', () => {
			beforeEach(async () => {
				await dummyComponent.evaluate((ctx) => {
					ctx.$el.appendChild(globalThis._testEl);

					return ctx.dom.watchForResize(globalThis._testEl, {
						callback: () => globalThis._t = 1,
						initial: false
					}, {group: '_test-group'});
				});
			});

			it('starts watch for resizes', async () => {
				await page.evaluate(() => globalThis._testEl.style.width = '400px');
				await expectAsync(page.waitForFunction(() => globalThis._t === 1)).toBeResolved();
			});

			it('clears on async clear', async () => {
				await dummyComponent.evaluate((ctx) => ctx.async.clearAll({group: '_test-group'}));

				await page.evaluate(() => globalThis._testEl.style.width = '400px');
				await h.bom.waitForIdleCallback(page, {sleepAfterIdles: 300});

				const
					testVal = await page.evaluate(() => globalThis._t);

				expect(testVal).toBeUndefined();
			});
		});
	});
};
