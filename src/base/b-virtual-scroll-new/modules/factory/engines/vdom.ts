/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type bVirtualScrollNew from 'base/b-virtual-scroll-new/b-virtual-scroll-new';
import type { VNodeDescriptor } from 'base/b-virtual-scroll-new/interface';

/**
 * Renders the provided `VNodes` to the `HTMLElements` via `vdom.render` API.
 *
 * @param ctx
 * @param items
 */
export function render(ctx: bVirtualScrollNew, items: VNodeDescriptor[]): HTMLElement[] {
	const
		vnodes = items.map((item) => ctx.unsafe.$createElement(item.type, {props: {'v-attrs': item.attrs}}, item.children)),
		nodes = ctx.vdom.render(vnodes);

	return <HTMLElement[]>nodes;
}
