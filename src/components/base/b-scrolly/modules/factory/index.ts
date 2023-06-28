/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type bScrolly from 'components/base/b-scrolly/b-scrolly';
import type { ComponentItem, MountedChild, MountedItem } from 'components/base/b-scrolly/interface';
import { componentItemType, componentRenderStrategy } from 'components/base/b-scrolly/const';

import * as forceUpdate from 'components/base/b-scrolly/modules/factory/engines/force-update';
import * as vdomRender from 'components/base/b-scrolly/modules/factory/engines/vdom';
import { Friend } from 'super/i-data/i-data';

/**
 * A friendly class that provides an API for component production, specifically tailored for the `bScrolly` class.
 */
export class ComponentFactory extends Friend {
	override readonly C!: bScrolly;

	/**
	 * Produces component items based on the current state and context.
	 * Returns an array of component items.
	 */
	produceComponentItems(): ComponentItem[] {
		const
			{ctx} = this;

		return ctx.itemsFactory(ctx.getComponentState(), ctx);
	}

	/**
	 * Produces DOM nodes from an array of component items.
	 * Returns an array of DOM nodes representing the component items.
	 *
	 * @param componentItems - An array of component items.
	 */
	produceNodes(componentItems: ComponentItem[]): HTMLElement[] {
		return this.callRenderEngine(componentItems);
	}

	/**
	 * Augments `ComponentItem` with various properties such as the component node, item index, and child index.
	 *
	 * @param items
	 * @param nodes
	 */
	produceMounted(items: ComponentItem[], nodes: HTMLElement[]): Array<MountedChild | MountedItem> {
		const
			{ctx} = this,
			{items: mountedItems, childList} = ctx.getComponentState();

		return items.map((item, i) => {
			if (item.type === componentItemType.item) {
				return {
					...item,
					node: nodes[i],
					itemIndex: mountedItems.length + i,
					childIndex: childList.length + i
				};
			}

			return {
				...item,
				node: nodes[i],
				childIndex: mountedItems.length + i
			};
		});
	}

	/**
	 * Calls the render engine to render the components based on the provided descriptors.
	 * Returns an array of rendered DOM nodes.
	 *
	 * @param items - An array of VNode descriptors.
	 */
	protected callRenderEngine(items: ComponentItem[]): HTMLElement[] {
		const
			{ctx} = this;

		let res;
		ctx.onRenderEngineStart();

		if (ctx.componentRenderStrategy === componentRenderStrategy.reuse) {
			res = forceUpdate.render(ctx, items);

		} else {
			res = vdomRender.render(ctx, items);
		}

		ctx.onRenderEngineDone();
		return res;
	}
}
