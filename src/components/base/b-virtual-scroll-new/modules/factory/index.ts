/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { registerComponent } from 'core/component/init';

import Friend from 'components/friends/friend';
import type { VNodeDescriptor } from 'components/friends/vdom';

import type bVirtualScrollNew from 'components/base/b-virtual-scroll-new/b-virtual-scroll-new';
import type { ComponentItem, ItemsProcessor, MountedChild, MountedItem } from 'components/base/b-virtual-scroll-new/interface';
import { isItem } from 'components/base/b-virtual-scroll-new/modules/helpers';

import * as vdomRender from 'components/base/b-virtual-scroll-new/modules/factory/engines/vdom';

/**
 * A friendly class that provides an API for component production,
 * specifically tailored for the `bVirtualScrollNew` class.
 */
export class ComponentFactory extends Friend {
	override readonly C!: bVirtualScrollNew;

	/**
	 * Produces component items based on the current state and context.
	 * Returns an array of component items.
	 */
	produceComponentItems(): ComponentItem[] {
		const
			{ctx} = this,
			normalize = this.normalizeComponentItem.bind(this),
			componentItems = ctx.itemsFactory(ctx.getVirtualScrollState(), ctx);

		return this.itemsProcessor(componentItems).map(normalize);
	}

	/**
	 * Produces DOM nodes from an array of component items.
	 * Returns an array of DOM nodes representing the component items.
	 *
	 * @param componentItems - an array of component items
	 */
	produceNodes(componentItems: ComponentItem[]): HTMLElement[] {
		if (componentItems.length === 0 || SSR) {
			return [];
		}

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
			{items: mountedItems, childList} = ctx.getVirtualScrollState();

		let
			itemsCounter = 0;

		return items.map((item, i) => {
			if (isItem(item)) {
				const res = {
					...item,
					node: nodes[i],
					itemIndex: mountedItems.length + itemsCounter,
					childIndex: childList.length + i
				};

				itemsCounter++;
				return res;
			}

			return {
				...item,
				node: nodes[i],
				childIndex: mountedItems.length + i
			};
		});
	}

	/**
	 * Invokes the {@link bVirtualScrollNew.itemsProcessors} function and returns its result
	 * @param items - the list of items to process.
	 */
	protected itemsProcessor(items: ComponentItem[]): ComponentItem[] {
		const
			{ctx} = this,
			itemsProcessors = ctx.getItemsProcessors();

		if (!itemsProcessors) {
			return items;
		}

		if (Object.isFunction(itemsProcessors)) {
			return itemsProcessors(items, ctx);
		}

		Object.forEach<ItemsProcessor>(itemsProcessors, (processor) => {
			items = processor(items, ctx);
		});

		return items;
	}

	/**
	 * Performs normalization of the ComponentItem object
	 *
	 * @param componentItem
	 */
	protected normalizeComponentItem(componentItem: ComponentItem): ComponentItem {
		const
			{item, props} = componentItem;

		componentItem.props = props ?
			this.normalizeComponentItemProps(item, props) :
			props;

		return componentItem;
	}

	/**
	 * Normalizes the attributes of the given props
	 *
	 * @param componentName
	 * @param props
	 */
	protected normalizeComponentItemProps(componentName: string, props: Dictionary): Dictionary {
		const
			meta = registerComponent(componentName);

		if (meta == null) {
			return props;
		}

		return Object.entries(props).reduce((acc, [key, value]) => {
			const
				noUpdate = meta.props[key]?.forceUpdate === false,
				normalizedKey = noUpdate ? `@:${key}` : key;

			acc[normalizedKey] = noUpdate ?
				this.ctx.createPropAccessors(() => <object>value) :
				value;

			return acc;
		}, {});
	}

	/**
	 * Calls the render engine to render the components based on the provided descriptors.
	 * Returns an array of rendered DOM nodes.
	 *
	 * @param descriptors - an array of VNode descriptors.
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
