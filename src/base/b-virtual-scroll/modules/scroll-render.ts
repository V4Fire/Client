/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Async from 'core/async';
import Range from 'core/range';
import symbolGenerator from 'core/symbol';
import { is } from 'core/browser';

import bVirtualScroll, { $$ as componentLabels } from 'base/b-virtual-scroll/b-virtual-scroll';
import ComponentRender from 'base/b-virtual-scroll/modules/component-render';
import ScrollRequest from 'base/b-virtual-scroll/modules/scroll-request';

import {

	AnchoredItem,
	RenderItem,
	Size,
	ScrollRenderStatus,
	RenderedItems

} from 'base/b-virtual-scroll/modules/interface';

import { getHeightWithMargin, getRequestParams } from 'base/b-virtual-scroll/modules/helpers';

export const
	$$ = symbolGenerator();

export default class ScrollRender {
	/**
	 * Render status
	 */
	status: ScrollRenderStatus = ScrollRenderStatus.notInitialized;

	/**
	 * Scroll direction
	 */
	scrollDirection: number = 0;

	/**
	 * Maximum scroll value
	 */
	max: number = Infinity;

	/**
	 * Data for render
	 */
	items: RenderItem[] = [];

	/**
	 * Last data chunk that has been registered
	 */
	lastRegisteredData: unknown[] = [];

	/**
	 * Anchor element
	 */
	currentAnchor: AnchoredItem = {index: 0, offset: 0};

	/**
	 * Range of rendered items
	 */
	range!: Range<number>;

	/**
	 * Async group
	 */
	readonly asyncGroup: string = 'scroll-render:';

	/**
	 * Component instance
	 */
	protected component: bVirtualScroll;

	/**
	 * Current scroll position
	 */
	protected scrollPosition: number = 0;

	/**
	 * Maximum scroll value
	 */
	protected maxScroll: number = 0;

	/**
	 * Current position
	 */
	protected currentPosition: number = 0;

	/**
	 * Last calculated container size
	 */
	protected cachedContainerSize: number = 0;

	/**
	 * List of unused elements
	 */
	protected unused: HTMLElement[] = [];

	/**
	 * Size of a tombstone
	 */
	protected tombstoneSize: Size = {width: 0, height: 0};

	/**
	 * Window size
	 */
	protected windowSize: Size = {width: 0, height: 0};

	/**
	 * Element top offset
	 */
	protected offsetTop: number = 0;

	/**
	 * Name of a scroll property
	 */
	protected get scrollProp(): string {
		return this.component.axis === 'y' ? 'scrollTop' : 'scrollLeft';
	}

	/**
	 * Name of a size property
	 */
	protected get sizeProp(): string {
		return this.component.axis === 'y' ? 'height' : 'width';
	}

	/**
	 * Name of a position property
	 */
	protected get positionProp(): string {
		return this.component.axis === 'y' ? 'top' : 'left';
	}

	/**
	 * Number of columns
	 */
	protected get columns(): number {
		return this.component.axis === 'y' ? this.component.columns : 1;
	}

	/**
	 * Async instance
	 */
	protected get async(): Async<bVirtualScroll> {
		// @ts-ignore (access)
		return this.component.async;
	}

	/**
	 * API for component DOM operations
	 */
	protected get dom(): bVirtualScroll['dom'] {
		// @ts-ignore (access)
		return this.component.dom;
	}

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
	 * Link to the scroll root
	 */
	protected get scrollRoot(): HTMLElement {
		// @ts-ignore (access)
		return this.component.scrollRoot;
	}

	/**
	 * Link to the scroll emitter
	 */
	protected get scrollEmitter(): HTMLElement {
		// @ts-ignore (access)
		return this.component.scrollEmitter;
	}

	/**
	 * Link to the component refs
	 */
	protected get refs(): bVirtualScroll['$refs'] {
		// @ts-ignore (access)
		return this.component.$refs;
	}

	/**
	 * @param component
	 */
	constructor(component: bVirtualScroll) {
		this.component = component;

		// @ts-ignore (access)
		component.meta.hooks.mounted.push({
			after: new Set(['initComponentRender']),
			fn: () => {
				this.range = new Range(0, component.realElementsCount);

				this.updateOffset();
				this.calculateSizes();
				this.updateRange();

				this.status = ScrollRenderStatus.waitRender;

				component.waitStatus('ready', () => this.init(), {
					label: componentLabels.initScrollRender,
					group: this.asyncGroup
				});
			}
		});
	}

	/**
	 * Initializes a rendering process
	 */
	init(): void {
		if (this.status !== ScrollRenderStatus.waitRender) {
			return;
		}

		const
			{component} = this;

		if (component.options && component.options.length) {
			this.registerData(component.options);
		}

		if (component.optionsProp && !component.dataProvider) {
			this.max = component.options.length;
		}

		if (component.dataProvider && component.db) {
			this.max = component.db.total || Infinity;
			this.scrollRequest.data = component.db.data || [];
		}

		if (!component.options || !component.options.length) {
			return;
		}

		this.scrollRequest.checksRequestPossibility(getRequestParams(this.scrollRequest, this));
		this.initEvents();
		this.render();

		this.status = ScrollRenderStatus.render;
	}

	/**
	 * Re-initializes a rendering process
	 * @param hard - if true, all tombstones will be redraw
	 */
	reInit(hard: boolean): Promise<void> {
		const
			{async: $a} = this;

		this.maxScroll = 0;
		this.scrollPosition = 0;
		this.cachedContainerSize = 0;

		this.currentAnchor = {index: 0, offset: 0};
		this.windowSize = {width: 0, height: 0};
		this.tombstoneSize = {...this.windowSize};
		this.lastRegisteredData = [];
		this.items = [];

		this.max = Infinity;
		this.status = ScrollRenderStatus.notInitialized;
		this.range = new Range(0, this.component.realElementsCount);

		this.scrollRequest.reset();
		$a.clearAll({group: new RegExp(this.asyncGroup)});

		return $a.promise(new Promise((res) => {
			$a.requestAnimationFrame(() => {
				this.status = ScrollRenderStatus.waitRender;

				this.updateOffset();
				this.calculateSizes();
				hard && this.updateRange();

				res();

			}, {label: $$.reInitRaf, group: this.asyncGroup});
		}), {label: $$.reInit, group: this.asyncGroup});
	}

	/**
	 * Adds additional data to the render flow
	 * @param data
	 */
	add(data: unknown[]): void {
		this.registerData(data);
		this.scrollRequest.checksRequestPossibility(getRequestParams(this.scrollRequest, this));
		this.updateRange();
	}

	/**
	 * Updates the render range
	 */
	updateRange(): void {
		const
			{scrollRoot, scrollProp, scrollPosition, range, component, currentAnchor} = this;

		const
			scrollValue = scrollRoot[scrollProp],
			diff = scrollValue - scrollPosition;

		this.scrollDirection = Math.sign(diff);
		Object.assign(currentAnchor, scrollValue ? this.findAnchoredItem(diff) : {index: 0, offset: 0});
		this.scrollPosition = scrollValue;

		const
			lastItem = this.findAnchoredItem();

		if (diff < 0) {
			range.start = Math.max(0, currentAnchor.index - component.realElementsCount);
			range.end = lastItem.index + component.oppositeElementsCount;

		} else {
			range.start = Math.max(0, currentAnchor.index - component.oppositeElementsCount);
			range.end = lastItem.index + component.realElementsCount;
		}

		this.render();
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
	 * Creates a new render item
	 * @param data
	 */
	protected createItem(data: unknown): RenderItem {
		return {
			node: undefined,
			destructor: undefined,
			width: 0,
			height: 0,
			top: 0,
			data
		};
	}

	/**
	 * Registers the specified data
	 * @param data
	 */
	protected registerData(data: unknown[]): void {
		const {items, scrollRequest} = this;
		this.lastRegisteredData = data;

		for (let i = 0; i < data.length; i++) {
			if (items.length <= this.scrollRequest.total) {
				items.push(this.createItem(undefined));
			}

			if (scrollRequest.total <= this.max) {
				items[scrollRequest.total++].data = data[i];
			}
		}
	}

	/**
	 * True if the specified node has a tombstone class
	 * @param node
	 */
	protected hasTombstoneClass(node: HTMLElement): boolean {
		return node.classList.contains(this.componentRender.tombstoneClass);
	}

	/**
	 * Finds an anchored item
	 * @param [diff]
	 */
	protected findAnchoredItem(diff: number = 0): AnchoredItem {
		const
			{max, currentAnchor, items, tombstoneSize, columns, sizeProp, offsetTop} = this;

		if (diff === 0) {
			return currentAnchor;
		}

		diff += currentAnchor.offset - offsetTop;

		let
			{index: i} = currentAnchor,
			tombstones = 0;

		if (diff < 0) {
			while (diff < 0 && i > 0 && items[i - 1][sizeProp]) {
				diff += items[i - 1][sizeProp];
				i--;
			}

			tombstones = Math.max(-i, Math.ceil(Math.min(diff, 0) / tombstoneSize[sizeProp]));

		} else {
			while (diff > 0 && i < items.length && items[i][sizeProp] && items[i][sizeProp] < diff) {
				diff -= items[i][sizeProp];
				i++;
			}

			if (i >= items.length || !items[i][sizeProp]) {
				tombstones = Math.floor(Math.max(diff, 0) / tombstoneSize[sizeProp]);
			}
		}

		i = Math.min(i + tombstones, max - 1);
		diff -= tombstones * tombstoneSize[sizeProp];

		return {
			index: Math.floor(i / columns) * columns,
			offset: diff
		};
	}

	/**
	 * Renders component content
	 */
	protected render(): void {
		const
			{async: $a, component} = this;

		const r = () => {
			const {
				nodes,
				positions,
				items
			} = this.renderItems();

			this.appendNodes(nodes, items);
			this.clearNodes();
			this.cacheItemsSize();

			this.updateCurrentPosition();
			this.setTombstonePosition(positions);
			this.setItemsPosition(positions);
			this.updateScrollRunnerPosition();

			if (component.containerSize && !this.scrollRequest.isDone) {
				this.updateContainerSize();
			}

			this.hideTombstones(positions);
		};

		if (Boolean(is.iOS)) {
			r();

		} else {
			$a.requestAnimationFrame(r.bind(this), {group: this.asyncGroup});
		}

		this.scrollRequest.try().catch(stderr);
	}

	/**
	 * Renders component items
	 */
	protected renderItems(): RenderedItems {
		const
			{max, component, columns, range, scrollPosition, items, componentRender} = this;

		const
			itemsToRender: [RenderItem, number][] = [],
			positions = {},
			last = Math.floor((range.end + component.realElementsCount) / columns) * columns;

		if (last > max) {
			range.end = max;
		}

		const r = (item, i) => {
			item.top = -1;
			itemsToRender.push([item, i]);
		};

		while (items.length <= range.end) {
			items.push(this.createItem(undefined));
		}

		for (let i = range.start; i < range.end; i++) {
			const
				item = items[i];

			if (!item) {
				continue;
			}

			if (item.node) {
				if (this.hasTombstoneClass(item.node) && item.data) {
					positions[i] = [item.node, item.top - scrollPosition];
					item.node = undefined;

				} else {
					continue;
				}
			}

			r(item, i);
		}

		const
			nodes = componentRender.render(itemsToRender, items);

		return {
			positions,
			nodes,
			items: itemsToRender
		};
	}

	/**
	 * Appends the specified nodes to the document and bind their to items
	 *
	 * @param nodes
	 * @param items
	 */
	protected appendNodes(nodes: HTMLElement[], items: [RenderItem, number][]): void {
		const
			fragment = document.createDocumentFragment();

		for (let i = 0; i < items.length; i++) {
			const [item] = items[i];
			item.node = nodes[i];
			item.destructor = this.dom.appendChild(fragment, item.node, `${this.asyncGroup}:elements`) || undefined;
		}

		this.refs.container.appendChild(fragment);
	}

	/**
	 * Sets the specified positions for component items
	 * @param positions
	 */
	protected setItemsPosition(positions: Dictionary<[HTMLElement, number]>): void {
		const
			{range, sizeProp, items, component, tombstoneSize, columns} = this;

		for (let i = range.start; i < range.end; i++) {
			const
				[node] = positions[i] || [undefined],
				item = items[i];

			if (!item) {
				continue;
			}

			const
				x = (i % columns) * (item.width || tombstoneSize.width),
				y = this.currentPosition;

			const position = {
				x: component.axis === 'y' ? x : y,
				y: component.axis === 'y' ? y : x
			};

			const
				translate = `translate3d(${position.x.px}, ${position.y.px}, 0)`;

			if (node) {
				node.style.transform = translate;
			}

			if (item.node && this.currentPosition !== item.top) {
				item.node.style.transform = translate;
			}

			item.top = y;

			const size = {
				height: (item.height || tombstoneSize.height) * columns,
				width: (item.width || tombstoneSize.width)
			};

			if ((i + 1) % columns === 0 || i + 1 === range.end) {
				this.currentPosition += size[sizeProp];
			}
		}
	}

	/**
	 * Sets the specified positions for item tombstones
	 * @param positions
	 */
	protected setTombstonePosition(positions: Dictionary<[HTMLElement, number]>): void {
		const
			{component, items, columns, scrollPosition} = this;

		for (const i in positions) {
			const
				position = positions[i],
				item = items[i];

			if (!item || !position) {
				continue;
			}

			const
				x = (Number(i) % columns) * item.width,
				y = (scrollPosition + (position[1] || 0)) * columns;

			const coords = {
				x: component.axis === 'y' ? x : y,
				y: component.axis === 'y' ? y : x
			};

			item.node.style.transform = `translate3d(${coords.x.px}, ${coords.y.px}, 0)`;
		}
	}

	/**
	 * Updates component position
	 */
	protected updateCurrentPosition(): void {
		this.scrollPosition = 0;

		const
			{currentAnchor, items, range, tombstoneSize, sizeProp} = this;

		for (let i = 0; i < currentAnchor.index; i++) {
			this.scrollPosition += items[i][sizeProp] || tombstoneSize[sizeProp];
		}

		this.scrollPosition += currentAnchor.offset;
		this.currentPosition = this.scrollPosition - currentAnchor.offset;

		let
			i = currentAnchor.index;

		while (i > range.start) {
			this.currentPosition -= items[i - 1][sizeProp] || tombstoneSize[sizeProp];
			i--;
		}

		while (i < range.start) {
			this.currentPosition += items[i][sizeProp] || tombstoneSize[sizeProp];
			i++;
		}
	}

	/**
	 * Updates the scroll runner position
	 */
	protected updateScrollRunnerPosition(): void {
		const
			{maxScroll, component, currentPosition, scrollProp, refs} = this;

		if (this.maxScroll > currentPosition + component.scrollRunnerOffset) {
			return;
		}

		this.maxScroll = Math.max(maxScroll, currentPosition + component.scrollRunnerOffset);
		refs.scrollRunner.style.transform = `translate3d(0, ${this.maxScroll.px}, 0)`;
		refs.container[scrollProp] = this.scrollPosition;
	}

	/**
	 * Updates the component container size
	 */
	protected updateContainerSize(): void {
		const
			{refs, maxScroll, currentPosition, sizeProp, component} = this;

		const
			val =  Math.max(maxScroll, currentPosition + component.scrollRunnerOffset);

		if (val === this.cachedContainerSize) {
			return;
		}

		this.cachedContainerSize = val;
		refs.container.style[sizeProp] = this.cachedContainerSize.px;
	}

	/**
	 * Clears unused nodes
	 */
	protected clearNodes(): void {
		const
			{range, items} = this;

		const clear = (item) => {
			item.data ? this.destroyItem(item) : this.destroyTombstone(item);
			item.node = undefined;
		};

		for (let i = 0; i < items.length; i++) {
			const
				item = items[i];

			if (i === range.start) {
				i = range.end - 1;
				continue;
			}

			clear(item);
		}
	}

	/**
	 * Destroys the specified item
	 * @param item
	 */
	protected destroyItem(item: RenderItem): void {
		if (!item.node) {
			return;
		}

		if (!item.destructor) {
			return;
		}

		item.destructor();
	}

	/**
	 * Destroys the specified tombstone
	 * @param item
	 */
	protected destroyTombstone(item: RenderItem): void {
		if (!item.node) {
			return;
		}

		if (this.hasTombstoneClass(item.node)) {
			this.component.setMod(item.node, 'hidden', 'true');
			this.componentRender.recycleTombstone(item.node);
		}
	}

	/**
	 * Hides the specified tombstones
	 * @param positions
	 */
	protected hideTombstones(positions: Dictionary<[HTMLElement, number]>): void {
		for (const i in positions) {
			const
				animation = positions[i],
				node = animation && animation[0];

			if (!node) {
				continue;
			}

			this.component.setMod(node, 'hidden', 'true');
			this.componentRender.recycleTombstone(node);
		}
	}

	/**
	 * Calculates geometry of the window and component items
	 */
	protected calculateSizes(): void {
		const
			{refs, items, columns} = this,
			tombstone = <CanUndef<HTMLElement>>refs.tombstone.children[0];

		if (tombstone) {
			refs.container.appendChild(<Node>tombstone);

			this.tombstoneSize = {
				height: getHeightWithMargin(tombstone) / columns,
				width: tombstone.offsetWidth
			};

			refs.tombstone.appendChild(<Node>tombstone);
		}

		for (let i = 0; i < items.length; i++) {
			items[i].top = -1;
			items[i].height = items[i].width = 0;
		}

		this.windowSize = {
			width: refs.container.offsetWidth,
			height: window.innerHeight
		};
	}

	/**
	 * Caches component items geometry
	 */
	protected cacheItemsSize(): void {
		const
			{range, items, columns} = this;

		for (let i = range.start; i < range.end; i++) {
			const
				item = items[i];

			if (!item) {
				continue;
			}

			if (item.data && item.node && (!item.height)) {
				item.width = item.node.offsetWidth;
				item.height = getHeightWithMargin(item.node) / columns;
			}
		}
	}

	/**
	 * Fixes the component container height
	 */
	protected fixSize(): void {
		const
			{columns, sizeProp, items} = this;

		let
			lastItemSize = 0,
			totalSize = 0,
			itemsWithData = 0;

		for (let i = 0; i < items.length; i++) {
			const item = items[i];

			if (item.data) {
				totalSize += item[sizeProp];
				lastItemSize = item[sizeProp];
				itemsWithData++;
			}
		}

		if (itemsWithData % columns > 0) {
			totalSize += ((itemsWithData - (itemsWithData % columns) + columns) - itemsWithData) * lastItemSize;
		}

		this.refs.container.style[sizeProp] = totalSize.px;
		this.refs.container.style[this.sizeProp] = totalSize.px;
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
	 * Handler: document being scrolled
	 */
	protected onScroll(): void {
		this.updateRange();
	}

	/**
	 * Handler: window resize
	 */
	protected onResize(): void {
		this.calculateSizes();
		this.updateRange();
		this.async.requestAnimationFrame(this.fixSize.bind(this));
	}

	/**
	 * Handler: all requests are done
	 */
	protected onRequestsDone(): void {
		this.max = this.items.length;
		this.component.setMod('requestsDone', true);
		this.updateRange();
		this.async.requestAnimationFrame(this.fixSize.bind(this));
	}
}
