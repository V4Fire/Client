/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

export interface WatchOptions {
	/**
	 * If true, then the callback of changing is also fired on mutation of nested objects
	 * @default `false`
	 */
	deep?: boolean;

	path?: string;
}

export interface WatchHandler<A = unknown, B = A> {
	(a?: CanUndef<A>, b?: CanUndef<B>): any;
}
