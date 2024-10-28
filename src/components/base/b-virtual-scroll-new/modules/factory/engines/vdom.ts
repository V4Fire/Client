/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { VNodeDescriptor } from 'components/friends/vdom';
import type bVirtualScrollNew from 'components/base/b-virtual-scroll-new/b-virtual-scroll-new';
import { bVirtualScrollNewVDomRenderGroup } from 'components/base/b-virtual-scroll-new/b-virtual-scroll-new';

/**
 * Renders the provided `VNodes` to the `HTMLElements` via `vdom.render` API.
 *
 * @param ctx
 * @param items
 */
export function render(ctx: bVirtualScrollNew, items: VNodeDescriptor[]): HTMLElement[] {
	const
		{renderPage} = ctx.getVirtualScrollState();

	const
		vnodes = ctx.vdom.create(...items),
		nodes = ctx.vdom.render(vnodes, `${bVirtualScrollNewVDomRenderGroup}:${renderPage}`);

	return <HTMLElement[]>nodes;
}
