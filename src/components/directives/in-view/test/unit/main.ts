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
		const observedEl = await createObservedElement(page, undefined);
		await makeEnterViewport(observedEl);
		await test.expect(waitForWatcherCallsCount(page, observedEl, 1)).toBeResolved();
	});

	test('the handler should be called only once if the `once` option is set', async ({page}) => {
		const observedEl = await createObservedElement(page, {once: true});
		await makeEnterViewport(observedEl);
		await restoreViewport(page);
		await makeEnterViewport(observedEl);
		await test.expect(waitForWatcherCallsCount(page, observedEl, 1)).toBeResolved();
	});

	test('all provided handlers should be called when the element enters the viewport', async ({page}) => {
		const observedEl = await createObservedElement(page, [{once: true}, {once: true, delay: 150}]);
		await makeEnterViewport(observedEl);
		await test.expect(waitForWatcherCallsCount(page, observedEl, 2)).toBeResolved();
	});

	test(
		'the handler should not be triggered by scroll events for elements other than the root when the `onlyRoot` option is set to true',

		async ({page}) => {
			const observedEl = await createObservedElement(page, {
				onlyRoot: true,
				root: () => document.getElementById('root-component')!
			});

			await makeEnterViewport(observedEl);

			await test.expect(getWatcherCallsCount(observedEl)).toBeResolvedTo(0);

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

			await test.expect(waitForWatcherCallsCount(page, observedEl, 1)).toBeResolved();
		}
	);

	test(
		'the handler should be called when the element enters the viewport and remains in it for the specified `delay` in milliseconds',

		async ({page}) => {
			const observedEl = await createObservedElement(page, {delay: 250});
			await makeEnterViewport(observedEl);

			await test.expect(getWatcherCallsCount(observedEl)).toBeResolvedTo(0);
			await test.expect(waitForWatcherCallsCount(page, observedEl, 1)).toBeResolved();
		}
	);

	test(
		'the function passed as `onEnter` should be immediately called when the element enters the viewport',

		async ({page}) => {
			const observedEl = await createObservedElement(page, {
				onEnter: (watcher) => {
					watcher.handler(watcher);
					return true;
				},

				once: true
			});

			await makeEnterViewport(observedEl);

			// 2 calls: .onEnter(), then main handler
			await test.expect(waitForWatcherCallsCount(page, observedEl, 2)).toBeResolved();
		}
	);

	test(
		'the function passed as `onLeave` should be immediately called when the element leaves the viewport',

		async ({page}) => {
			const observedEl = await createObservedElement(page, {onLeave: handler});
			await makeEnterViewport(observedEl);

			await resetWatcherCallsCount(observedEl);
			await restoreViewport(page);

			await test.expect(waitForWatcherCallsCount(page, observedEl, 1)).toBeResolved();
		}
	);

	// https://github.com/V4Fire/Client/issues/912
	test.skip(
		'the visibility of the element should be tracked when `trackVisibility` is set',

		async ({page}) => {
			const observedEl = await createObservedElement(
				page,
				{trackVisibility: true}
			);

			await makeEnterViewport(observedEl);

			await observedEl.evaluate(async (div) => {
				div.style.opacity = '0';
				await new Promise((r) => setTimeout(r, 200));
				div.style.opacity = '1';
			});

			await test.expect(waitForWatcherCallsCount(page, observedEl, 2)).toBeResolved();
		}
	);

	/**
	 * A handler to pass to the `in-view` directive
	 * @param watcher - the parameter of the watch handler
	 */
	function handler(watcher: Watcher): void {
		const observedEl = watcher.target;

		const previousValue = parseInt(
			observedEl.getAttribute('data-test-in-view') ?? '0',
			10
		);

		const nextValue = previousValue + 1;
		watcher.target.setAttribute('data-test-in-view', nextValue.toString());
	}

	/**
	 * Returns the value of the observer's call counter stored in the specified observed element
	 * @param observedEl
	 */
	async function getWatcherCallsCount(observedEl: Locator): Promise<number> {
		const
			storedValue = await observedEl.getAttribute('data-test-in-view');

		if (storedValue == null) {
			return 0;
		}

		return parseInt(storedValue, 10);
	}

	/**
	 * Waits for the value of the observer's call counter to become equal to the expected value
	 *
	 * @param page
	 * @param observedEl
	 * @param expected
	 */
	async function waitForWatcherCallsCount(page: Page, observedEl: Locator, expected: number): Promise<void> {
		const handle = await observedEl.elementHandle();

		await page
			.waitForFunction(
				([div, val]) => Boolean(
					div.getAttribute('data-test-in-view') === val.toString(10)
				),

				<[ElementHandle<HTMLElement>, number]>[handle, expected]
			);
	}

	/**
	 * Resets the value of the observer's call counter stored in the given observed element
	 * @param observedEl
	 */
	async function resetWatcherCallsCount(observedEl: Locator): Promise<void> {
		await observedEl.evaluate((div) => div.removeAttribute('data-test-in-view'));
	}

	/**
	 * Creates an element with the applied `in-view` directive to observe its entry into the viewport
	 *
	 * @param page
	 * @param inViewOpts - options for the `in-view` directive
	 */
	async function createObservedElement(
		page: Page,
		inViewOpts: CanUndef<CanArray<WatchHandler | Partial<WatchOptions>>>
	): Promise<Locator> {
		await Component.createComponent(page, 'div', {
			'v-in-view': Object.isArray(inViewOpts) ?
				inViewOpts.map(addHandler) :
				addHandler(inViewOpts),

			'data-testid': 'div',
			style: `margin-top: ${TEST_DIV_MARGIN_TOP_PX}px; width: 20px; height: 20px; background: red;`
		});

		return page.getByTestId('div');

		function addHandler(
			watch: CanUndef<WatchHandler | Partial<WatchOptions>>
		): WatchHandler | WatchOptions & {handler: WatchHandler} {
			if (Object.isUndef(watch) || Object.isFunction(watch)) {
				return handler;
			}

			return {...watch, handler};
		}
	}
});
