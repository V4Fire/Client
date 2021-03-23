/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import symbolGenerator from 'core/symbol';

import { Friend } from 'super/i-block/i-block';

import type ScrollRender from 'base/b-virtual-scroll/modules/chunk-render';
import type bVirtualScroll from 'base/b-virtual-scroll/b-virtual-scroll';

import type { RenderItem, DataToRender, ItemAttrs } from 'base/b-virtual-scroll/interface';

export const
	$$ = symbolGenerator();

export default class ComponentRender extends Friend {
	readonly C!: bVirtualScroll;

	/**
	 * Async group
	 */
	readonly asyncGroup: string = 'component-render';

	/**
	 * If false, the cache flushing process is not currently running
	 */
	protected canDropCache: boolean = false;

	/**
	 * Rendered items cache
	 */
	protected nodesCache: Dictionary<HTMLElement> = Object.createDict();

	/**
	 * True if rendered nodes can be cached
	 */
	protected get canCache(): boolean {
		return this.ctx.cacheNodes && this.ctx.clearNodes;
	}

	/**
	 * API for scroll rendering
	 */
	protected get scrollRender(): ScrollRender {
		return this.ctx.chunkRender;
	}

	/**
	 * Classname for options
	 */
	get optionClass(): CanUndef<string> {
		return this.ctx.block?.getFullElName('option-el');
	}

	/**
	 * Re-initializes component render
	 */
	reInit(): void {
		Object.keys(this.nodesCache).forEach((key) => {
			const el = this.nodesCache[key];
			el?.remove();
		});

		this.nodesCache = Object.createDict();
	}

	/**
	 * Returns a node from the cache by the specified key
	 * @param key
	 */
	getCachedComponent(key: string): CanUndef<HTMLElement> {
		return this.nodesCache[key];
	}

	/**
	 * Saves a node to the cache by the specified key
	 *
	 * @param key
	 * @param node
	 */
	cacheNode(key: string, node: HTMLElement): HTMLElement {
		if (!this.ctx.cacheNodes) {
			return node;
		}

		this.nodesCache[key] = node;

		const
			{nodesCache, ctx: {cacheSize}} = this;

		if (Object.keys(nodesCache).length > cacheSize) {
			this.canDropCache = true;
		}

		return node;
	}

	/** @see [[bVirtualScroll.getOptionKey]] */
	getItemKey(data: object, index: number): string {
		return String(this.ctx.getItemKey(data, index));
	}

	/**
	 * Renders the specified chunk of items
	 * @param items
	 */
	render(items: RenderItem[]): HTMLElement[] {
		const
			{canCache} = this;

		const
			res: HTMLElement[] = [],
			needRender: Array<[RenderItem, number]> = [];

		for (let i = 0; i < items.length; i++) {
			const
				item = items[i];

			if (item.node) {
				res[i] = item.node;
				continue;
			}

			if (canCache) {
				const
					key = this.getItemKey(item.data, item.index),
					node = this.getCachedComponent(key);

				if (node) {
						res[i] = node;
						item.node = node;
						continue;
				}
			}

			needRender.push([item, i]);
		}

		if (needRender.length > 0) {
			const
				nodes = this.createComponents(needRender.map(([item]) => item));

			for (let i = 0; i < needRender.length; i++) {
				const
					item = needRender[i][0],
					indexesToAssign = needRender[i][1],
					node = nodes[i],
					key = this.getItemKey(item.data, item.index);

				if (canCache) {
					this.cacheNode(key, item.node = node);
				}

				res[indexesToAssign] = node;
			}
		}

		return res;
	}

	/**
	 * Creates a component by the specified params
	 * @param items
	 */
	protected createComponents(items: RenderItem[]): HTMLElement[] {
		const
			{ctx: c, scrollRender: {items: totalItems}} = this;

		const render = (children: DataToRender[]) => {
			const map = ({itemAttrs, itemParams, index}) =>
				this.ctx.$createElement(c.getItemComponentName(itemParams, index), itemAttrs);

			return <HTMLElement[]>c.vdom.render(children.map(map));
		};

		const getChildrenAttrs = (props: ItemAttrs) => ({
			attrs: {
				'v-attrs': {
					...props,
					class: [this.optionClass].concat(props.class ?? []),
					style: props.style
				}
			}
		});

		const getItemEl = (data, i: number) => ({
			current: data,
			prev: totalItems[i - 1]?.data,
			next: totalItems[i + 1]?.data
		});

		const
			children: DataToRender[] = [];

		for (let i = 0; i < items.length; i++) {
			const
				item = items[i],
				itemParams = getItemEl(item.data, item.index),
				itemIndex = item.index;

			const attrs = c.getItemAttrs(getItemEl(item.data, item.index), item.index);

			// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
			children.push({itemParams, itemAttrs: getChildrenAttrs(attrs!), index: itemIndex});
		}

		const
			res = render(children);

		if (res.length === 0) {
			throw new Error('Failed to render components, possibly an error occurred while creating the components');
		}

		return res;
	}
}
