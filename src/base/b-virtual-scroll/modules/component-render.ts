/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import symbolGenerator from 'core/symbol';

import { Friend } from 'super/i-block/i-block';

import ScrollRender from 'base/b-virtual-scroll/modules/chunk-render';
import bVirtualScroll from 'base/b-virtual-scroll/b-virtual-scroll';

import { RenderItem, DataToRender, OptionEl } from 'base/b-virtual-scroll/modules/interface';

export const
	$$ = symbolGenerator();

export default class ComponentRender extends Friend {
	/* @override */
	// @ts-ignore
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
	 * Link to the component $createElement method
	 */
	protected get createElement(): bVirtualScroll['$createElement'] {
		return this.ctx.$createElement.bind(this.ctx);
	}

	/**
	 * Classname for options
	 */
	get optionClass(): string {
		return this.ctx.block.getFullElName('option-el');
	}

	/**
	 * Re-initializes component render
	 */
	reInit(): void {
		Object.keys(this.nodesCache).forEach((key) => {
			const el = this.nodesCache[key];
			el && el.remove();
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

	/** @see bVirtualScroll.getOptionKey */
	getOptionKey(data: unknown, index: number): string {
		return String(this.ctx.getOptionKey(data, index));
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
			needRender: [RenderItem, number][] = [];

		for (let i = 0; i < items.length; i++) {
			const
				item = items[i];

			if (item.node) {
				res[i] = item.node;
				continue;
			}

			if (canCache) {
				const
					key = this.getOptionKey(item.data, item.index),
					node = key && this.getCachedComponent(key);

				if (node) {
						res[i] = node;
						item.node = node;
						continue;
				}
			}

			needRender.push([item, i]);
		}

		if (needRender.length) {
			const
				nodes = this.createComponents(needRender.map(([item]) => item));

			for (let i = 0; i < needRender.length; i++) {
				const
					item = needRender[i][0],
					indexesToAssign = needRender[i][1],
					node = nodes[i],
					key = this.getOptionKey(item.data, item.index);

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

		const getOption = (itemParas: OptionEl, index: number) =>
			Object.isFunction(c.option) ? c.option(itemParas, index) : c.option;

		const render = (childrens: DataToRender[]) =>
			c.vdom.render(childrens.map(({itemAttrs, itemParams, index}) =>
				this.createElement(getOption(itemParams, index), itemAttrs))) as HTMLElement[];

		const getChildrenAttrs = (props) => ({
			attrs: {
				'v-attrs': {
					...props,
					class: [this.optionClass].concat(props.class || []),
					style: {
						...props.style
					}
				}
			}
		});

		const getItemEl = (data, i: number) => ({
			current: data,
			prev: totalItems[i - 1] && totalItems[i - 1].data,
			next: totalItems[i + 1] && totalItems[i + 1].data
		});

		const
			children: DataToRender[] = [];

		for (let i = 0; i < items.length; i++) {
			const
				item = items[i],
				itemParams = getItemEl(item.data, item.index),
				itemIndex = item.index;

			const
				attrs = Object.isFunction(c.optionProps) ? c.optionProps(getItemEl(item.data, item.index), item.index, {
					ctx: c,
					key: this.getOptionKey(item.data, item.index)
				}) : c.optionProps;

			children.push({itemParams, itemAttrs: getChildrenAttrs(attrs), index: itemIndex});
		}

		return render(children);
	}
}
