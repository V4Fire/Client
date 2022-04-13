/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import delay from 'delay';
import type { Page, ElementHandle } from 'playwright';

import type Helpers from 'tests/helpers';
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

	/** @see [[Helpers]] */
	protected parent: typeof Helpers;

	/** @param parent */
	constructor(parent: typeof Helpers) {
		this.parent = parent;
	}

	/**
	 * Waits an element by the specified selector appear and scrolls a page to it if needed.
	 * Throws an error when `elementHandle` does not refer to an element connected to a document or shadow root.
	 *
	 * @param ctx
	 * @param selector
	 * @param [scrollIntoViewOpts]
	 */
	async scrollIntoViewIfNeeded(
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
	async scrollRefIntoViewIfNeeded(
		ctx: Page | ElementHandle,
		refName: string,
		scrollIntoViewOpts: Dictionary
	): Promise<void> {
		const ref = await this.parent.dom.waitForRef(ctx, refName);
		return ref.scrollIntoViewIfNeeded(scrollIntoViewOpts);
	}

	/**
	 * Scrolls a page until the passed function returns true, or until a time specified in` timeout` expires
	 *
	 * @param page
	 * @param [checkFn]
	 * @param [opts]
	 */
	async scrollToBottomWhile(
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
	 * Scrolls a page to the bottom
	 *
	 * @param page
	 * @param [opts]
	 */
	scrollToBottom(page: Page, opts?: ScrollOptions): Promise<void> {
		return this.scrollBy(page, {top: 1e7, left: 0, ...opts});
	}

	/**
	 * @deprecated
	 * @see [[Scroll.scrollBy]]
	 *
	 * @param page
	 * @param options
	 */
	scrollBy(page: Page, options: ScrollToOptions): Promise<void> {
		return Scroll.scrollBy(page, options);
	}
}
