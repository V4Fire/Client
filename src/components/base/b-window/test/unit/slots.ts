/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { Page } from 'playwright';

import test from 'tests/config/unit/test';
import DOM from 'tests/helpers/dom';

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
			.toBeResolvedTo('<div>Hello content</div>');
	});

	test('`title` slot should be rendered as `window` heading', async ({page}) => {
		await renderWindow(page, {
			children: {
				title: ({title}) => `${title}Foo`
			}
		});

		await test.expect(getElementInnerHTML(page, 'title'))
			.toBeResolvedTo('BlaFoo');
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
			.toBeResolvedTo('Bla');

		await test.expect(getElementInnerHTML(page, 'body'))
			.toBeResolvedTo('<div>Hello body</div>');
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
			.toBeResolvedTo('Bla');

		await test.expect(getElementInnerHTML(page, 'controls'))
			.toBeResolvedTo('<button>Close</button>');
	});

	test('`third-party` slots should be rendered', async ({page}) => {
		await renderWindow(page, {attrs: {slotName: 'windowSlotTestDummy'}});

		await test.expect(getElementInnerHTML(page, 'window'))
			.toBeResolvedTo('<div class="b-window__bla">Hello world!</div>');
	});

	/**
	 * Returns `innerHTML` of the specified BEM element
	 *
	 * @param page
	 * @param elName
	 */
	async function getElementInnerHTML(
		page: Page,
		elName: string
	): Promise<string | undefined> {
		return page.locator(DOM.elNameSelectorGenerator('b-window', elName)).innerHTML();
	}
});
