/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { JSHandle } from 'playwright';
import type { ModuleMocker } from 'jest-mock';

/**
 * Represents a spy object with properties for accessing spy information.
 */
export interface SpyObject {
	/**
	 * The {@link JSHandle} representing the spy object.
	 */
	readonly handle: JSHandle<ReturnType<ModuleMocker['fn']> | ReturnType<ModuleMocker['spyOn']>>;

	/**
	 * The array of arguments passed to the spy function on each call.
	 */
	readonly calls: Promise<any[][]>;

	/**
	 * The number of times the spy function has been called.
	 */
	readonly callsCount: Promise<number>;

	/**
	 * The arguments of the most recent call to the spy function.
	 */
	readonly lastCall: Promise<any[]>;

	/**
	 * The results of each call to the spy function.
	 */
	readonly results: Promise<JestMockResult[]>;
}

/**
 * Represents a function that extracts or creates a spy object from a `JSHandle`.
 */
export interface SpyExtractor<CTX, ARGS extends any[]> {
	/**
	 * Extracts or creates a spy object from a `JSHandle`.
	 *
	 * @param ctx - the `JSHandle` containing the spy object.
	 * @param args
	 */
	(ctx: CTX, ...args: ARGS): ReturnType<ModuleMocker['spyOn']>;
}

/**
 * Extracts the type from a `JSHandle`.
 */
export type ExtractFromJSHandle<T> = T extends JSHandle<infer V> ? V : never;
