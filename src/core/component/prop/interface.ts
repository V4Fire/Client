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
	 * Dictionary where is stored the raw modifiers
	 */
	from?: Dictionary;

	/**
	 * Store for initialized properties
	 * @default `{}`
	 */
	store?: Dictionary;

	/**
	 * If true, then property values will be written to the store object
	 * @default `false`
	 */
	saveToStore?: boolean;
}
