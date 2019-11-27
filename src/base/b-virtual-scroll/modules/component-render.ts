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

import { RenderItem, RenderList } from 'base/b-virtual-scroll/modules/interface';

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
	 * List of tombstones elements
	 */
	protected recycleTombstones: HTMLElement[] = [];

	/**
	 * Link to the tombstone node
	 */
	protected tombstoneToClone: CanUndef<HTMLElement>;

	/**
	 * Link to the element
	 */
	protected elementToClone: CanUndef<HTMLElement>;

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
		// @ts-ignore (access)
		return this.component.async;
	}

	/**
	 * Link to the component `$createElement` method
	 */
	protected get createElement(): bVirtualScroll['$createElement'] {
		// @ts-ignore (access)
		return this.component.$createElement.bind(this.component);
	}

	/**
	 * Link to the component `$refs`
	 */
	protected get refs(): bVirtualScroll['$refs'] {
		// @ts-ignore (access)
		return this.component.$refs;
	}

	/**
	 * Cloned tombstone
	 */
	get clonedTombstone(): CanUndef<HTMLElement> {
		return this.tombstoneToClone && this.tombstoneToClone.cloneNode(true) as HTMLElement;
	}

	/**
	 * Classname for tombstones
	 */
	get tombstoneClass(): string {
		// @ts-ignore (access)
		return this.component.block.getFullElName('tombstone-el');
	}

	/**
	 * Classname for options
	 */
	get optionClass(): string {
		// @ts-ignore (access)
		return this.component.block.getFullElName('option-el');
	}

	/**
	 * @param component
	 */
	constructor(component: bVirtualScroll) {
		this.component = component;

		// @ts-ignore (access)
		component.meta.hooks.mounted.push({
			name: 'initComponentRender',
			fn: () => {
				this.tombstoneToClone = this.getRealTombstone();
			}
		});
	}

	/**
	 * Returns a node from the cache by the specified key
	 * @param key
	 */
	getElement(key: string): CanUndef<HTMLElement> {
		return this.nodesCache[key];
	}

	/**
	 * Returns a link to the tombstone element
	 */
	getTombstone(): HTMLElement {
		const
			{component} = this;

		const
			tombstone = this.recycleTombstones.pop();

		if (tombstone) {
			component.removeMod(tombstone, 'hidden', true);
			return tombstone;
		}

		return this.createTombstone();
	}

	/**
	 * Saves the specified tombstone in the cache
	 * @param node
	 */
	recycleTombstone(node: HTMLElement): void {
		this.recycleTombstones.push(node);
	}

	/**
	 * Saves a node to the cache by the specified key
	 *
	 * @param key
	 * @param node
	 */
	cacheNode(key: string, node: HTMLElement): HTMLElement {
		if (!this.component.cacheNode) {
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
	 * Re-initializes the component render
	 */
	reInit(): Promise<void> {
		return this.async.promise<void>(new Promise((res) => {
			this.async.requestAnimationFrame(() => {
				this.tombstoneToClone = this.getRealTombstone();
				this.destroy().then(res);
			}, {label: $$.reInitRaf, group: this.asyncGroup});
		}), {label: $$.reInit, group: this.asyncGroup});
	}

	/**
	 * Renders the specified chunk of items
	 *
	 * @param list
	 * @param items
	 */
	render(list: RenderList, items: RenderItem[]): HTMLElement[] {
		const
			{cacheNode} = this.component;

		const
			indexesToAssign: number[] = [],
			needRender: [RenderItem, number][] = [],
			res: HTMLElement[] = [];

		for (let i = 0; i < list.length; i++) {
			const
				[item, index] = list[i];

			if (!item.data) {
				item.node = res[i] = this.getTombstone();
				continue;
			}

			const
				id = this.getOptionKey(item.data);

			if (cacheNode) {
				const
					node = id && this.getElement(id);

				if (node) {
					res[i] = node;
					item.node = node;
					continue;
				}
			}

			needRender.push([item, index]);
			indexesToAssign.push(i);
		}

		if (needRender.length) {
			const
				nodes = this.createComponents(needRender, items);

			for (let i = 0; i < nodes.length; i++) {
				const
					index = indexesToAssign[i];

				res[index] = nodes[i];

				if (list[index]) {
					const
						[item] = list[index],
						id = this.getOptionKey(item.data);

					this.cacheNode(id, item.node = nodes[i]);
				}
			}
		}

		return res;
	}

	/**
	 * Clears the cache of nodes
	 */
	clearCache(): void {
		if (!this.component.cacheNode) {
			return;
		}

		const
			{scrollRender} = this,
			{dropCacheSize, dropCacheSafeZone} = this.component,
			{items, scrollDirection, range} = scrollRender;

		const
			untilEnd = items.length - range.end,
			untilStart = range.start;

		if (scrollDirection === 0) {
			return;
		}

		const drop = (item) => {
			if (!item.data) {
				return;
			}

			const
				id = this.getOptionKey(item.data),
				node = this.getElement(id);

			if (!node) {
				return;
			}

			item.node = undefined;
			delete this.nodesCache[id];
		};

		const isDropped = (item: RenderItem) => {
			if (!item.data) {
				return false;
			}

			const
				key = this.getOptionKey(item.data);

			return !Boolean(this.nodesCache[key]);
		};

		const dropRange = () => {
			const
				isScrollTop = scrollDirection < 0;

			const
				safeCleanRange = dropCacheSize + dropCacheSafeZone,
				canDrop = isScrollTop ? untilEnd - safeCleanRange > 0 : untilStart > safeCleanRange;

			if (!canDrop) {
				return;
			}

			if (isScrollTop) {
				let i = items.length;

				while (i >= range.end + safeCleanRange) {
					const
						index = i - dropCacheSize;

					if (isDropped(items[index])) {
						i = index;
						continue;
					}

					for (let j = index; j < index + dropCacheSize; j++) {
						drop(items[j]);
					}

					break;
				}

			} else {
				let
					i = 0;

				const
					max = range.start - safeCleanRange;

				while (max >= i) {
					const
						index = i + dropCacheSize;

					if (isDropped(items[index])) {
						i = index;
						continue;
					}

					for (let j = index; j > i; j--) {
						drop(items[j]);
					}

					break;
				}
			}
		};

		dropRange();
		this.canDropCache = false;
	}

	/**
	 * Module destructor
	 */
	destroy(): Promise<void> {
		return this.async.promise<void>(new Promise((res) => {
			this.async.requestAnimationFrame(() => {
				const
					{nodesCache} = this;

				Object.keys(nodesCache).forEach((key) => {
					const el = nodesCache[key];
					el && el.remove();
				});

				this.recycleTombstones = [];
				this.elementToClone = undefined;
				this.nodesCache = Object.createDict();
				res();

			}, {label: $$.destroyRaf, group: this.asyncGroup});
		}), {label: $$.destroy, group: this.asyncGroup});
	}

	/**
	 * Creates a tombstone
	 */
	protected createTombstone(): HTMLElement {
		return <HTMLElement>(this.clonedTombstone);
	}

	/**
	 * Returns a real (not cloned) tombstone element
	 */
	protected getRealTombstone(): HTMLElement {
		const tombstone = <HTMLElement>this.refs.tombstone.children[0];
		tombstone.classList.add(this.tombstoneClass);
		return tombstone;
	}

	/**
	 * Creates a component by the specified params
	 *
	 * @param list - List of elements that should be rendered
	 * @param items
	 */
	protected createComponents(list: RenderList, items: RenderItem[]): HTMLElement[] {
		const
			{component: c, columns} = this;

		const render = (children: Dictionary[]) =>
			c.vdom.render(children.map((el) => this.createElement(c.option, el))) as HTMLElement[];

		const createChildren = (props) => ({
			attrs: {
				'v-attrs': {
					...props,
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

		for (let i = 0; i < list.length; i++) {
			const
				[item, index] = list[i],
				props = c.optionProps(getOptionEl(item.data, index), index);

			children.push(createChildren(props));
		}

		return render(children);
	}
}
