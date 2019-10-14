/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Async from 'core/async';
import symbolGenerator from 'core/symbol';
import { VNodeData } from 'core/component/engines';

import iBlock from 'super/i-block/i-block';
import ScrollRender from 'base/b-virtual-scroll/modules/scroll-render';
import bVirtualScroll from 'base/b-virtual-scroll/b-virtual-scroll';

import { RecycleComponent, RenderItem, RenderParams } from 'base/b-virtual-scroll/modules/interface';

export const
	$$ = symbolGenerator();

export default class ComponentRender {
	/**
	 * Link to component
	 */
	protected component: bVirtualScroll;

	/**
	 * If true, the cache flushing process is not currently running
	 */
	protected canDropCache: boolean = false;

	/**
	 * Rendered items cache
	 */
	protected nodesCache: Dictionary<HTMLElement> = {};

	/**
	 * Tombstones elements
	 */
	protected recycleTombstones: HTMLElement[] = [];

	/**
	 * Recycle elements
	 */
	protected recycleNodes: HTMLElement[] = [];

	/**
	 * Link to the tombstone node
	 */
	protected tombstoneToClone: CanUndef<HTMLElement>;

	/**
	 * Link to the element
	 */
	protected elementToClone: CanUndef<HTMLElement>;

	/**
	 * Option context
	 */
	protected optionCtx: CanUndef<iBlock>;

	/**
	 * Link to the scroll render module
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
	 * Link to the component create element method
	 */
	protected get $createElement(): bVirtualScroll['$createElement'] {
		// @ts-ignore (acccess)
		return this.component.$createElement.bind(this.component);
	}

	/**
	 * Cloned tombstone
	 */
	protected get clonedTombstone(): CanUndef<HTMLElement> {
		return this.tombstoneToClone && this.tombstoneToClone.cloneNode(true) as HTMLElement;
	}

	/**
	 * Cloned element
	 */
	protected get clonedElement(): CanUndef<HTMLElement> {
		return this.elementToClone && this.elementToClone.cloneNode(true) as HTMLElement;
	}

	/**
	 * Link to the component refs
	 */
	protected get $refs(): bVirtualScroll['$refs'] {
		// @ts-ignore (access)
		return this.component.$refs;
	}

	/**
	 * @param ctx
	 */
	constructor(ctx: bVirtualScroll) {
		this.component = ctx;
		this.tombstoneToClone = <HTMLElement>this.$refs.tombstone.children[0];
	}

	/**
	 * Returns a node from cache by the specified key
	 * @param key
	 */
	getElement(key: string): CanUndef<HTMLElement> {
		return this.nodesCache[key];
	}

	/**
	 * Saves the specified node
	 *
	 * @param key
	 * @param node
	 */
	cacheNode(key: string, node: HTMLElement): HTMLElement {
		this.nodesCache[key] = node;

		const
			{nodesCache} = this,
			{cacheSize} = this.component,
			keys = Object.keys(nodesCache);

		if (keys.length > cacheSize) {
			this.canDropCache = true;
		}

		return node;
	}

	/**
	 * Saves an element for recycle later
	 * @param node
	 */
	recycleNode(node: HTMLElement): void {
		this.recycleNodes.push(node);
	}

	/** @see bVirtualScroll.getOptionKey */
	getOptionKey(data: unknown): string {
		// @ts-ignore (access)
		return this.component.getOptionKey(data);
	}

	/**
	 * Renders a new node
	 *
	 * @param data - component data
	 * @param item
	 * @param i - position in list
	 */
	render(data: unknown, item: RecycleComponent, i: number): CanUndef<HTMLElement> {
		const
			{cacheNode} = this.component,
			id = this.getOptionKey(data);

		const create = () => item.node = this.createComponent(data, i);

		if (cacheNode) {
			const node = id && this.getElement(id);

			if (node) {
				item.node = node;
				return node;

			} else {
				return create();
			}
		}

		return create();
	}

	/**
	 * Returns a tombstone
	 */
	getTombstone(): HTMLElement {
		const
			{component} = this,
			tombstone = this.recycleTombstones.pop();

		if (tombstone) {
			component.removeMod(tombstone, 'hidden', true);

			tombstone.style.transform = 'translate3d(0, 0, 0)';
			tombstone.style.opacity = String(1);

			return tombstone;
		}

		return this.createTombstone();
	}

	/**
	 * Saves the specified tombstone in cache
	 */
	cacheTombstone(node: HTMLElement): void {
		this.recycleTombstones.push(node);
	}

	/**
	 * Re-initializes the component render
	 */
	reInit(): Promise<void> {
		return this.async.promise<void>(new Promise((res) => {
			this.async.requestAnimationFrame(() => {
				this.tombstoneToClone = <HTMLElement>this.$refs.tombstone.children[0];
				this.destroy().then(res);

			}, {label: $$.reInitRaf});

		}), {label: $$.reInit});
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
				this.recycleTombstones = [];
				this.elementToClone = undefined;
				this.nodesCache = {};
				res();

			}, {label: $$.destroyRaf});
		}), {label: $$.destroy});
	}

	/**
	 * Drops cached nodes
	 */
	dropCache(): void {
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

			this.recycleNode(node);
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
	 * Creates a tombstone
	 */
	protected createTombstone(): HTMLElement {
		const
			{component} = this,
			tombstone = <HTMLElement>(this.clonedTombstone);

		tombstone.classList.add(`${component.componentName}__tombstone-el`);
		return tombstone;
	}

	/**
	 * Creates a component by the specified params
	 *
	 * @param data
	 * @param i - position in list
	 */
	protected createComponent(data: unknown, i: number): HTMLElement {
		const
			{component, recycleNodes} = this,
			id = this.getOptionKey(data),
			node = recycleNodes.pop() || this.clonedElement;

		if (node && component.recycleFn) {
			const res = component.recycleFn(this.getRenderFnParams(node, data, i));
			return this.cacheNode(id, res);

		} else {
			const
				props = component.optionProps && component.optionProps(data, i) || {},
				attrs = component.optionAttrs && component.optionAttrs(data, i) || {};

			const renderOpts: VNodeData = {
				...attrs,

				props: {
					dispatching: true,
					...props
				},

				style: {
					width: `${(100 / component.columns)}%`,
					height: component.optionHeight ? component.optionHeight.px : '',
					...<Dictionary>attrs.style
				},

				staticClass: [`${this.component.componentName}__option-el`].concat(attrs.staticClass || '').join(' ')
			};

			let res = <HTMLElement>this.component.vdom.render(this.$createElement(this.component.option, renderOpts));

			if (component.recycleFn && !this.elementToClone) {
				this.elementToClone = res;
				res = component.recycleFn(this.getRenderFnParams(res, data, i));
			}

			if (!this.optionCtx) {
				// @ts-ignore (access)
				this.optionCtx = res.component;
			}

			return this.cacheNode(id, res);
		}
	}

	/**
	 * Returns a render params
	 */
	protected getRenderFnParams(node: HTMLElement, data: unknown, i: number): RenderParams {
		return {
			optionCtx: this.optionCtx,
			ctx: this.component,
			node,
			data,
			i
		};
	}
}
