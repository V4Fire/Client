/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Async from 'core/async';
import symbolGenerator from 'core/symbol';

import ScrollRender from 'base/b-virtual-scroll/modules/scroll-render';
import bVirtualScroll from 'base/b-virtual-scroll/b-virtual-scroll';

import { RenderItem } from 'base/b-virtual-scroll/modules/interface';
import { InitOptions } from 'core/component/directives/in-view/interface';

export const
	$$ = symbolGenerator();

export default class ComponentRender {
	/**
	 * Async group
	 */
	readonly asyncGroup: string = 'component-render';

	/**
	 * Component instance
	 */
	protected component: bVirtualScroll;

	/**
	 * If false, the cache flushing process is not currently running
	 */
	protected canDropCache: boolean = false;

	/**
	 * Rendered items cache
	 */
	protected nodesCache: Dictionary<HTMLElement> = Object.createDict();

	/**
	 * Number of columns
	 */
	protected get columns(): number {
		return this.component.axis === 'y' ? this.component.columns : 1;
	}

	/**
	 * API for scroll rendering
	 */
	protected get scrollRender(): ScrollRender {
		// @ts-ignore (access)
		return this.component.scrollRender;
	}

	/**
	 * Async instance
	 */
	protected get async(): Async<bVirtualScroll> {
		return this.component.unsafe.async;
	}

	/**
	 * Link to the component $createElement method
	 */
	protected get createElement(): bVirtualScroll['$createElement'] {
		return this.component.unsafe.$createElement.bind(this.component);
	}

	/**
	 * Link to the component $refs
	 */
	protected get refs(): bVirtualScroll['$refs'] {
		return this.component.unsafe.$refs;
	}

	/**
	 * Classname for options
	 */
	get optionClass(): string {
		return this.component.unsafe.block.getFullElName('option-el');
	}

	/**
	 * @param component
	 */
	constructor(component: bVirtualScroll) {
		this.component = component;
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
		if (!this.component.cacheNodes) {
			return node;
		}

		this.nodesCache[key] = node;

		const
			{nodesCache, component: {cacheSize}} = this;

		if (Object.keys(nodesCache).length > cacheSize) {
			this.canDropCache = true;
		}

		return node;
	}

	/** @see bVirtualScroll.getOptionKey */
	getOptionKey(data: unknown): string {
		// @ts-ignore (access)
		return this.component.getOptionKey(data);
	}

	/**
	 * Renders the specified chunk of items
	 * @param items
	 * @param inViewOptions
	 */
	render(items: RenderItem[], inViewOptions: (item: RenderItem) => InitOptions): HTMLElement[] {
		const
			{cacheNodes} = this.component;

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

			if (cacheNodes) {
				const
					key = this.getOptionKey(item.data),
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
				nodes = this.createComponents(needRender.map(([item]) => item), inViewOptions);

			for (let i = 0; i < needRender.length; i++) {
				const
					item = needRender[i][0],
					indexesToAssign = needRender[i][1],
					node = nodes[i],
					key = this.getOptionKey(item.data);

				if (cacheNodes) {
					this.cacheNode(key, item.node = node);
				}

				res[indexesToAssign] = node;
			}
		}

		return res;
	}

	/**
	 * Creates a component by the specified params
	 *
	 * @param items
	 * @param inViewOptions
	 */
	protected createComponents(items: RenderItem[], inViewOptions: (item: RenderItem) => InitOptions): HTMLElement[] {
		const
			{component: c, columns} = this;

		const render = (childrens: Dictionary[]) =>
			c.vdom.render(childrens.map((el) => this.createElement(c.option, el))) as HTMLElement[];

		const createChildren = (props, item) => ({
			attrs: {
				'v-attrs': {
					...props,
					['v-in-view']: props['v-in-view'] ? [inViewOptions(item)].concat(props['v-in-view']) : inViewOptions(item),
					class: [this.optionClass].concat(props.class || []),
					style: {
						width: `${(100 / columns)}%`,
						...props.style
					}
				}
			}
		});

		const getOptionEl = (data, i: number) => ({
			current: data,
			prev: items[i - 1] && items[i - 1].data,
			next: items[i + 1] && items[i + 1].data
		});

		const
			children: Dictionary[] = [];

		for (let i = 0; i < items.length; i++) {
			const
				item = items[i],
				props = c.optionProps(getOptionEl(item.data, item.index), item.index);

			children.push(createChildren(props, item));
		}

		return render(children);
	}
}
