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
 * Returns a link to a "normal" (non-functional) parent component for the passed one
 * @param component
 */
export function getNormalParent(component: ComponentInterface): CanUndef<ComponentInterface> {
	let
		normalParent: CanUndef<ComponentInterface> = component.$parent;

	while (
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		normalParent?.unsafe?.meta != null &&
		normalParent.unsafe.meta.params.functional === true
	) {
		normalParent = normalParent.$parent;
	}

	return normalParent;
}
