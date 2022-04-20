/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

export function isSpecialComponent(component: string): boolean {
	return component === 'v-render' || component.endsWith('-functional');
}
