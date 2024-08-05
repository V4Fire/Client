/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { ElementHandle, JSHandle, Locator, Page } from 'playwright';

import { Component } from 'tests/helpers';

import type { Watcher } from 'components/directives/on-resize';

import type iBlock from 'components/super/i-block/i-block';

/**
 * Renders a component by the specified name with the passed parameters using the `v-attrs` directive
 *
 * @param page
 * @param componentName - the name of the component to be rendered
 * @param attrs - attributes to be passed to the component
 */
export async function renderComponentWithVAttrs<C extends iBlock>(
	page: Page,
	componentName: string,
	attrs: Dictionary
): Promise<JSHandle<C>> {
	return Component.createComponent(page, componentName, {
		'data-testid': 'target',
		'data-counter': 0,
		'v-attrs': {...attrs},
		style: 'width: 100px; height: 100px'
	});
}

/**
 * Renders an element with the passed parameters using the `v-attrs` directive
 *
 * @param page
 * @param attrs - attributes to be passed to the element
 * @param [functional] - if set to true, a functional component will be used to render the element
 */
export async function renderElementWithVAttrs(
	page: Page,
	attrs: Dictionary,
	functional: boolean = false
): Promise<Locator> {
	await renderComponentWithVAttrs(page, `b-dummy${functional ? '-functional' : ''}`, attrs);
	return page.getByTestId('target');
}

/**
 * Waits for a specific attribute value on the specified element to match the expected count
 *
 * @param page
 * @param observedElem
 * @param expected
 */
export async function waitForWatcherCallsCount(page: Page, observedElem: Locator, expected: number): Promise<void> {
	const handle = await observedElem.elementHandle();

	await page
		.waitForFunction(
			([div, val]) => Boolean(
				div.getAttribute('data-counter') === val.toString(10)
			),

			<[ElementHandle<HTMLElement>, number]>[handle, expected]
		);
}

/**
 * Handles resize events on an element by incrementing a 'data-counter' attribute
 *
 * @param newRect
 * @param oldRect
 * @param watcher
 */
export function resizeHandler(newRect: DOMRect, oldRect: DOMRect, watcher: Watcher): void {
	const {target} = watcher;

	const previousValue = parseInt(
		target.getAttribute('data-counter') ?? '0',
		10
	);

	const nextValue = previousValue + 1;
	target.setAttribute('data-counter', nextValue.toString());
}

/**
 * Handles click events on an element by incrementing a 'data-counter' attribute
 * @param event
 */
export function clickHandler(event: MouseEvent): void {
	const target = <Element>event.target;

	const previousValue = parseInt(
		target.getAttribute('data-counter') ?? '0',
		10
	);

	const nextValue = previousValue + 1;
	target.setAttribute('data-counter', nextValue.toString());
}
