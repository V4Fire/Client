/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

export interface CreateFakeCtxOptions {
	/**
	 * If true, then component prop values will be force initialize
	 */
	initProps?: boolean;

	/**
	 * If true, then the function uses safe access to object properties
	 * by using Object.getOwnPropertyDescriptor/defineProperty
	 * @default `false`
	 */
	safe?: boolean;
}
