/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:core/component/traverse/README.md]]
 * @packageDocumentation
 */

import type { ComponentInterface } from 'core/component/interface';

/**
 * Returns a link to the non-functional parent component of the given one
 * @param component
 */
export function getNormalParent(component: ComponentInterface): ComponentInterface | null {
	let normalParent: Nullable<ComponentInterface> = component.$parent;

	while (
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		normalParent?.unsafe?.meta != null &&
		normalParent.unsafe.meta.params.functional === true
	) {
		normalParent = normalParent.$parent;
	}

	return normalParent;
}
