/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import delay from 'delay';
import type { Page, ElementHandle } from 'playwright';

import DOM from 'tests/helpers/dom';

import type { ScrollToBottomWhileOptions } from 'tests/helpers/scroll/interface';

export * from 'tests/helpers/scroll/interface';

/**
 * Class provides API to work with scroll on the page
 */
export default class Scroll {

	/**
	 * @param page
	 * @param options
	 */
	static scrollBy(page: Page, options: ScrollToOptions): Promise<void> {
		return page.evaluate((options) => globalThis.scrollBy(options), options);
	}

	/**
	 * This method waits for actionability checks, then tries to scroll element into view,
	 * unless it is completely visible as defined by IntersectionObserver's ratio.
	 *
	 * Throws an error when `elementHandle` does not point to an element connected to a Document or a ShadowRoot.
	 *
	 * @param ctx
	 * @param selector
	 * @param [scrollIntoViewOptions]
	 */
	async scrollIntoViewIfNeeded(
		ctx: Page | ElementHandle,
		selector: string,
		scrollIntoViewOptions: Dictionary
	): Promise<void> {
		const el = await ctx.waitForSelector(selector);
		return el.scrollIntoViewIfNeeded(scrollIntoViewOptions);
	}

	/**
	 * This method waits for actionability checks, then tries to scroll element into view,
	 * unless it is completely visible as defined by IntersectionObserver's ratio.
	 *
	 * Throws an error when `elementHandle` does not point to an element connected to a `Document` or a `ShadowRoot`.
	 *
	 * @param ctx
	 * @param refName
	 * @param [scrollIntoViewOptions]
	 */
	async scrollRefIntoViewIfNeeded(
		ctx: Page | ElementHandle,
		refName: string,
		scrollIntoViewOptions: Dictionary
	): Promise<void> {
		const ref = await DOM.waitRef(ctx, refName);
		return ref.scrollIntoViewIfNeeded(scrollIntoViewOptions);
	}

	/**
	 * @param page
	 * @param options
	 * @deprecated
	 * @see [[Scroll.scrollBy]]
	 */
	scrollBy(page: Page, options: ScrollToOptions): Promise<void> {
		return Scroll.scrollBy(page, options);
	}

	/**
	 * @param page
	 * @param [options]
	 */
	scrollToBottom(page: Page, options?: ScrollOptions): Promise<void> {
		return this.scrollBy(page, {top: 1e7, left: 0, ...options});
	}

	/**
	 * Scrolls the page until the value returned by the function is `true`
	 * or until the time specified in` timeout` expires.
	 *
	 * @param page
	 * @param [checkFn]
	 * @param [options]
	 */
	async scrollToBottomWhile(
		page: Page,
		checkFn?: () => CanPromise<boolean>,
		options?: ScrollToBottomWhileOptions
	): Promise<void> {
		const normalizedOptions = {
			timeout: 1000,
			tick: 100,
			...options
		};

		checkFn = checkFn ?? (() => false);

		let
			isDone = await checkFn(),
			didTimeout = <boolean>false;

		const
			timeout = setTimeout(() => didTimeout = true, normalizedOptions.timeout);

		if (isDone) {
			return;
		}

		while (!isDone) {
			if (didTimeout) {
				return;
			}

			await this.scrollToBottom(page);
			isDone = await checkFn();
			await delay(normalizedOptions.tick);
		}

		clearTimeout(timeout);
	}

}
