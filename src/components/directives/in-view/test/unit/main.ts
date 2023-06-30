/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { ElementHandle, Locator, Page } from 'playwright';

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
		await test.expect(waitForWatcherCallsCount(page, divLocator, 1)).toBeResolved();
	});

	test('the handler should be called only once if `once` is set', async ({page}) => {
		const divLocator = await createDivForInViewTest(page, {once: true});
		await makeEnterViewport(divLocator);
		await restoreViewport(page);
		await makeEnterViewport(divLocator);
		await test.expect(waitForWatcherCallsCount(page, divLocator, 1)).toBeResolved();
	});

	test('all provided handlers should be called when the element enters the viewport', async ({page}) => {
		const divLocator = await createDivForInViewTest(page, [{once: true}, {once: true, delay: 150}]);
		await makeEnterViewport(divLocator);
		await test.expect(waitForWatcherCallsCount(page, divLocator, 2)).toBeResolved();
	});

	test(
		'the handler should not be triggered by scroll event on element other than `root` when `onlyRoot` is true',
		async ({page}) => {
			const divLocator = await createDivForInViewTest(page, {
				onlyRoot: true,
				root: () => document.getElementById('root-component')!
			});

			await makeEnterViewport(divLocator);

			await test.expect(getWatcherCallsCount(divLocator)).toBeResolvedTo(0);

			await restoreViewport(page);

			await page.evaluate(async () => {
				const root = document.getElementById('root-component')!;

				root.style.height = '500px';
				root.style.minHeight = '0px';
				root.style.overflow = 'auto';

				root.scrollTo({top: 0, left: 0});

				await new Promise((r) => setTimeout(r, 100));

				root.scrollBy({top: 100000, left: 0});
			});

			await test.expect(waitForWatcherCallsCount(page, divLocator, 1)).toBeResolved();
		}
	);

	test('the handler should be called after provided `delay`', async ({page}) => {
		const divLocator = await createDivForInViewTest(page, {delay: 250});
		await makeEnterViewport(divLocator);

		await test.expect(getWatcherCallsCount(divLocator)).toBeResolvedTo(0);

		await test.expect(waitForWatcherCallsCount(page, divLocator, 1)).toBeResolved();
	});

	test(
		'the function passed as `onEnter` should be called when the element enters the viewport',
		async ({page}) => {
			const divLocator = await createDivForInViewTest(page, {
				onEnter: (watcher) => {
					watcher.handler(watcher);
					return true;
				},
				once: true
			});
			await makeEnterViewport(divLocator);
			// 2 calls: .onEnter(), then main handler
			await test.expect(waitForWatcherCallsCount(page, divLocator, 2)).toBeResolved();
		}
	);

	test(
		'the function passed as `onLeave` should be called when the element leaves the viewport',
		async ({page}) => {
			const divLocator = await createDivForInViewTest(page, {onLeave: handler});
			await makeEnterViewport(divLocator);

			await resetWatcherCallsCount(divLocator);
			await restoreViewport(page);

			await test.expect(waitForWatcherCallsCount(page, divLocator, 1)).toBeResolved();
		}
	);

	// https://github.com/V4Fire/Client/issues/912
	test.skip(
		'the visibility of the element should be tracked when `trackVisibility` is set',
		async ({page}) => {
			const divLocator = await createDivForInViewTest(
				page,
				{trackVisibility: true}
			);

			await makeEnterViewport(divLocator);

			await divLocator.evaluate(async (div) => {
				div.style.opacity = '0';
				await new Promise((r) => setTimeout(r, 200));
				div.style.opacity = '1';
			});

			await test.expect(waitForWatcherCallsCount(page, divLocator, 2)).toBeResolved();
		}
	);

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
	async function getWatcherCallsCount(locator: Locator): Promise<number> {
		const storedValue = await locator.getAttribute('data-test-in-view');

		if (storedValue == null) {
			return 0;

		}

		return parseInt(storedValue, 10);
	}

	/**
	 * Resets the value of the watcher call counter stored in given `locator`
	 * @param locator - the source locator
	 */
	async function resetWatcherCallsCount(locator: Locator): Promise<void> {
		await locator.evaluate((div) => div.removeAttribute('data-test-in-view'));
	}

	/**
	 * Waits for the value of the watcher call counter to become equal to `expected`
	 *
	 * @param page
	 * @param locator
	 * @param expected
	 */
	async function waitForWatcherCallsCount(page: Page, locator: Locator, expected: number): Promise<void> {
		const handle = await locator.elementHandle();
		await page
			.waitForFunction(([div, val]) =>
				Boolean(
					div.getAttribute('data-test-in-view') === val.toString(10)
				), <[ElementHandle<HTMLElement>, number]>[handle, expected]);
	}

	/**
	 * Adds test handler (which counts calls) to given `watch`,
	 * or replaces given one if a function/undefined is provided
	 *
	 * @param watch - a watch parameter to update
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
	 * Creates a `<div>` element with v-in-view set to `inViewValue`
	 *
	 * @param page - the target page
	 * @param inViewValue - the value of v-in-view directive
	 */
	async function createDivForInViewTest(
		page: Page,
		inViewValue: CanUndef<CanArray<WatchHandler | Partial<WatchOptions>>>
	): Promise<Locator> {

		await Component.createComponent(page, 'div', {
			'v-in-view': Object.isArray(inViewValue) ?
				inViewValue.map(addTestHandlerToWatch) :
				addTestHandlerToWatch(inViewValue),
			'data-testid': 'div',
			style: `margin-top: ${TEST_DIV_MARGIN_TOP_PX}px; width: 20px; height: 20px; background: red; position: relative`
		});

		return page.getByTestId('div');
	}

});
