/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { JSHandle, Page, BrowserContext } from 'playwright';

import { StatusCodes } from 'core/status-codes';

import type bRemoteProvider from 'components/base/b-remote-provider/b-remote-provider';

import Component from 'tests/helpers/component';

/**
 * Creates b-remote-provider component with the provided attributes
 *
 * @param page - playwright's isolated page
 * @param attrs - additional component's attributes
 */
export function renderProvider(page: Page, attrs: Dictionary = {}): Promise<JSHandle<bRemoteProvider>> {
	return Component.createComponent(page, 'b-remote-provider', {
		attrs
	});
}

/**
 * Intercepts any request to the /api and responds with the mock data
 *
 * @param context - playwright's context
 * @param body - body of the response (it will be converted to string using `JSON.stringify`)
 * @param status - status of the response
 */
export function mockAPIResponse(
	context: BrowserContext,
	body: any,
	status: StatusCodes = StatusCodes.OK
): Promise<void> {
	return context.route('/api', (route) => route.fulfill({
		status,
		body: JSON.stringify(body)
	}));
}
