/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { Route } from 'playwright';

interface RouteHandler {
	(
		resolve: (value: void | PromiseLike<void>) => void,
		route: Route
	): void;
}

export default interface RouteHandleOptions {
	handler: RouteHandler;
	status: number | (() => number);
	withRefreshToken?: boolean;
}
