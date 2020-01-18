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

export const
	$$ = symbolGenerator();

export default class ScrollRender {
	/**
	 * Range of rendered items
	 */
	range: Range<number>;

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
		this.range = new Range(0, this.component.realElementsCount);

		this.component.unsafe.meta.hooks.mounted.push({fn: () => {
			this.initEvents();
			this.updateOffset();
		}});
	}

	/**
	 * Updates top offset of the component
	 */
	updateOffset(): void {
		const
			{component: {$el}} = this;

		if (!$el) {
			return;
		}

		this.offsetTop = $el.getPosition().top;
	}

	/**
	 * Renders component content
	 */
	protected render(): CanPromise<void> {
		const
			didRangeChanged = this.didRangeChanged();

		if (!didRangeChanged && this.isCurrentRangeRendered) {
			return;
		}

		this.isCurrentRangeRendered = true;
	}

	/**
	 * Updates current range of render components
	 */
	protected didRangeChanged(): boolean {
		if (!this.isInViewport) {
			return false;
		}

		return true;
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
	 */
	protected onElementIn(): void {
		// ...
	}

	/**
	 * Handler: element leaves from viewport
	 */
	protected onElementOut(): void {
		// ...
	}

	/**
	 * Handler: element enters/leaves viewport
	 * @param enter
	 */
	protected onIntersectChange(enter: boolean): void {
		this.updateOffset();
		this.isInViewport = enter;
	}

	/**
	 * Handler: all requests are done
	 */
	protected onRequestsDone(): void {
		// ...
	}
}
