/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Friend from 'components/friends/friend';
import type { VNodeDescriptor } from 'components/friends/vdom';

import type bVirtualScroll from 'components/base/b-virtual-scroll/b-virtual-scroll';
import type { ComponentItem, ItemsProcessor, MountedChild, MountedItem } from 'components/base/b-virtual-scroll/interface';
import { isItem } from 'components/base/b-virtual-scroll/modules/helpers';

import * as vdomRender from 'components/base/b-virtual-scroll/modules/factory/engines/vdom';

/**
 * A friendly class that provides an API for component production, specifically tailored for the `bVirtualScroll` class.
 */
export class ComponentFactory extends Friend {
	override readonly C!: bVirtualScroll;

	/**
	 * Produces component items based on the current state and context.
	 * Returns an array of component items.
	 */
	produceComponentItems(): ComponentItem[] {
		const
			{ctx} = this;

		return this.itemsProcessor(ctx.itemsFactory(ctx.getComponentState(), ctx));
	}

	/**
	 * Produces DOM nodes from an array of component items.
	 * Returns an array of DOM nodes representing the component items.
	 *
	 * @param componentItems - An array of component items.
	 */
	produceNodes(componentItems: ComponentItem[]): HTMLElement[] {
		const createDescriptor = (item: ComponentItem): VNodeDescriptor => ({
			type: item.item,
			attrs: item.props,
			children: item.children
		});

		const descriptors = componentItems.map(createDescriptor);
		return this.callRenderEngine(descriptors);
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
			if (isItem(item)) {
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
	 * Invokes the {@link bVirtualScroll.itemsProcessors} function and returns its result.
	 * @param items - The list of items to process.
	 */
	protected itemsProcessor(items: ComponentItem[]): ComponentItem[] {
		const
			{ctx} = this;

		if (!ctx.itemsProcessors) {
			return items;
		}

		if (Object.isFunction(ctx.itemsProcessors)) {
			return ctx.itemsProcessors(items);
		}

		Object.forEach<ItemsProcessor>(ctx.itemsProcessors, (processor) => {
			items = processor(items);
		});

		return items;
	}

	/**
	 * Calls the render engine to render the components based on the provided descriptors.
	 * Returns an array of rendered DOM nodes.
	 *
	 * @param descriptors - An array of VNode descriptors.
	 */
	protected callRenderEngine(descriptors: VNodeDescriptor[]): HTMLElement[] {
		const
			{ctx} = this;

		ctx.onRenderEngineStart();

		const
			res = vdomRender.render(ctx, descriptors);

		ctx.onRenderEngineDone();

		return res;
	}
}
