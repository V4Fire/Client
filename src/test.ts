/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * An abstract class that represents Vue compatible component API
 */
export abstract class ComponentInterface {
	/**
	 * Resolves the specified ref attribute
	 * @param _ref
	 */
	protected $resolveRef(_ref: Function): Function;
	protected $resolveRef(_ref: null | undefined): undefined;
	protected $resolveRef(_ref: unknown): string;
	protected $resolveRef(_ref: unknown): CanUndef<string | Function> {
		return Object.throw();
	}
}
