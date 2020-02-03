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

import { RenderItem } from 'base/b-virtual-scroll/modules/interface';
import { InitOptions } from 'core/component/directives/in-view/interface';
import { InViewAdapter, inViewFactory } from 'core/component/directives/in-view';

export const
	$$ = symbolGenerator();

export default class ScrollRender {
	/**
	 * Render items
	 */
	items: RenderItem[] = [];

	/**
	 * Last column which was intersects the viewport
	 */
	lastIntersectsItem: number = 0;

	/**
	 * Current render chunk
	 */
	chunk: number = 0;

	/**
	 * Length of items
	 */
	get itemsCount(): number {
		return this.items.length;
	}

	/**
	 * Component instance
	 */
	protected readonly component: bVirtualScroll['unsafe'];

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
		// @ts-ignore (access)
		return this.component.componentRender;
	}

	/**
	 * API for scroll data requests
	 */
	protected get scrollRequest(): ScrollRequest {
		// @ts-ignore (access)
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
			this.setRefVisibility('tombstones', true);
			this.component.waitStatus('ready', this.onReady.bind(this));
		}});
	}

	/**
	 * Re-initializes a rendering process
	 */
	reInit(): void {
		this.lastIntersectsItem = 0;
		this.chunk = 0;
		this.items = [];

		this.scrollRequest.reset();
		this.async.clearAll({group: new RegExp(this.asyncGroup)});

		this.setRefVisibility('tombstones', true);
		this.setRefVisibility('retry', false);
		this.setRefVisibility('done', false);
		this.setRefVisibility('empty', false);

		this.onReady();
	}

	/**
	 * Initializes a render items
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
			renderFrom = (chunk - 1) * component.renderPerChunk,
			renderTo = chunk * component.renderPerChunk,
			renderItems = items.slice(renderFrom, renderTo);

		if (!renderItems.length) {
			return;
		}

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
	 * Hides/shows tombstones
	 * @param show
	 */
	setRefVisibility(ref: keyof bVirtualScroll['$refs'], show: boolean): void {
		if (!this.refs.tombstones) {
			return;
		}

		const
			refEl = this.refs[ref];

		if (!refEl) {
			return;
		}

		this.component[show ? 'setMod' : 'removeMod'](refEl, 'show', true);
	}

	/**
	 * Renders a specified items
	 * @param items
	 */
	protected renderItems(items: RenderItem[]): HTMLElement[] {
		const
			nodes = this.componentRender.render(items);

		for (let i = 0; i < nodes.length; i++) {
			const
				node = nodes[i],
				item = items[i];

			if (!node[$$.inView]) {
				this.wrapInView(item);
			}
		}

		return nodes;
	}

	/**
	 * Wraps the specified node into in-view directive
	 * @param item
	 */
	protected wrapInView(item: RenderItem): void {
		const
			{component} = this,
			{node} = item,
			// @ts-ignore (access)
			label = `${this.asyncGroup}:${this.asyncInViewPrefix}${component.getOptionKey(item.data, item.index)}`;

		if (!node) {
			return;
		}

		this.InView.observe(node, this.getInViewOptions(item.index));
		node[$$.inView] = this.async.worker(() => this.InView.stopObserve(node), {group: this.asyncGroup, label});
	}

	/**
	 * Returns a render item
	 *
	 * @param data
	 * @param index
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
	 * In-view init options
	 * @param index
	 */
	protected getInViewOptions(index: number): InitOptions {
		return {
			delay: 0,
			threshold: this.randomThreshold,
			onEnter: () => this.onNodeIntersect(index)
		};
	}

	/**
	 * Handler: element becomes visible in viewport
	 * @param index
	 */
	protected onNodeIntersect(index: number): void {
		const
			{component, items} = this,
			{renderPerChunk, drawBefore} = component,
			currentRender = this.chunk * renderPerChunk;

		if (index + drawBefore + renderPerChunk >= items.length) {
			this.scrollRequest.try();
		}

		if (index > this.lastIntersectsItem) {
			this.lastIntersectsItem = index;

			if (currentRender - index <= drawBefore) {
				this.chunk++;
				this.render();
			}
		}
	}

	/**
	 * Handler: component ready
	 */
	protected onReady(): void {
		this.initItems(this.component.options);
		this.setRefVisibility('tombstones', false);

		this.chunk++;
		this.render();
	}

	/**
	 * Handler: all requests are done
	 */
	protected onRequestsDone(): void {
		this.setRefVisibility('tombstones', false);
		this.setRefVisibility('done', true);
	}
}
