/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * Additional options of component properties initializing
 */
export interface InitPropsObjectOptions {
	/**
	 * Storage object for initialized properties
	 * @default `{}`
	 */
	store?: Dictionary;

	/**
	 * If true, then property values is written to a store object
	 * @default `false`
	 */
	saveToStore?: boolean;
}
