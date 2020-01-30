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
		// ...
	}

	/**
	 * Renders a specified items
	 */
	protected renderItems(): HTMLElement[] {
		// ...
	}

	/**
	 * Appends new items to the container
	 */
	protected appendRange(): void {
		// ...
	}

	/**
	 * Clears old nodes from render range
	 */
	protected clearRange(): void {
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
			mounted: false,
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
	 * In-view init options
	 * @param index
	 */
	protected getInViewOptions(index: number): InitOptions {
		return {
			delay: 0,
			threshold: Math.floor((Math.random() * (0.06 - 0.01) + 0.01) * 100) / 100,
			onEnter: () => this.onNodeVisibilityChange(index, true),
			onLeave: () => this.onNodeVisibilityChange(index, false)
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
	 * @param index
	 * @param enter
	 */
	protected onNodeVisibilityChange(index: number, enter: boolean): void {
		// ...
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
