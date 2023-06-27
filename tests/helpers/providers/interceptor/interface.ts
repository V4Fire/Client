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
 * Interface for response options.
 */
export interface ResponseOptions {
	delay?: number;
}

export type ResponsePayload = object | string | number;
