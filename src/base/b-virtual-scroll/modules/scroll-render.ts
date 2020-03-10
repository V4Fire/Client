/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Async from 'core/async';
import symbolGenerator from 'core/symbol';

import bVirtualScroll from 'base/b-virtual-scroll/b-virtual-scroll';
import ComponentRender from 'base/b-virtual-scroll/modules/component-render';
import ScrollRequest from 'base/b-virtual-scroll/modules/scroll-request';

import { InitOptions } from 'core/component/directives/in-view/interface';
import { InViewAdapter, inViewFactory } from 'core/component/directives/in-view';
import { RenderItem, UnsafeScrollRender } from 'base/b-virtual-scroll/modules/interface';

export const
	$$ = symbolGenerator();

export default class ScrollRender {
	/**
	 * Render items
	 */
	items: RenderItem[] = [];

	/**
	 * Index of the last element that intersects the viewport
	 */
	lastIntersectsItem: number = 0;

	/**
	 * Chunk number of the current render
	 */
	chunk: number = 0;

	/**
	 * Last rendered range
	 */
	lastRenderRange: number[] = [0, 0];

	/**
	 * Component instance
	 */
	readonly component: bVirtualScroll['unsafe'];

	/**
	 * Number of items
	 */
	get itemsCount(): number {
		return this.items.length;
	}

	/**
	 * API to unsafe invoke of internal properties of the component
	 */
	get unsafe(): UnsafeScrollRender & this {
		return <any>this;
	}

	/**
	 * Async group
	 */
	protected readonly asyncGroup: string = 'scroll-render:';

	/**
	 * Async in-view label prefix
	 */
	protected readonly asyncInViewPrefix: string = 'in-view:';

	/**
	 * Local in-view instance
	 */
	protected readonly InView: InViewAdapter = inViewFactory();

	/**
	 * API for dynamic component rendering
	 */
	protected get componentRender(): ComponentRender {
		return this.component.componentRender;
	}

	/**
	 * API for scroll data requests
	 */
	protected get scrollRequest(): ScrollRequest {
		return this.component.scrollRequest;
	}

	/**
	 * Async instance
	 */
	protected get async(): Async<bVirtualScroll> {
		return this.component.async;
	}

	/**
	 * API for component DOM operations
	 */
	protected get dom(): bVirtualScroll['dom'] {
		return this.component.dom;
	}

	/**
	 * Link to the component refs
	 */
	protected get refs(): bVirtualScroll['$refs'] {
		return this.component.$refs;
	}

	/**
	 * Returns a random threshold number
	 */
	protected get randomThreshold(): number {
		return Math.floor((Math.random() * (0.06 - 0.01) + 0.01) * 100) / 100;
	}

	/**
	 * @param component
	 */
	constructor(component: bVirtualScroll) {
		this.component = component.unsafe;

		this.component.meta.hooks.mounted.push({fn: () => {
			this.setLoadersVisibility(true);
			this.async.once(this.component.localEvent, 'initOptions', this.onReady.bind(this), {label: $$.reInit});
		}});
	}

	/**
	 * Re-initializes a rendering process
	 */
	reInit(): void {
		this.lastIntersectsItem = 0;
		this.lastRenderRange = [0, 0];
		this.chunk = 0;
		this.items = [];

		this.scrollRequest.reset();
		this.async.clearAll({group: new RegExp(this.asyncGroup)});

		this.setLoadersVisibility(true);
		this.setRefVisibility('retry', false);
		this.setRefVisibility('done', false);
		this.setRefVisibility('empty', false);

		this.async.once(this.component.localEvent, 'initOptions', this.onReady.bind(this), {label: $$.reInit});
	}

	/**
	 * Initializes render items
	 * @param data
	 */
	initItems(data: unknown[]): void {
		this.items = this.items.concat(data.map(this.createRenderItem.bind(this)));
	}

	/**
	 * Renders component content
	 */
	render(): void {
		const
			{component, chunk, items} = this;

		const
			renderFrom = (chunk - 1) * component.chunkSize,
			renderTo = chunk * component.chunkSize,
			renderItems = items.slice(renderFrom, renderTo);

		if (
			renderFrom === this.lastRenderRange[0] &&
			renderTo === this.lastRenderRange[1] ||
			!renderItems.length
		) {
			return;
		}

		this.chunk++;
		this.lastRenderRange = [renderFrom, renderTo];

		const
			nodes = this.renderItems(renderItems);

		if (!nodes) {
			return;
		}

		const
			fragment = document.createDocumentFragment();

		for (let i = 0; i < nodes.length; i++) {
			this.dom.appendChild(fragment, nodes[i], this.asyncGroup);
		}

		this.async.requestAnimationFrame(() => {
			this.refs.container.appendChild(fragment);
		}, {group: this.asyncGroup});
	}

	/**
	 * Hides or shows the specified ref
	 *
	 * @param ref
	 * @param show
	 */
	setRefVisibility(ref: keyof bVirtualScroll['$refs'], show: boolean): void {
		const
			refEl = this.refs[ref];

		if (!refEl) {
			return;
		}

		refEl.style.display = show ? '' : 'none';
	}

	/**
	 * Hides or shows refs to the loader and tombstones
	 * @param show
	 */
	setLoadersVisibility(show: boolean): void {
		this.setRefVisibility('tombstones', show);
		this.setRefVisibility('loader', show);
	}

	/**
	 * Renders the specified items
	 * @param items
	 */
	protected renderItems(items: RenderItem[]): HTMLElement[] {
		const
			nodes = this.componentRender.render(items);

		for (let i = 0; i < nodes.length; i++) {
			const
				node = nodes[i],
				item = items[i];

			item.node = node;

			if (!node[$$.inView]) {
				this.wrapInView(item);
			}
		}

		return nodes;
	}

	/**
	 * Wraps the specified item node with an in-view directive
	 * @param item
	 */
	protected wrapInView(item: RenderItem): void {
		const
			{component} = this,
			{node} = item,
			label = `${this.asyncGroup}:${this.asyncInViewPrefix}${component.getOptionKey(item.data, item.index)}`;

		if (!node) {
			return;
		}

		this.InView.observe(node, this.getInViewOptions(item.index));
		node[$$.inView] = this.async.worker(() => this.InView.stopObserve(node), {group: this.asyncGroup, label});
	}

	/**
	 * Returns a render item by the specified parameters
	 *
	 * @param data - data to render in item
	 * @param index - index of the item
	 */
	protected createRenderItem(data: unknown, index: number): RenderItem {
		return {
			data,
			index: this.itemsCount + index,
			node: undefined,
			destructor: undefined
		};
	}

	/**
	 * Returns options to initialize in-view
	 * @param index
	 */
	protected getInViewOptions(index: number): InitOptions {
		return {
			delay: 0,
			threshold: this.randomThreshold,
			once: !this.component.clearNodes,
			onEnter: () => this.onNodeIntersect(index)
		};
	}

	/**
	 * Handler: element becomes visible in the viewport
	 * @param index
	 */
	protected onNodeIntersect(index: number): void {
		const
			{component, items} = this,
			{chunkSize, renderGap} = component,
			currentRender = this.chunk * chunkSize;

		if (index + renderGap + chunkSize >= items.length) {
			this.scrollRequest.try();
		}

		if (index > this.lastIntersectsItem) {
			this.lastIntersectsItem = index;

			if (currentRender - index <= renderGap) {
				this.render();
			}
		}
	}

	/**
	 * Handler: component ready
	 */
	protected onReady(): void {
		this.initItems(this.component.options);
		this.setLoadersVisibility(false);

		this.chunk++;
		this.render();
	}

	/**
	 * Handler: all requests are done
	 */
	protected onRequestsDone(): void {
		this.setLoadersVisibility(false);
		this.setRefVisibility('done', true);
	}
}
