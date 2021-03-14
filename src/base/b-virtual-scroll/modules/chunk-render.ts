/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import symbolGenerator from 'core/symbol';

import { InViewAdapter, InViewInitOptions, inViewFactory } from 'core/dom/in-view';

import { Friend } from 'super/i-block/i-block';
import type bVirtualScroll from 'base/b-virtual-scroll/b-virtual-scroll';

import type ComponentRender from 'base/b-virtual-scroll/modules/component-render';
import type ChunkRequest from 'base/b-virtual-scroll/modules/chunk-request';

import type { RenderItem } from 'base/b-virtual-scroll/interface';

export const
	$$ = symbolGenerator();

export default class ChunkRender extends Friend {
	/* @override */
	readonly C!: bVirtualScroll;

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
	 * Async group
	 */
	readonly asyncGroup: string = 'scroll-render:';

	/**
	 * Number of items
	 */
	get itemsCount(): number {
		return this.items.length;
	}

	/**
	 * Async in-view label prefix
	 */
	protected readonly asyncInViewPrefix: string = 'in-view:';

	/**
	 * Local in-view instance
	 */
	protected readonly InView: InViewAdapter = inViewFactory();

	/**
	 * Refs state update map
	 */
	protected refsUpdateMap: Map<keyof bVirtualScroll['$refs'], boolean> = new Map();

	/**
	 * API for dynamic component rendering
	 */
	protected get componentRender(): ComponentRender {
		return this.ctx.componentRender;
	}

	/**
	 * API for scroll data requests
	 */
	protected get chunkRequest(): ChunkRequest {
		return this.ctx.chunkRequest;
	}

	/**
	 * Returns a random threshold number
	 */
	protected get randomThreshold(): number {
		return Math.floor((Math.random() * (0.06 - 0.01) + 0.01) * 100) / 100;
	}

	/** @override */
	constructor(component: any) {
		super(component);
		this.component.on('componentHook:mounted', this.initEventHandlers.bind(this));
	}

	/**
	 * Re-initializes the rendering process
	 */
	reInit(): void {
		this.lastIntersectsItem = 0;
		this.lastRenderRange = [0, 0];
		this.chunk = 0;
		this.items = [];
		this.refsUpdateMap = new Map();

		this.async.clearAll({group: new RegExp(this.asyncGroup)});

		this.setLoadersVisibility(true, true);
		this.setRefVisibility('retry', false, true);
		this.setRefVisibility('done', false, true);
		this.setRefVisibility('empty', false, true);
		this.setRefVisibility('renderNext', false, true);

		this.initEventHandlers();
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
		if (this.ctx.localState !== 'ready') {
			return;
		}

		const
			{ctx, chunk, items} = this;

		const
			renderFrom = (chunk - 1) * ctx.chunkSize,
			renderTo = chunk * ctx.chunkSize,
			renderItems = items.slice(renderFrom, renderTo);

		if (
			renderFrom === this.lastRenderRange[0] &&
			renderTo === this.lastRenderRange[1] ||
			renderItems.length === 0
		) {
			return;
		}

		this.chunk++;
		this.lastRenderRange = [renderFrom, renderTo];

		const
			nodes = this.renderItems(renderItems);

		if (nodes.length === 0) {
			return;
		}

		const
			fragment = document.createDocumentFragment();

		for (let i = 0; i < nodes.length; i++) {
			this.dom.appendChild(fragment, nodes[i], {
				group: this.asyncGroup,
				destroyIfComponent: true
			});
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
	 * @param [immediate] - if settled as `true` will immediately update a DOM tree
	 */
	setRefVisibility(ref: keyof bVirtualScroll['$refs'], show: boolean, immediate: boolean = false): void {
		const
			refEl = this.refs[ref];

		if (!refEl) {
			return;
		}

		if (immediate) {
			refEl.style.display = show ? '' : 'none';
			return;
		}

		this.refsUpdateMap.set(ref, show);
		this.performRefsVisibilityUpdate();
	}

	/**
	 * Hides or shows refs of the loader and tombstones
	 * @param show
	 * @param [immediate]
	 */
	setLoadersVisibility(show: boolean, immediate: boolean = false): void {
		this.setRefVisibility('tombstones', show, immediate);
		this.setRefVisibility('loader', show, immediate);
	}

	/**
	 * Tries to show the `renderNext` slot
	 */
	tryShowRenderNextSlot(): void {
		const
			{ctx, chunkRequest} = this;

		if (ctx.dataProvider == null && ctx.options.length === 0) {
			return;
		}

		if (chunkRequest.isDone) {
			return;
		}

		this.setRefVisibility('renderNext', true);
	}

	/**
	 * Updates visibility of refs by using requestAnimationFrame
	 */
	protected performRefsVisibilityUpdate(): void {
		this.async.requestAnimationFrame(() => {
			this.refsUpdateMap.forEach((show, ref) => {
				const
					state = show ? '' : 'none',
					refEl = this.refs[ref];

				if (!refEl) {
					return;
				}

				refEl.style.display = state;
			});

			this.refsUpdateMap.clear();

		}, {label: $$.updateRefsVisibility, group: this.asyncGroup, join: true});
	}

	/**
	 * Event handlers initialization
	 */
	protected initEventHandlers(): void {
		this.ctx.localEmitter.once('localState.ready', this.onReady.bind(this), {label: $$.reInit});
		this.ctx.localEmitter.once('localState.error', this.onError.bind(this), {label: $$.reInit});
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

			if (!Object.isFunction(node[$$.inView])) {
				this.wrapInView(item);
			}
		}

		return nodes;
	}

	/**
	 * Wraps the specified item node with the in-view directive
	 * @param item
	 */
	protected wrapInView(item: RenderItem): void {
		const
			{ctx} = this,
			{node} = item;

		if (ctx.loadStrategy === 'manual') {
			return;
		}

		const
			label = `${this.asyncGroup}:${this.asyncInViewPrefix}${ctx.getItemKey(item.data, item.index)}`;

		if (!node) {
			return;
		}

		const
			inViewOptions = this.getInViewOptions(item.index);

		this.InView
			.observe(node, inViewOptions);

		node[$$.inView] = this.async.worker(() => this.InView.remove(node, inViewOptions.threshold), {
			group: this.asyncGroup,
			label
		});
	}

	/**
	 * Returns a render item by the specified parameters
	 *
	 * @param data - data to render in item
	 * @param index - index of the item
	 */
	protected createRenderItem(data: object, index: number): RenderItem {
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
	protected getInViewOptions(index: number): InViewInitOptions {
		return {
			delay: 0,
			threshold: this.randomThreshold,
			once: !this.ctx.clearNodes,
			onEnter: () => this.onNodeIntersect(index)
		};
	}

	/**
	 * Handler: element becomes visible in the viewport
	 * @param index
	 */
	protected onNodeIntersect(index: number): void {
		const
			{ctx, items, lastIntersectsItem} = this,
			{chunkSize, renderGap} = ctx;

		const
			currentRender = (this.chunk - 1) * chunkSize;

		this.lastIntersectsItem = index;

		if (index + renderGap + chunkSize >= items.length) {
			this.chunkRequest.try().catch(stderr);
		}

		if (index >= lastIntersectsItem) {
			if (currentRender - index <= renderGap) {
				this.render();
			}
		}
	}

	/**
	 * Handler: component ready
	 */
	protected onReady(): void {
		this.setLoadersVisibility(false);
		this.chunk++;
		this.render();
	}

	/**
	 * Handler: error occurred
	 */
	protected onError(): void {
		this.setLoadersVisibility(false);
		this.setRefVisibility('renderNext', false);
		this.setRefVisibility('retry', true);
	}
}
