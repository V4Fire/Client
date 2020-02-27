/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

export type WatchPath = string | unknown[];

export interface Watcher<T = unknown> {
	proxy: T;
	unwatch(): void;
}

export interface WatchOptions {
	/**
	 * If true, then the callback of changing is also fired on mutation of nested objects
	 * @default `false`
	 */
	deep?: boolean;

	/**
	 * If true, then all mutation events will be collapsed to one event and fired from a top property of the object
	 * @default `false`
	 */
	collapseToTopProperties?: boolean;
}

export interface WrapOptions {
	/**
	 * Link a top property of watching
	 */
	top?: object;

	/**
	 * Base path to object properties:
	 * it is provided to a watch handler with parameters
	 */
	path?: unknown[];

	/**
	 * True if an object that is wrapped is the root of watching
	 * @default `false`
	 */
	isRoot?: boolean;
}

/**
 * Parameters of a mutation event
 */
export interface WatchHandlerParams {
	/**
	 * Link to an object that is watched
	 */
	obj: object;

	/**
	 * Link a top property of watching
	 */
	top?: object;

	/**
	 * True if a mutation has occurred on the root object
	 */
	isRoot: boolean;

	/**
	 * Path to a property that was changed
	 */
	path: unknown[];
}

export interface WatchHandler<NEW = unknown, OLD = NEW> {
	(newValue: CanUndef<NEW>, oldValue: CanUndef<OLD>, params: WatchHandlerParams): any;
}
