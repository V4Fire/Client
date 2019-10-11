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

import ScrollRender, { RenderItem } from 'base/b-virtual-scroll/modules/scroll-render';
import bVirtualScroll from 'base/b-virtual-scroll/b-virtual-scroll';

export const
	$$ = symbolGenerator();

export interface RecycleComponent<T extends unknown = unknown> {
	node: HTMLElement;
	id: string;
	data: T;
}

export default class ComponentRender {
	/**
	 * Link to component
	 */
	protected component: bVirtualScroll;

	/**
	 * ...
	 */
	protected canDropCache: boolean = false;

	/**
	 * Last dropped cache
	 */
	protected lastDroppedIndex: number = 0;

	/**
	 * Rendered elements store
	 */
	protected nodesCache: Dictionary<HTMLElement> = {};

	/**
	 * Tombstones elements
	 */
	protected tombstones: HTMLElement[] = [];

	/**
	 * Link to tombstone DOM element
	 */
	protected tombstoneToClone: CanUndef<HTMLElement>;

	/**
	 * Return a scroll render module
	 */
	protected get scrollRender(): ScrollRender {
		// @ts-ignore (access)
		return this.component.scrollRender;
	}

	/**
	 * Link to async module
	 */
	protected get async(): Async<bVirtualScroll> {
		// @ts-ignore (access)
		return this.component.async;
	}

	/**
	 * Link to component create element method
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
	 * Link to component refs
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

		const
			{async: $a} = this;

		$a.on(document, 'scroll', () => {
			if (this.canDropCache) {
				$a.requestIdleCallback(this.dropCache.bind(this), {
					label: $$.dropCacheIdle,
					join: true
				});

			}
		}, {label: $$.componentRenderScroll});
	}

	/**
	 * Returns a VNode
	 * @param key
	 */
	getElement(key: string): CanUndef<HTMLElement> {
		return this.nodesCache[key];
	}

	/**
	 * Save a specified VNode
	 *
	 * @param key
	 * @param node
	 */
	saveElement(key: string, node: HTMLElement): HTMLElement {
		this.nodesCache[key] = node;

		const
			{nodesCache, scrollRender} = this,
			{cacheSize} = this.component,
			keys = Object.keys(nodesCache);

		if (keys.length > cacheSize) {
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
	 * Renders a new VNode
	 *
	 * @param data - component data
	 * @param item
	 * @param i - position in list
	 */
	render(data: unknown, item: RecycleComponent, i: number): CanUndef<HTMLElement> {
		const
			{cacheNode} = this.component,
			id = this.getOptionKey(data);

		if (cacheNode) {
			const node = id && this.getElement(id);

			if (node) {
				item.node = node;
				return node;

			} else {
				return (item.node = this.createComponent(data, i));
			}
		}

		return;
	}

	/**
	 * Returns a tombstone
	 */
	getTombstone(): HTMLElement {
		const
			{component} = this,
			tombstone = this.tombstones.pop();

		if (tombstone) {
			tombstone.classList.remove(`${component.componentName}__el_display_none`);

			tombstone.style.transform = 'translate3d(0, 0, 0)';
			tombstone.style.transition = '';
			tombstone.style.opacity = String(1);

			return tombstone;
		}

		return this.createTombstone();
	}

	/**
	 * Saves the specified tombstone in cache
	 */
	saveTombstone(node: HTMLElement): void {
		this.tombstones.push(node);
	}

	/**
	 * Reinitializes component render
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

				this.tombstones = [];
				this.nodesCache = {};
				res();

			}, {label: $$.destroyRaf});
		}), {label: $$.destroy});
	}

	/**
	 * Drops cached nodes
	 */
	protected dropCache(): void {
		const
			{scrollRender} = this,
			{cacheSize, dropCacheSize, dropCacheSafeZone} = this.component,
			{items, scrollDirection, range} = scrollRender;

		const
			untilEnd = items.length - range.end,
			untilStart = range.start;

		if (scrollDirection === 0) {
			this.canDropCache = true;
			return;
		}

		const drop = (item) => {
			if (!item.data) {
				return;
			}

			const
				id = this.getOptionKey(item.data),
				el = this.nodesCache[id];

			item.node = undefined;
			el && el.remove();
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
	 * @param [el]
	 */
	protected createTombstone(el?: HTMLElement): HTMLElement {
		const
			{component} = this,
			tombstone = <HTMLElement>(el || this.clonedTombstone);

		tombstone.classList.add(`${component.componentName}__tombstone-el`);
		return tombstone;
	}

	/**
	 * Creates a component by specified params
	 *
	 * @param data
	 * @param i - position in list
	 */
	protected createComponent(data: unknown, i: number): HTMLElement {
		const
			{component} = this,
			id = this.getOptionKey(data);

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

		const node = <HTMLElement>this.component.vdom.render(this.$createElement(this.component.option, renderOpts));
		return this.saveElement(id, node);
	}
}
