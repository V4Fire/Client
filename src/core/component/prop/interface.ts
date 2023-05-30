/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * Additional options of component props initialization
 */
export interface InitPropsObjectOptions {
	/**
	 * A dictionary where is stored the passed component props, like `$props`
	 */
	from?: Dictionary;

	/**
	 * A store for the initialized props
	 * @default `{}`
	 */
	store?: Dictionary;

	/**
	 * If true, then initialized prop values will be written to the passed store object
	 * @default `false`
	 */
	saveToStore?: boolean;
}
