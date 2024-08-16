/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import symbolGenerator from 'core/symbol';

import type { WatchOptions } from 'core/dom/intersection-watcher';

import Friend from 'components/friends/friend';
import DOM, { watchForIntersection, appendChild } from 'components/friends/dom';

import type iBlock from 'components/super/i-block/i-block';
import type bVirtualScroll from 'components/base/b-virtual-scroll/b-virtual-scroll';

import type ComponentRender from 'components/base/b-virtual-scroll/modules/component-render';
import type ChunkRequest from 'components/base/b-virtual-scroll/modules/chunk-request';

import type { RenderItem, VirtualItemEl } from 'components/base/b-virtual-scroll/interface';

DOM.addToPrototype({appendChild, watchForIntersection});

const
	$$ = symbolGenerator();

export default class ChunkRender extends Friend {
	/** @inheritDoc */
	declare readonly C: bVirtualScroll;

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

	constructor(component: iBlock) {
		super(component);
		this.component.on('hook:mounted', this.initEventHandlers.bind(this));
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
	 * Renders the component content
	 *
	 * @emits `chunkRender:renderStart(chunkNumber: number)`
	 * @emits `chunkRender:renderComplete(chunkNumber: number)`
	 * @emits `chunkRender:beforeMount(chunkNumber: number)`
	 * @emits `chunkRender:mounted(renderItems:` [[RenderItem]]`[], chunkNumber: number)`
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

		const
			currentChunk = this.chunk;

		this.chunk++;
		this.lastRenderRange = [renderFrom, renderTo];

		ctx.emit('chunkRender:renderStart', currentChunk);

		const
			nodes = this.renderItems(renderItems);

		ctx.emit('chunkRender:renderComplete', currentChunk);
		ctx.emit('chunkRender:beforeMount', currentChunk);

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
			ctx.emit('chunkRender:mounted', renderItems, currentChunk);
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
			refEl = <CanUndef<HTMLElement>>this.refs[ref];

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
	 *
	 * @param show
	 * @param [immediate] - if settled as `true` will immediately update a DOM tree
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

		if (ctx.dataProvider == null && ctx.items.length === 0) {
			return;
		}

		if (chunkRequest.isDone) {
			return;
		}

		this.setRefVisibility('renderNext', true);
	}

	/**
	 * Updates visibility of refs by using `requestAnimationFrame`
	 */
	protected performRefsVisibilityUpdate(): void {
		this.async.requestAnimationFrame(() => {
			this.refsUpdateMap.forEach((show, ref) => {
				const
					state = show ? '' : 'none',
					refEl = <CanUndef<HTMLElement>>this.refs[ref];

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
		this.ctx.localEmitter.once('localState.ready', this.onReady.bind(this), {label: $$.reInitReady});
		this.ctx.localEmitter.once('localState.error', this.onError.bind(this), {label: $$.reInitError});
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

			const itemsData = {
				current: item.data,
				prev: items[i - 1]?.data,
				next: items[i + 1]?.data
			};

			if (!Object.isFunction(node[$$.inView])) {
				this.wrapInView(item, itemsData);
			}
		}

		return nodes;
	}

	/**
	 * Wraps the specified item node with the `in-view` directive
	 *
	 * @param item
	 * @param itemData
	 */
	protected wrapInView(item: RenderItem, itemData: VirtualItemEl): void {
		const
			{ctx} = this,
			{node} = item;

		if (ctx.loadStrategy === 'manual') {
			return;
		}

		const
			label = `${this.asyncGroup}:${this.asyncInViewPrefix}${ctx.getItemKey(itemData, item.index)}`;

		if (!node) {
			return;
		}

		const inViewOpts = {
			...this.getInViewOptions(),
			group: this.asyncGroup,
			label
		};

		this.dom.watchForIntersection(node, inViewOpts, () => this.onNodeIntersect(item.index));
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
	 * Returns options to initialize the `in-view` directive
	 */
	protected getInViewOptions(): WatchOptions {
		return {
			delay: 0,
			threshold: this.randomThreshold,
			once: !this.ctx.clearNodes
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
