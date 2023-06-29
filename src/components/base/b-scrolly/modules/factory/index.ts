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

import { ReusableRenderEngine } from 'components/base/b-scrolly/modules/factory/engines/reusable';
import { VdomRenderEngine } from 'components/base/b-scrolly/modules/factory/engines/vdom';
import { Friend } from 'super/i-data/i-data';
import type { RenderEngine } from 'components/base/b-scrolly/modules/factory/interface';

/**
 * A friendly class that provides an API for component production, specifically tailored for the `bScrolly` class.
 */
export class ComponentFactory extends Friend {
	override readonly C!: bScrolly;

	protected renderEngine?: RenderEngine;

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

	reset(): void {
		this.renderEngine?.reset();
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
			this.renderEngine ??= new ReusableRenderEngine();
			res = this.renderEngine.render(ctx, items);

		} else {
			this.renderEngine ??= new VdomRenderEngine();
			res = this.renderEngine.render(ctx, items);
		}

		ctx.onRenderEngineDone();
		return res;
	}
}
