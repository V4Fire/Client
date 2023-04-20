/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { Page } from 'playwright';

import Component from 'tests/helpers/component';
import BOM from 'tests/helpers/bom';

import type iStaticPage from 'components/super/i-static-page/i-static-page';

/**
 * Class provides API to work with an application router
 */
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export default class Router {
	/**
	 * Calls the specified method on a router by providing the passed arguments
	 *
	 * @param page
	 * @param method
	 * @param args
	 */
	static async call(page: Page, method: string, ...args: unknown[]): Promise<void> {
		const
			c = await Component.waitForRoot<iStaticPage>(page);

		await c.evaluate((ctx, args) =>
			ctx.router?.[<string>args[0]](...args.slice(1, args.length)), [method, ...args]);

		await page.waitForLoadState('networkidle');
		await BOM.waitForIdleCallback(page);
	}
}
