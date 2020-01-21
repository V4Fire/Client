/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Async from 'core/async';
import symbolGenerator from 'core/symbol';
import Range from 'core/range';

import bVirtualScroll, { $$ as componentLabels } from 'base/b-virtual-scroll/b-virtual-scroll';
import ComponentRender from 'base/b-virtual-scroll/modules/component-render';
import ScrollRequest from 'base/b-virtual-scroll/modules/scroll-request';

import { RenderItem } from 'base/b-virtual-scroll/modules/interface';
import { InitOptions, Observable, Size } from 'core/component/directives/in-view/interface';

export const
	$$ = symbolGenerator();

export default class ScrollRender {
	/**
	 * Range of rendered items
	 */
	renderRange: Range<number> = new Range(0, 0);

	/**
	 * Range of visible items
	 */
	visibleRange: Range<number> = new Range(0, 0);

	/**
	 * Render items
	 */
	items: RenderItem[] = [];

	/**
	 * Length of items
	 */
	get itemsCount(): number {
		return this.items.length;
	}

	/**
	 * Element top offset
	 */
	protected offsetTop: number = 0;

	/**
	 * True if an element is in viewport
	 */
	protected isInViewport: boolean = false;

	/**
	 * True if current range was rendered
	 */
	protected isCurrentRangeRendered: boolean = false;

	/**
	 * Current scroll direction
	 */
	protected scrollDirection: 0 | 1 | -1 = 0;

	/**
	 * Component instance
	 */
	protected readonly component: bVirtualScroll['unsafe'];

	/**
	 * Async group
	 */
	protected readonly asyncGroup: string = 'scroll-render:';

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
	 * Link to the scroll emitter
	 */
	protected get scrollEmitter(): HTMLElement {
		// @ts-ignore (access)
		return this.component.scrollEmitter;
	}

	/**
	 * @param component
	 */
	constructor(component: bVirtualScroll) {
		this.component = component.unsafe;
		this.component.meta.hooks.mounted.push({fn: () => {
			this.onMounted();
			this.component.waitStatus('ready', this.onReady.bind(this));
		}});
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
	protected render(): void {
		const
			{renderRange} = this,
			newRenderRange = this.calculateRenderRange();

		if (this.scrollDirection !== 0 &&
			newRenderRange.start === renderRange.start &&
			newRenderRange.end === renderRange.end) {
			return;
		}

		this.clearRange(newRenderRange);
		this.appendRange(newRenderRange);
	}

	/**
	 * Renders a specified items
	 * @param range
	 */
	protected renderItems(range: Range<number>): HTMLElement[] {
		const
			items = this.items.slice(range.start, range.end),
			nodes = this.componentRender.render(items, this.getInViewOptions.bind(this));

		return nodes;
	}

	/**
	 * Updates current range of render components
	 */
	protected calculateRenderRange(): Range<number> {
		const
			{renderRange, visibleRange, component} = this,
			{start: oldRenderStart, end: oldRenderEnd} = renderRange,
			newRenderRange = new Range<number>(oldRenderStart, oldRenderEnd);

		if (this.scrollDirection > 0) {
			if (visibleRange.end + component.drawBefore >= oldRenderEnd) {
				renderRange.end = oldRenderEnd + component.renderPerChunk;

				newRenderRange.start = oldRenderEnd;
				newRenderRange.end = renderRange.end;
			}

		} else if (this.scrollDirection < 0) {
			// Scrolls to top

		} else {
			renderRange.start = newRenderRange.start = 0;
			renderRange.end = newRenderRange.end = component.renderPerChunk;
		}

		return newRenderRange;
	}

	/**
	 * Appends new items to the container
	 * @param range
	 */
	protected appendRange(range: Range<number>): void {
		const
			nodes = this.renderItems(range);

		if (!nodes.length) {
			return;
		}

		const
			fragment = document.createDocumentFragment();

		for (let i = 0; i < nodes.length; i++) {
			this.dom.appendChild(fragment, nodes[i], this.asyncGroup);
		}

		this.refs.container.appendChild(fragment);
	}

	/**
	 * Clears old nodes from render range
	 * @param range
	 */
	protected clearRange(range: Range<number>): void {
		// ...
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
			width: 0,
			height: 0,
			index: this.itemsCount + index,
			node: undefined,
			destructor: undefined
		};
	}

	/**
	 * Hides tombstones
	 * @param show
	 */
	protected setTombstoneVisibility(show: boolean): void {
		this.component[show ? 'removeMod' : 'setMod']('tombstones-hidden', true);
	}

	/**
	 * Sets size to the specified item
	 *
	 * @param item
	 * @param size
	 */
	protected setItemSize(item: RenderItem, size: Size): void {
		item.width = size.width;
		item.height = size.height;
	}

	/**
	 * In-view init options
	 * @param item
	 */
	protected getInViewOptions(item: RenderItem): InitOptions {
		return {
			delay: 0,
			threshold: Math.floor((Math.random() * (0.06 - 0.01) + 0.01) * 100) / 100,
			onEnter: (observable) => this.onNodeVisibilityChange(observable, item, true),
			onLeave: (observable) => this.onNodeVisibilityChange(observable, item, false)
		};
	}

	/**
	 * Initializes events
	 */
	protected initEvents(): void {
		this.async.on(this.scrollEmitter, 'scroll', this.onScroll.bind(this), {
			label: $$.scroll,
			group: this.asyncGroup
		});
	}

	/**
	 * Handler: container resize
	 */
	protected onResize(): void {
		this.async.setTimeout(() => {
			// ...
		}, 100, {label: $$.onResize});
	}

	/**
	 * Handler: document being scrolled
	 */
	protected onScroll(): void {
		// ...
	}

	/**
	 * Handler: element becomes visible in viewport
	 *
	 * @param observable
	 * @param item
	 * @param enter
	 */
	protected onNodeVisibilityChange({size}: Observable, item: RenderItem, enter: boolean): void {
		const
			{visibleRange} = this;

		if (enter) {
			if (item.index > visibleRange.end) {
				visibleRange.end = item.index;
				this.scrollDirection = 1;

			} else if (item.index < visibleRange.start) {
				visibleRange.start = item.index;
				this.scrollDirection = -1;
			}

		} else {
			if (visibleRange.start === item.index) {
				if (visibleRange.end === 0) {
					visibleRange.start = 0;

				} else {
					visibleRange.start++;
				}

				this.scrollDirection = 1;

			} else if (visibleRange.end === item.index) {
				visibleRange.end--;
				this.scrollDirection = -1;
			}
		}

		this.scrollRequest.try();
		this.setItemSize(item, size);
		this.render();
	}

	/**
	 * Handler: component mounted hook
	 */
	protected onMounted(): void {
		this.initEvents();
	}

	/**
	 * Handler: component ready
	 */
	protected onReady(): void {
		this.initItems(this.component.options);
		this.setTombstoneVisibility(false);
		this.render();
	}

	/**
	 * Handler: all requests are done
	 */
	protected onRequestsDone(): void {
		this.setTombstoneVisibility(false);
	}
}
