/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { VNodeDescriptor } from 'components/friends/vdom';
import type bVirtualScroll from 'components/base/b-virtual-scroll/b-virtual-scroll';

/**
 * Renders the provided `VNodes` to the `HTMLElements` via `vdom.render` API.
 *
 * @param ctx
 * @param items
 */
export function render(ctx: bVirtualScroll, items: VNodeDescriptor[]): HTMLElement[] {
	const
		vnodes = ctx.vdom.create(...items),
		nodes = ctx.vdom.render(vnodes);

	// https://github.com/vuejs/core/issues/6061
	if (nodes[0].nodeType === Node.TEXT_NODE) {
		nodes.shift();
	}

	// https://github.com/vuejs/core/issues/6061
	if (nodes[nodes.length - 1].nodeType === Node.TEXT_NODE) {
		nodes.pop();
	}

	return <HTMLElement[]>nodes;
}
