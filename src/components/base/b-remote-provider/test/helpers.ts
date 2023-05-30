/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { BrowserContext } from 'playwright';

import { StatusCodes } from 'core/status-codes';

/**
 * Intercepts any request to the /api and responds with the mock data
 *
 * @param context - the Playwright context
 * @param body - the response body (it will be converted to string using `JSON.stringify`)
 * @param status - the response status
 */
export function mockAPI(
	context: BrowserContext,
	body: JSONLikeValue,
	status: StatusCodes = StatusCodes.OK
): Promise<void> {
	return context.route('/api', (route) => route.fulfill({
		status,
		body: JSON.stringify(body)
	}));
}
