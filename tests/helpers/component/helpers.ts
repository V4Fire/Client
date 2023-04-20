/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * Checks if given value is a RenderComponentsVnodeParams
 * @param value
 */
export function isRenderComponentsVnodeParams(
	value: RenderComponentsVnodeParams | RenderComponentsVnodeParams['attrs']
): value is RenderComponentsVnodeParams {
	return (<RenderComponentsVnodeParams>value).attrs != null || (<RenderComponentsVnodeParams>value).children != null;
}
