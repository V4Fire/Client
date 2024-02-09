/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { Route, Request } from 'playwright';

export type ResponseHandler = (route: Route, request: Request) => CanPromise<any>;

/**
 * {@link Route.fulfill} function options.
 * Playwright does not provide an options interface for the fulfill function
 */
export type FulfillOptions = Exclude<Parameters<Route['fulfill']>[0], undefined>;

/**
 * Interface for response options.
 */
export interface ResponseOptions extends Omit<FulfillOptions, 'body' | 'status'> {
	/**
	 * The delay before the response to the request is sent.
	 */
	delay?: number;
}

/**
 * Instance of the intercepted request with additional methods
 */
export interface InterceptedRequest extends Request {
	/**
	 * Returns an object containing the GET parameters from the request
	 */
	query(): Record<string, unknown>;
}

export type ResponsePayload = object | string | number;
