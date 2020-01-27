/*!
 * V4Fire Core
 * https://github.com/V4Fire/Core
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Core/blob/master/LICENSE
 */

/**
 * Returns a component name by the specified constructor
 * @param constr
 */
export function getComponentName(constr: Function): string {
	return (constr.name || '').dasherize();
}
