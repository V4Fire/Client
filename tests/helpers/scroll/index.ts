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
 * Class provides API to work with scroll on a page
 */
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export default class Scroll {
	/**
	 * Scrolls a page by the specified parameters
	 *
	 * @param page
	 * @param opts
	 */
	static scrollBy(page: Page, opts: ScrollToOptions): Promise<void> {
		return page.evaluate((options) => globalThis.scrollBy(options), opts);
	}

	/**
	 * Scrolls a page to the specified parameters
	 *
	 * @param page
	 * @param opts
	 */
	static scrollTo(page: Page, opts: ScrollToOptions): Promise<void> {
		return page.evaluate((options) => globalThis.scrollTo(options), opts);
	}

	/**
	 * Waits an element by the specified selector appear and scrolls a page to it if needed.
	 * Throws an error when `elementHandle` does not refer to an element connected to a document or shadow root.
	 *
	 * @param ctx
	 * @param selector
	 * @param [scrollIntoViewOpts]
	 */
	static async scrollIntoViewIfNeeded(
		ctx: Page,
		selector: string,
		scrollIntoViewOpts: Dictionary
	): Promise<void> {
		const el = await ctx.waitForSelector(selector);
		return el.scrollIntoViewIfNeeded(scrollIntoViewOpts);
	}

	/**
	 * Waits a ref by the specified name appear and scrolls a page to it if needed.
	 * Throws an error when `elementHandle` does not refer to an element connected to a document or shadow root.
	 *
	 * @param ctx
	 * @param refName
	 * @param [scrollIntoViewOpts]
	 *
	 * @deprecated
	 * {@link DOM.waitRef}
	 */
	static async scrollRefIntoViewIfNeeded(
		ctx: Page | ElementHandle,
		refName: string,
		scrollIntoViewOpts: Dictionary
	): Promise<void> {
		const ref = await DOM.waitRef(ctx, refName);
		return ref.scrollIntoViewIfNeeded(scrollIntoViewOpts);
	}

	/**
	 * @param page
	 * @param [options]
	 */
	static scrollToBottom(page: Page, options?: ScrollOptions): Promise<void> {
		return this.scrollBy(page, {top: 1e7, left: 0, ...options});
	}

	/**
	 * Scrolls a page until the passed function returns true, or until a time specified in` timeout` expires
	 *
	 * @param page
	 * @param [checkFn]
	 * @param [opts]
	 */
	static async scrollToBottomWhile(
		page: Page,
		checkFn?: () => CanPromise<boolean>,
		opts?: ScrollToBottomWhileOptions
	): Promise<void> {
		const normalizedOptions = {
			timeout: 1000,
			tick: 100,
			...opts
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

	/**
	 * @param page
	 * @param [options]
	 */
	static scrollToTop(page: Page, options?: ScrollOptions): Promise<void> {
		return this.scrollTo(page, {top: 0, left: 0, ...options});
	}
}
