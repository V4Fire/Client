/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * A structure that defines a module for loading
 */
export interface Module extends Dictionary {
	/**
	 * The module identifier
	 */
	id?: unknown;

	/**
	 * A function that loads the module
	 */
	load(): Promise<unknown>;

	/**
	 * If false, the module will not be loaded in case of SSR
	 */
	ssr?: boolean;
}

export interface ResolvedModule extends Module {
	/**
	 * The module's loading status
	 */
	status: 'pending' | 'loaded' | 'failed';

	/**
	 * The module's loading promise
	 */
	promise: Promise<unknown>;
}

/**
 * The internal structure is designed to store information about received signals
 * as well as signals that are being awaited
 */
export interface Signal {
	promise: Promise<void>;
	resolver: CanUndef<Function>;
}
