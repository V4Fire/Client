/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { Locator, Page } from 'playwright';

import type { Watcher, WatchHandler, WatchOptions } from 'core/dom/intersection-watcher';

import { Component, Scroll } from 'tests/helpers';

import { TEST_DIV_MARGIN_TOP_PX } from 'components/directives/in-view/test/const';

/**
 * A handler to pass to v-in-view
 * @param watcher - The parameter of the watch handler
 */
function handler(watcher: Watcher): void {
	const div = watcher.target;

	const previousValue = parseInt(
		div.getAttribute('data-test-in-view') ?? '0',
		10
	);

	const nextValue = previousValue + 1;
	watcher.target.setAttribute('data-test-in-view', nextValue.toString());
}

/**
 * Returns the value of the watcher call counter stored in given locator.
 * @param locator - The source locator
 */
export async function getWatcherCallsCount(locator: Locator): Promise<number | null> {
	const storedValue = await locator.getAttribute('data-test-in-view');
	if (storedValue == null) {
		return null;

	}

	return parseInt(JSON.parse(storedValue), 10);
}

/**
 * Force adds test handler (which counts calls) to given watch,
 * or replaces given one if a function/undefined is provided.
 *
 * @param watch - A watch parameter to update
 */
function addTestHandlerToWatch(
	watch: CanUndef<WatchHandler | Partial<WatchOptions>>
): WatchHandler | WatchOptions & { handler: WatchHandler } {
	if (Object.isUndef(watch) || Object.isFunction(watch)) {
		return handler;

	}

	return {...watch, handler};
}

/**
 * Creates a <div> element with v-in-view set to inViewValue.
 *
 * @param page - The target page.
 * @param inViewValue - The value of v-in-view directive.
 */
export async function createDivForInViewTest(
	page: Page, inViewValue: CanUndef<CanArray<WatchHandler | Partial<WatchOptions>>>
): Promise<Locator> {
	await Component.createComponent(page, 'div', {
		'v-in-view': Object.isArray(inViewValue) ?
			inViewValue.map(addTestHandlerToWatch) :
			addTestHandlerToWatch(inViewValue),
		'data-testid': 'div',
		style: `margin-top: ${TEST_DIV_MARGIN_TOP_PX}px; width: 20px; height: 20px`
	});

	return page.getByTestId('div');
}

/**
 * Initializes the viewport by making test <div> be not in it when the test is started.
 * @param page - The target page.
 */
export async function initViewport(page: Page): Promise<void> {
	await page.setViewportSize({width: 500, height: TEST_DIV_MARGIN_TOP_PX / 2});
	await page.waitForFunction(
		(targetHeight) => globalThis.innerHeight < targetHeight,
		TEST_DIV_MARGIN_TOP_PX
	);
}

/**
 * Makes element pointed by locator enter the viewport.
 *
 * @param locator - The target locator
 * @see https://playwright.dev/docs/api/class-locator#locator-click
 */
export async function makeEnterViewport(locator: Locator): Promise<void> {
	await locator.click();
}

/**
 * Restores viewport set in initViewport().
 * @param page - The target page
 */
export async function restoreViewport(page: Page): Promise<void> {
	await Scroll.scrollToTop(page);
}
