/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { Locator, Page } from 'playwright';

import type { Watcher, WatchHandler, WatchOptions } from 'core/dom/intersection-watcher';

import test from 'tests/config/unit/test';
import { Component } from 'tests/helpers';

import {

	initViewport,
	makeEnterViewport,
	restoreViewport,
	TEST_DIV_MARGIN_TOP_PX

} from 'components/directives/in-view/test/helpers';

test.describe('components/directives/in-view', () => {
	test.beforeEach(async ({demoPage, page}) => {
		await demoPage.goto();
		await initViewport(page);
	});

	test('the handler should be called when the element enters the viewport', async ({page}) => {
		const divLocator = await createDivForInViewTest(page, undefined);
		await makeEnterViewport(divLocator);
		await test.expect(getWatcherCallsCount(divLocator)).toBeResolvedTo(1);
	});

	test('the handler should be called only once if `once` is set', async ({page}) => {
		const divLocator = await createDivForInViewTest(page, {once: true});
		await makeEnterViewport(divLocator);
		await restoreViewport(page);
		await makeEnterViewport(divLocator);
		await test.expect(getWatcherCallsCount(divLocator)).toBeResolvedTo(1);
	});

	test('all provided handlers should be called when the element enters the viewport', async ({page}) => {
		const divLocator = await createDivForInViewTest(page, [{once: true}, {once: true}]);
		await makeEnterViewport(divLocator);
		await test.expect(getWatcherCallsCount(divLocator)).toBeResolvedTo(2);
	});

	/**
	 * A handler to pass to v-in-view
	 * @param watcher - the parameter of the watch handler
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
	 * Returns the value of the watcher call counter stored in given `locator`
	 * @param locator - the source locator
	 */
	async function getWatcherCallsCount(locator: Locator): Promise<number | null> {
		const storedValue = await locator.getAttribute('data-test-in-view');

		if (storedValue == null) {
			return null;

		}

		return parseInt(storedValue, 10);
	}

	/**
	 * Adds test handler (which counts calls) to given `watch`,
	 * or replaces given one if a function/undefined is provided
	 *
	 * @param watch - a watch parameter to update
	 */
	function addTestHandlerToWatch(
		watch: CanUndef<WatchHandler | Partial<WatchOptions>>
	): WatchHandler | WatchOptions & {handler: WatchHandler} {

		if (Object.isUndef(watch) || Object.isFunction(watch)) {
			return handler;

		}

		return {...watch, handler};
	}

	/**
	 * Creates a `<div>` element with v-in-view set to `inViewValue`
	 *
	 * @param page - the target page
	 * @param inViewValue - the value of v-in-view directive
	 */
	async function createDivForInViewTest(
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

});
