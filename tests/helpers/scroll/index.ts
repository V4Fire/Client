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
	 * Waits an element by the specified selector appear and scrolls a page to it if needed.
	 * Throws an error when `elementHandle` does not refer to an element connected to a document or shadow root.
	 *
	 * @param ctx
	 * @param selector
	 * @param [scrollIntoViewOpts]
	 */
	static async scrollIntoViewIfNeeded(
		ctx: Page | ElementHandle,
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
	 * @param ctx
	 * @param selector
	 * @param [scrollIntoViewOpts]
	 * @deprecated
	 * @see [[Scroll.scrollIntoViewIfNeeded]]
	 */
	async scrollIntoViewIfNeeded(
		ctx: Page | ElementHandle,
		selector: string,
		scrollIntoViewOpts: Dictionary
	): Promise<void> {
		return Scroll.scrollRefIntoViewIfNeeded(ctx, selector, scrollIntoViewOpts);
	}

	/**
	 * @param ctx
	 * @param refName
	 * @param [scrollIntoViewOpts]
	 * @deprecated
	 * @see [[Scroll.scrollRefIntoViewIfNeeded]]
	 */
	async scrollRefIntoViewIfNeeded(
		ctx: Page | ElementHandle,
		refName: string,
		scrollIntoViewOpts: Dictionary
	): Promise<void> {
		return Scroll.scrollRefIntoViewIfNeeded(ctx, refName, scrollIntoViewOpts);
	}

	/**
	 * @param page
	 * @param opts
	 * @deprecated
	 * @see [[Scroll.scrollBy]]
	 */
	scrollBy(page: Page, opts: ScrollToOptions): Promise<void> {
		return Scroll.scrollBy(page, opts);
	}

	/**
	 * @param page
	 * @param [opts]
	 * @deprecated
	 * @see [[Scroll.scrollToBottom]]
	 */
	scrollToBottom(page: Page, opts?: ScrollOptions): Promise<void> {
		return Scroll.scrollToBottom(page, opts);
	}

	/**
	 * @param page
	 * @param [checkFn]
	 * @param [opts]
	 * @deprecated
	 * @see [[Scroll.scrollToBottomWhile]]
	 */
	async scrollToBottomWhile(
		page: Page,
		checkFn?: () => CanPromise<boolean>,
		opts?: ScrollToBottomWhileOptions
	): Promise<void> {
		return Scroll.scrollToBottomWhile(page, checkFn, opts);
	}
}
