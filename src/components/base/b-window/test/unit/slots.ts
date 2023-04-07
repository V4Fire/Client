/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */
import type { JSHandle, Page } from 'playwright';

import type bWindow from 'components/base/b-window/b-window';
import { renderWindow } from 'components/base/b-window/test/helpers';

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

			test.expect(await getElementInnerHTML(page, target, 'window'))
				.toBe('<div>Hello content</div>');
		});

		test('`title` slot', async ({page}) => {
			const target = await renderWindow(page, {
				children: {
					title: ({title}) => `${title}Foo`
				}
			});

			test.expect(await getElementInnerHTML(page, target, 'title'))
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

			test.expect(await getElementInnerHTML(page, target, 'title'))
				.toBe('Bla');

			test.expect(await getElementInnerHTML(page, target, 'body'))
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

			test.expect(await getElementInnerHTML(page, target, 'title'))
				.toBe('Bla');

			test.expect(await getElementInnerHTML(page, target, 'controls'))
				.toBe('<button>Close</button>');
		});

		test('`third-party` slots', async ({page}) => {
			const
				target = await renderWindow(page, {attrs: {slotName: 'windowSlotTestDummy'}});

			test.expect(await getElementInnerHTML(page, target, 'window'))
				.toBe('<div class="b-window__bla">Hello world!</div>');
		});

		/**
		 * Returns innerHTML of the specified BEM element
		 *
		 * @param ctx `bWindow` component
		 * @param elementName
		 */
		async function getElementInnerHTML(
			page: Page,
			target: JSHandle<bWindow>,
			elementName: string
		): Promise<string | undefined> {
			const selector = await target
				.evaluate((ctx, elementName) => ctx.unsafe.block!.getElementSelector(elementName), elementName);

			return page.locator(selector).innerHTML();
		}
	});
});
