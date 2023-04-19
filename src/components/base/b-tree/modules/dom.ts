/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type Block from 'components/friends/block/class';

export function setActive(block: Block | undefined, el: Element, status: boolean): void {
	if (block == null) {
		return;
	}

	block.setElementMod(el, 'node', 'active', status);

	if (el.hasAttribute('aria-selected')) {
		el.setAttribute('aria-selected', String(status));
	}
}
