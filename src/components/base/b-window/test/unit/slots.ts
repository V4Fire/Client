/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { Page, JSHandle } from 'playwright';

import type bWindow from 'components/base/b-window/b-window';

import test from 'tests/config/unit/test';
import Component from 'tests/helpers/component';

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

		async function renderWindow(
			page: Page, {attrs, children}: RenderComponentsVnodeParams = {}
		): Promise<JSHandle<bWindow>> {
			Object.forEach<VNodeChild, string>(children, (el, key) => {
				if (children && Object.isString(el) && el.startsWith('return ')) {
					// eslint-disable-next-line no-new-func
					children[key] = Function(el)();
				}
			});

			// NOTE: using intermediate variable to fix the ts(2589) error
			const bWindow = Component.createComponent(page, 'b-window', {
				attrs: {
					id: 'target',
					title: 'Bla',
					...attrs
				},
				children
			});
			return Object.cast(bWindow);
		}

		function evaluateElementInnerHTML(ctx: bWindow, elementName: string): string | undefined {
			return ctx.unsafe.block?.element(elementName)?.innerHTML;
		}
	});
});
