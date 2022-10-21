// @ts-check

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const
	h = include('tests/helpers').default;

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
		buttonComponent,
		context,
		vdom,

		DUMMY_COMPONENT_ID;

	const
		BUTTON_TEXT = 'Hello ima button';

	describe('`iBlock.vdom`', () => {
		beforeEach(async () => {
			context = await browser.newContext(contextOpts);
			page = await context.newPage();

			await page.goto(initialUrl);

			await page.evaluate((BUTTON_TEXT) => {
				globalThis.renderComponents('b-dummy', [
					{
						attrs: {
							id: 'test-dummy'
						},

						content: {
							default: {
								tag: 'b-button',
								attrs: {
									id: 'test-button'
								},
								content: BUTTON_TEXT
							}
						}
					}
				]);
			}, BUTTON_TEXT);

			[dummyComponent, buttonComponent] = await Promise.all([
				h.component.waitForComponent(page, '#test-dummy'),
				h.component.waitForComponent(page, '#test-button')
			]);

			DUMMY_COMPONENT_ID = await dummyComponent.evaluate((ctx) => ctx.componentId);
			vdom = await buttonComponent.evaluateHandle((ctx) => ctx.vdom);
		});

		afterEach(() => context.close());

		describe('`getSlot`', () => {
			it('returns `slot` if the slot exists', async () => {
				const [hasSlot, slotText] = await vdom.evaluate((ctx) => [
					Boolean(ctx.getSlot('default')),
					ctx.getSlot('default')[0].text
				]);

				expect(hasSlot).toBeTrue();
				expect(slotText).toBe(BUTTON_TEXT);
			});

			it('returns `undefined` if the does not exist', async () => {
				const
					slot = await vdom.evaluate((ctx) => ctx.getSlot('unreachableSlot'));

				expect(slot).toBeUndefined();
			});
		});

		describe('`closest`', () => {
			describe('component name is provided', () => {
				it('returns the closest component instance', async () => {
					const [cName, cId] = await vdom.evaluate((ctx) => [
						ctx.closest('b-dummy').componentName,
						ctx.closest('b-dummy').componentId
					]);

					expect(cName).toBe('b-dummy');
					expect(cId).toBe(DUMMY_COMPONENT_ID);
				});

				it('returns `undefined` if there is no such a parent component', async () => {
					const
						closest = await vdom.evaluate((ctx) => ctx.closest('b-unreachable-component'));

					expect(closest).toBeUndefined();
				});
			});

			describe('component constructor is provided', () => {
				it('returns the closest component instance', async () => {
					const [cName, cId] = await vdom.evaluate((ctx) => {
						const
							// @ts-ignore
							dummyComponent = document.getElementById('test-dummy').component,
							closest = ctx.closest(dummyComponent.componentInstances.bDummy);

						return [
							closest.componentName,
							closest.componentId
						];
					});

					expect(cName).toBe('b-dummy');
					expect(cId).toBe(DUMMY_COMPONENT_ID);
				});

				it('returns `undefined` if there is no such a parent component', async () => {
					const closest = await vdom.evaluate((ctx) => {
						const
							// @ts-ignore
							dummyComponent = document.getElementById('test-dummy').component;

						return ctx.closest(dummyComponent.componentInstances.bBottomSlide);
					});

					expect(closest).toBeUndefined();
				});
			});
		});

		describe('`findElement`', () => {
			it('returns an element if it presents in the provided `VNode`', async () => {
				const hasEl = await dummyComponent.evaluate((ctx) => {
					const
						vNode = ctx.vdom.findElement(ctx._vnode, 'wrapper'),
						className = 'b-dummy__wrapper',
						{elm} = vNode;

					return vNode && vNode.data.staticClass === className && elm.classList.contains(className);
				});

				expect(hasEl).toBeTrue();
			});

			it('returns `undefined` if an element does not presents in the provided `VNode`', async () => {
				const
					hasEl = await dummyComponent.evaluate((ctx) => ctx.vdom.findElement(ctx._vnode, 'unreachableSelector'));

				expect(hasEl).toBeUndefined();
			});
		});

		describe('`render`', () => {
			it('single `VNode` is provided', async () => {
				await buttonComponent.evaluate((ctx) => {
					const newButton = ctx.vdom.render(ctx.$createElement('b-button', {
						attrs: {
							'v-attrs': {
								id: 'new-button'
							}
						}
					}));

					document.body.appendChild(newButton);
				});

				const
					newButton = await h.component.waitForComponent(page, '#new-button'),
					newButtonComponentName = await newButton.evaluate((ctx) => ctx.componentName);

				expect(newButton).toBeTruthy();
				expect(newButtonComponentName).toBe('b-button');
			});

			it('array of `VNode`-s are provided', async () => {
				await buttonComponent.evaluate((ctx) => {
					const newButtons = ctx.vdom.render([
						ctx.$createElement('b-button', {
							attrs: {
								'v-attrs': {
									id: 'new-button-1'
								}
							}
						}),

						ctx.$createElement('b-button', {
							attrs: {
								'v-attrs': {
									id: 'new-button-2'
								}
							}
						})
					]);

					document.body.append(...newButtons);
				});

				const [button1, button2] = await Promise.all([
					h.component.waitForComponent(page, '#new-button-1'),
					h.component.waitForComponent(page, '#new-button-2')
				]);

				const [button1ComponentName, button2ComponentName] = await Promise.all([
					button1.evaluate((ctx) => ctx.componentName),
					button2.evaluate((ctx) => ctx.componentName)
				]);

				expect(button1ComponentName).toBe('b-button');
				expect(button2ComponentName).toBe('b-button');
			});
		});

		describe('`getRenderObject`', () => {
			it('returns `RenderObject` if the specified template exists', async () => {
				const isRenderObj = await vdom.evaluate((ctx) => {
					const
						renderObj = ctx.getRenderObject('b-button.index');

					return Object.isFunction(renderObj.render) && 'staticRenderFns' in renderObj;
				});

				expect(isRenderObj).toBeTrue();
			});

			it('returns `undefined` if the specified template does not exist', async () => {
				const
					notRenderObj = await vdom.evaluate((ctx) => ctx.getRenderObject('b-button.unreachableTemplate'));

				expect(notRenderObj).toBeUndefined();
			});
		});

		describe('`bindRenderObject`', () => {
			it('returns a placeholder if the provided template does not exist', async () => {
				const
					isPlaceholder = await vdom.evaluate((ctx) => ctx.bindRenderObject('bUnreachable.index')().tag === 'span');

				expect(isPlaceholder).toBeTrue();
			});

			it('returns a render function if the provided template exists', async () => {
				const
					componentName = await vdom.evaluate((ctx) => ctx.bindRenderObject('bButton.index')().context.componentName);

				expect(componentName).toBe('b-button');
			});
		});

		describe('`execRenderObject`', () => {
			it('returns a `VNode` if the specified template exists', async () => {
				const
					componentName = await vdom.evaluate((ctx) => ctx.execRenderObject('bButton.index').context.componentName);

				expect(componentName).toBe('b-button');
			});

			it('returns a placeholder if the specified template does not exist', async () => {
				const
					isPlaceholder = await vdom.evaluate((ctx) => ctx.execRenderObject('bUnreachable.index').tag === 'span');

				expect(isPlaceholder).toBeTrue();
			});
		});
	});
};
