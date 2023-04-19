/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { Page } from 'playwright';

import test from 'tests/config/unit/test';

import { DOM } from 'tests/helpers';

import { renderWindow } from 'components/base/b-window/test/helpers';

test.describe('<b-window> slots', () => {
	test.beforeEach(async ({demoPage}) => {
		await demoPage.goto();
	});

	test('`default` slot should be rendered instead of default `window` content', async ({page}) => {
		await renderWindow(page, {
			children: {
				default: {
					type: 'div',
					children: {
						default: 'Hello content'
					}
				}
			}
		});

		await test.expect(getElementInnerHTML(page, 'window'))
			.resolves.toBe('<div>Hello content</div>');
	});

	test('`title` slot should be rendered as `window` heading', async ({page}) => {
		await renderWindow(page, {
			children: {
				title: ({title}) => `${title}Foo`
			}
		});

		await test.expect(getElementInnerHTML(page, 'title'))
			.resolves.toBe('BlaFoo');
	});

	test('`body` slot should be rendered as `window` content', async ({page}) => {
		await renderWindow(page, {
			children: {
				body: {
					type: 'div',
					children: {
						default: 'Hello body'
					}
				}
			}
		});

		await test.expect(getElementInnerHTML(page, 'title'))
			.resolves.toBe('Bla');

		await test.expect(getElementInnerHTML(page, 'body'))
			.resolves.toBe('<div>Hello body</div>');
	});

	test('`controls` slot should be rendered', async ({page}) => {
		await renderWindow(page, {
			children: {
				controls: {
					type: 'button',
					children: {
						default: 'Close'
					}
				}
			}
		});

		await test.expect(getElementInnerHTML(page, 'title'))
			.resolves.toBe('Bla');

		await test.expect(getElementInnerHTML(page, 'controls'))
			.resolves.toBe('<button>Close</button>');
	});

	test('`third-party` slots should be rendered', async ({page}) => {
		await renderWindow(page, {attrs: {slotName: 'windowSlotTestDummy'}});

		await test.expect(getElementInnerHTML(page, 'window'))
			.resolves.toBe('<div class="b-window__bla">Hello world!</div>');
	});

	/**
	 * Returns innerHTML of the specified BEM element
	 *
	 * @param page
	 * @param elementName
	 */
	async function getElementInnerHTML(
		page: Page,
		elementName: string
	): Promise<string | undefined> {
		return page.locator(DOM.elNameSelectorGenerator('b-window', elementName)).innerHTML();
	}
});
