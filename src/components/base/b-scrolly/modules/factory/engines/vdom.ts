/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { ComponentItem } from 'components/base/b-scrolly/b-scrolly';
import type bScrolly from 'components/base/b-scrolly/b-scrolly';
import type { VNode } from 'core/component';

/**
 * Renders the provided `VNodes` to the `HTMLElements` via `vdom.render` API.
 *
 * @param ctx
 * @param items
 */
export function render(ctx: bScrolly, items: ComponentItem[]): HTMLElement[] {
	const vNodes: VNode[] = items.map((item) => ctx.unsafe.$createElement(item.item, {
		attrs: {
			'v-attrs': item.props
		}
	}));

	const
		// https://github.com/vuejs/core/issues/6061
		nodes = ctx.unsafe.vdom.render(vNodes).filter((node) => node.nodeType !== node.TEXT_NODE);

	return <HTMLElement[]>nodes;
}
