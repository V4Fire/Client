/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { Page, ElementHandle, JSHandle } from 'playwright';

import test from 'tests/config/unit/test';
import { BOM } from 'tests/helpers';

/**
 * Creates a div element, applies styles to it and appends it into the parent element
 * or into the body element if the parent is not passed.
 * The function returns a Promise that resolves to the ElementHandle container.
 *
 * @param page
 * @param styles
 * @param parent
 */
export async function createElement(
	page: Page,
	styles: Partial<CSSStyleDeclaration> = {},
	parent?: ElementHandle<HTMLElement>
): Promise<ElementHandle<HTMLDivElement>> {
	return page.evaluateHandle(({styles, parent}) => {
		const element = document.createElement('div');

		(parent ?? document.body).append(element);

		Object.assign(element.style, styles);

		return element;
	}, {styles, parent});
}

/**
 * Assertion helper for the wasInvoked boolean flag.
 * The function returns a Promise.
 *
 * @param wasInvoked
 * @param assertion
 */
export async function assertWasInvokedIs(
	wasInvoked: JSHandle<{flag: boolean}>,
	assertion: boolean
): Promise<void> {
	test.expect(await wasInvoked.evaluate(({flag}) => flag)).toBe(assertion);
}

/**
 * Scrolls the element or the page if the element is not passed
 * by the provided top/left values with the optional delay.
 * The function returns a Promise.
 *
 * @param page
 * @param opts
 * @param element
 */
export async function scrollBy(
	page: Page,
	{
		top = 0,
		left = 0,
		delay = 0
	}: {
		top?: number;
		left?: number;
		delay?: number;
	},
	element?: ElementHandle<HTMLElement>
): Promise<void> {
	await page.evaluate(({element, top, left}) => {
		(element ?? globalThis).scrollBy({top, left});
	}, {element, top, left});

	await BOM.waitForRAF(page, {sleepAfterRAF: delay});
}
