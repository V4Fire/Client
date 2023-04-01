/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { Page, JSHandle } from 'playwright';

import type bWindow from 'components/base/b-window/b-window';
import { renderWindow as baseRenderWindow } from 'components/base/b-window/test/helpers';

import test from 'tests/config/unit/test';

test.describe('<b-window> slots', () => {
	test.beforeEach(async ({demoPage}) => {
		await demoPage.goto();
	});

	test.describe('provide', () => {

		test('`default` slot', async ({page}) => {
			const target = await renderWindow(page, {
				children: {
					default: {
						type: 'div',
						children: {
							default: 'Hello content'
						}
					}
				}
			});

			test.expect(await target.evaluate(evaluateElementInnerHTML, 'window'))
				.toBe('<div>Hello content</div>');
		});

		test('`title` slot', async ({page}) => {
			const target = await renderWindow(page, {
				children: {
					title: 'return ({title}) => title + "Foo"'
				}
			});

			test.expect(await target.evaluate(evaluateElementInnerHTML, 'title'))
				.toBe('BlaFoo');
		});

		test('`body` slot', async ({page}) => {
			const target = await renderWindow(page, {
				children: {
					body: {
						type: 'div',
						children: {
							default: 'Hello body'
						}
					}
				}
			});

			test.expect(await target.evaluate(evaluateElementInnerHTML, 'title'))
				.toBe('Bla');

			test.expect(await target.evaluate(evaluateElementInnerHTML, 'body'))
				.toBe('<div>Hello body</div>');
		});

		test('`controls` slot', async ({page}) => {
			const target = await renderWindow(page, {
				children: {
					controls: {
						type: 'button',
						children: {
							default: 'Close'
						}
					}
				}
			});

			test.expect(await target.evaluate(evaluateElementInnerHTML, 'title'))
				.toBe('Bla');

			test.expect(await target.evaluate(evaluateElementInnerHTML, 'controls'))
				.toBe('<button>Close</button>');
		});

		test('`third-party` slots', async ({page}) => {
			const
				target = await renderWindow(page, {attrs: {slotName: 'windowSlotTestDummy'}});

			test.expect(await target.evaluate(evaluateElementInnerHTML, 'window'))
				.toBe('<div class="b-window__bla">Hello world!</div>');
		});

		/**
 		 * Generates functions in the children params when needed
		 * and renders `bWindow` component in the test page
		 * @param page
		 * @param params
		 */
		async function renderWindow(
			page: Page, params: RenderComponentsVnodeParams = {}
		): Promise<JSHandle<bWindow>> {
			Object.forEach<VNodeChild, string>(params.children, (el, key) => {
				if (params.children && Object.isString(el) && el.startsWith('return ')) {
					// eslint-disable-next-line no-new-func
					params.children[key] = Function(el)();
				}
			});

			return baseRenderWindow(page, params);
		}

		/**
		 * Returns innerHTML of the specified BEM element
		 * @param ctx `bWindow` component
		 * @param elementName
		 */
		function evaluateElementInnerHTML(ctx: bWindow, elementName: string): string | undefined {
			return ctx.unsafe.block?.element(elementName)?.innerHTML;
		}
	});
});
