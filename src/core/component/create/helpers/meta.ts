/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { ComponentInterface } from 'core/component/interface';

/**
 * Returns a link to the "normal" (non functional and non flyweight) parent component for the specified component
 * @param ctx - component context
 */
export function getNormalParent(ctx: ComponentInterface): CanUndef<ComponentInterface> {
	let
		normalParent: CanUndef<ComponentInterface> = ctx.$parent;

	// @ts-ignore
	while (normalParent && normalParent.meta && (normalParent.$isFlyweight || normalParent.meta.params.functional)) {
		normalParent = normalParent.$parent;
	}

	return normalParent;
}
