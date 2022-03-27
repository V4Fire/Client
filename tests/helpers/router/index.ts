// @ts-check

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { Page } from 'playwright';

import type Helpers from 'tests/helpers';

/**
 * Class provides API to work with `b-router`.
 */
export default class Router {
	/** @see [[Helpers]] */
	protected parent: typeof Helpers;

	/** @param parent */
	constructor(parent: typeof Helpers) {
		this.parent = parent;
	}

	/**
	 * Calls the specified method on a router with providing of arguments
	 *
	 * @param page
	 * @param method
	 * @param argsToProvideIntoRouter
	 */
	async call(page: Page, method: string, ...argsToProvideIntoRouter: unknown[]): Promise<void> {
		const
			c = await this.parent.component.waitForComponent(page, '#root-component');

		await c.evaluate((ctx, args) =>
			ctx.router?.[<string>args[0]](...args.slice(1, args.length)), [method, ...argsToProvideIntoRouter]);

		await page.waitForLoadState('networkidle');
		await this.parent.bom.waitForIdleCallback(page);
	}
}
