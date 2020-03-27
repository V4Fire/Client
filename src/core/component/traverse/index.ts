/*!
 * V4Fire Core
 * https://github.com/V4Fire/Core
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Core/blob/master/LICENSE
 */

/**
 * [[include:core/component/traverse/README.md]]
 * @packageDocumentation
 */

import { ComponentInterface } from 'core/component/interface';

/**
 * Returns a link to a "normal" (non-functional and non-flyweight) parent component for the specified component
 * @param component
 */
export function getNormalParent(component: ComponentInterface): CanUndef<ComponentInterface> {
	let
		normalParent: CanUndef<ComponentInterface> = component.$parent;

	// @ts-ignore (access)
	while (normalParent && normalParent.meta && (normalParent.$isFlyweight || normalParent.meta.params.functional)) {
		normalParent = normalParent.$parent;
	}

	return normalParent;
}
