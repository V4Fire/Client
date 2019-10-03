import { VNode } from 'core/component';
import { ComponentDriver, Component, VNodeData } from 'core/component/engines';

import bVirtualScroll from 'base/b-virtual-scroll/b-virtual-scroll';

export interface RecycleItem<T extends unknown = unknown> {
	active: boolean;
	driver: ComponentDriver;
	id: string;
	data: T;
}

export default class RecycleVNode {
	/**
	 * VNodes store
	 */
	protected nodesCache: Dictionary<ComponentDriver> = {};

	/**
	 * Recycle items store
	 */
	protected recycleItems: RecycleItem[] = [];

	/**
	 * Link to component
	 */
	protected component: bVirtualScroll;

	/**
	 * @param ctx
	 */
	constructor(ctx: bVirtualScroll) {
		this.component = ctx;
	}

	/**
	 * Returns a VNode
	 * @param key
	 */
	getVNode(key: string): CanUndef<ComponentDriver> {
		return this.nodesCache[key];
	}

	/**
	 * Save a specified VNode
	 *
	 * @param key
	 * @param node
	 */
	setVNode(key: string, node: ComponentDriver): ComponentDriver {
		this.nodesCache[key] = node;

		const
			{cacheSize, recycleSize} = this.component,
			length = Object.keys(this.nodesCache).length;

		if (length > cacheSize) {
			this.recycle(recycleSize);
		}

		return node;
	}

	/**
	 * Recycles VNodes
	 * @param recycleSize
	 */
	recycle(recycleSize: number): void {
		const
			keys = Object.keys(this.nodesCache),
			length = keys.length;

		// TODO: Возможно стоит проверить, есть ли тут что оптимизировать (например переиспользовать не рандомно)
		// TODO: Возможно стоит исключать только что зарендеренную
		const getRandomNodeKey = () => keys[Math.floor(Math.random() * length)];

		for (let i = 0; i < recycleSize; i++) {
			const
				k = getRandomNodeKey(),
				node = this.nodesCache[k];

			if (!node) {
				continue;
			}

			node.$destroy();
			delete this.nodesCache[k];
		}
	}

	/**
	 * Renders a new VNode
	 * @param data
	 * @param el
	 */
	render(data: unknown, el: HTMLElement, item: RecycleItem): Element {
		const
			{recycleVNode} = this.component;

		if (recycleVNode) {
			const driver = this.createRecycleItem(data, el);

			if (driver) {
				item.driver = driver;
				return driver.$el;
			}
		}

		// TODO: Доделать Render
	}

	/**
	 * Returns an inactive recycle item
	 */
	protected getInactiveRecycleItem(): CanUndef<RecycleItem> {
		return this.recycleItems.find((v) => !v.active);
	}

	/** @see bVirtualScroll.getOptionKey */
	protected getOptionKey(el: unknown): CanUndef<string> {
		// @ts-ignore (access)
		return this.component.getOptionKey(el);
	}

	/**
	 * Sets a use state for specified element
	 * @param id
	 */
	protected deactivateRecycleItem(id: string): void {
		const item = this.recycleItems.find((item) => item.id === id);

		if (item) {
			item.active = false;
		}
	}

	/**
	 * Destroys a specified VNode
	 * @param id
	 */
	protected destroyRecycleItem(id: string): void {
		const {recycleItems} = this;

		for (let i = 0; i < recycleItems.length; i++) {
			const
				item = recycleItems[i];

			if (item.id === id) {
				item.driver.$destroy();
				recycleItems.splice(i, 1);
			}
		}
	}

	/**
	 * Destroys all VNodes
	 */
	protected destroyAllRecycleItem(): void {
		this.recycleItems.forEach((item) => item.driver.$destroy());
		this.recycleItems = [];
	}

	/**
	 * Creates a new Recycle item
	 *
	 * @param data - Item data
	 * @param el
	 */
	protected createRecycleItem(data: unknown, el: HTMLElement): CanUndef<ComponentDriver> {
		const
			id = this.getOptionKey(data),
			inactive = this.getInactiveRecycleItem();

		if (!id) {
			return;
		}

		let
			driver;

		const renderOpts = {
			props: {
				data
			}
		};

		if (!inactive) {
			const item = {
				driver: new ComponentDriver({
					el,
					data: renderOpts.props,
					render: (c) => c(this.component.option, renderOpts)
				}),

				active: true,

				id,
				data
			};

			this.recycleItems.push(item);
			driver = item.driver;

		} else {
			// @ts-ignore
			inactive.driver.data = data;
			inactive.active = true;
			inactive.id = id;

			driver = inactive.driver;
		}

		return driver;
	}
}

// TODO: Проверить как будет быстрее, каждый раз создавать Component Driver или переиспользовать один
// TODO: Доделать tombstones
