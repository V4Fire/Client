/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { VNodeDescriptor } from 'components/friends/vdom';
import type bScrolly from 'components/base/b-scrolly/b-scrolly';

/**
 * Renders the provided `VNodes` to the `HTMLElements` via `vdom.render` API.
 *
 * @param ctx
 * @param items
 */
export function render(ctx: bScrolly, items: VNodeDescriptor[]): HTMLElement[] {
	const
		vnodes = ctx.vdom.create(...items),
		// https://github.com/vuejs/core/issues/6061
		nodes = ctx.vdom.render(vnodes).filter((node) => node.nodeType !== node.TEXT_NODE);

	return <HTMLElement[]>nodes;
}
