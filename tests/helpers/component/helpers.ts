/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * Checks if the given value is a valid `RenderComponentsVnodeParams` object.
 *
 * @param value - The value to be checked.
 * @returns - Returns `true` if the value is a valid `RenderComponentsVnodeParams` object, otherwise returns `false`.
 *
 * @example
 * ```typescript
 * const vnode = {
 *   attrs: { class: 'header' },
 *   children: ['Header Content']
 * };
 * const isValidVnode = isRenderComponentsVnodeParams(vnode); // true
 *
 * const attrs = { class: 'header' };
 * const isValidAttrs = isRenderComponentsVnodeParams(attrs); // true
 *
 * const invalidValue = 'Not a vnode or attrs object';
 * const isValidInvalidValue = isRenderComponentsVnodeParams(invalidValue); // false
 * ```
 */
export function isRenderComponentsVnodeParams(
	value: RenderComponentsVnodeParams | RenderComponentsVnodeParams['attrs']
): value is RenderComponentsVnodeParams {
	return (<RenderComponentsVnodeParams>value).attrs != null || (<RenderComponentsVnodeParams>value).children != null;
}
