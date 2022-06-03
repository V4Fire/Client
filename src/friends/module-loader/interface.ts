/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * A structure to define a module to load
 */
export interface Module extends Dictionary {
	/**
	 * The module identifier
	 */
	id?: unknown;

	/**
	 * A function to load the module
	 */
	load(): Promise<unknown>;

	/**
	 * A function that returns a promise.
	 * The module loading won't start until this promise is fulfilled.
	 */
	wait?(): Promise<unknown>;
}

export interface ResolvedModule extends Module {
	/**
	 * The module loading status
	 */
	status: 'pending' | 'loaded' | 'failed';

	/**
	 * The module loading promise
	 */
	promise: Promise<unknown>;
}
