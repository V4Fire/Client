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
			{cacheSize} = this.component,
			length = Object.keys(this.nodesCache).length;

		if (length > cacheSize) {
			// this.dropCache(); // TODO: Дропнуть кэш
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
		return this.async.promise<void>(new Promise((res, rej) => {
			const
				{nodesCache} = this;

			this.async.requestAnimationFrame(() => {
				Object.keys(nodesCache).forEach((key) => {
					const el = nodesCache[key];
					el && el.remove();
				});

				this.nodesCache = {};
				this.tombstoneToClone = <HTMLElement>this.$refs.tombstone.children[0];
				res();

			}, {label: $$.reInitRaf});

		}), {label: $$.reInit});
	}

	/**
	 * Drops all render cache
	 */
	dropCache(): Promise<void> {
		this.tombstones = [];
		return this.reInit();
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

		const props = component.optionProps ? component.optionProps(data, i) : {};

		const renderOpts: VNodeData = {
			props: {
				dispatching: true,
				...props
			},

			style: {
				width: `${(100 / component.columns)}%`,
				height: component.optionHeight ? component.optionHeight.px : ''
			},

			staticClass: `${this.component.componentName}__option-el`
		};

		const node = <HTMLElement>this.component.vdom.render(this.$createElement(this.component.option, renderOpts));
		return this.saveElement(id, node);
	}
}
