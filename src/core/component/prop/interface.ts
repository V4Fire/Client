/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * Additional options for component props initialization
 */
export interface InitPropsObjectOptions {
	/**
	 * A dictionary that stores the passed component props, like `$props`
	 */
	from?: Dictionary;

	/**
	 * A store for the initialized props
	 * @default `{}`
	 */
	store?: Dictionary;

	/**
	 * If set to true, the initialized property values will be written into the provided store object
	 * @default `false`
	 */
	saveToStore?: boolean;
}
