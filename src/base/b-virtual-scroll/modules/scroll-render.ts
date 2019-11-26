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

import bVirtualScroll from 'base/b-virtual-scroll/b-virtual-scroll';
import ComponentRender from 'base/b-virtual-scroll/modules/component-render';
import ScrollRequest from 'base/b-virtual-scroll/modules/scroll-request';

import {

	AnchoredItem,
	RenderItem,
	Size,
	ScrollRenderState,
	RenderedItems

} from 'base/b-virtual-scroll/modules/interface';

import { getHeightWithMargin, getRequestParams } from 'base/b-virtual-scroll/modules/helpers';

export const
	$$ = symbolGenerator();

export default class ScrollRender {
	/**
	 * Current state of scroll render
	 */
	state: ScrollRenderState = ScrollRenderState.notInitialized;

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
	 * last piece of data that has been registered
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
	readonly asyncGroup: string = 'scroll-render';

	/**
	 * Component instance
	 */
	protected component: bVirtualScroll;

	/**
	 * Current scroll position
	 */
	protected scrollPosition: number = 0;

	/**
	 * Maximum value of scroll
	 */
	protected scrollEnd: number = 0;

	/**
	 * Current position
	 */
	protected currentPosition: number = 0;

	/**
	 * Last calculated container size
	 */
	protected cachedContainerSize: number = 0;

	/**
	 * Unused elements
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
	 * API for component render operations
	 */
	protected get componentRender(): ComponentRender {
		// @ts-ignore (access)
		return this.component.componentRender;
	}

	/**
	 * API for scroll request helpers
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

				this.state = ScrollRenderState.waitRender;

				component.waitStatus('ready', () => {
					this.init();

				}, {label: 'initScrollRender', group: this.asyncGroup});
			}
		});
	}

	/**
	 * Initializes rendering process
	 */
	init(): void {
		if (this.state !== ScrollRenderState.waitRender) {
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

		this.scrollRequest.checksRequestDone(getRequestParams(this.scrollRequest, this));
		this.initEvents();
		this.render();

		this.state = ScrollRenderState.render;
	}

	/**
	 * Re-initializes a scroll render
	 * @param hard - if true, tombstones will be redraw
	 */
	reset(hard: boolean): Promise<void> {
		const
			{async: $a} = this;

		this.scrollEnd = 0;
		this.scrollPosition = 0;
		this.cachedContainerSize = 0;

		this.currentAnchor = {index: 0, offset: 0};
		this.windowSize = {width: 0, height: 0};
		this.tombstoneSize = {...this.windowSize};
		this.lastRegisteredData = [];
		this.items = [];

		this.max = Infinity;
		this.state = ScrollRenderState.notInitialized;
		this.range = new Range(0, this.component.realElementsCount);

		this.scrollRequest.reset();

		$a.clearAll({group: this.asyncGroup});
		$a.clearAll({group: 'scroll-render-elements'});

		return $a.promise(new Promise((res) => {
			$a.requestAnimationFrame(() => {
				this.state = ScrollRenderState.waitRender;

				this.updateOffset();
				this.calculateSizes();
				hard && this.updateRange();

				res();

			}, {label: $$.reInitRaf, group: this.asyncGroup});
		}), {label: $$.reInit, group: this.asyncGroup});
	}

	/**
	 * Updates render range
	 */
	updateRange(): void {
		const
			{scrollRoot, scrollProp, scrollPosition, range, component, currentAnchor} = this;

		const
			scrollValue = scrollRoot[scrollProp],
			diff = scrollValue - scrollPosition;

		this.scrollDirection = Math.sign(diff);
		this.currentAnchor = scrollValue ? this.findAnchoredItem(diff) : {index: 0, offset: 0};
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
	 * Initializes offset top of the component
	 */
	updateOffset(): void {
		const
			{component} = this,
			{$el} = component;

		if (!$el) {
			return;
		}

		const {top} = $el.getPosition();
		this.offsetTop = top;
	}

	/**
	 * Adds additional data to render
	 * @param data
	 */
	add(data: unknown[]): void {
		this.registerData(data);
		this.scrollRequest.checksRequestDone(getRequestParams(this.scrollRequest, this));
		this.updateRange();
	}

	/**
	 * Registers the specified array of options
	 * @param data
	 */
	protected registerData(data: unknown[]): void {
		const
			{items, scrollRequest} = this;

		this.lastRegisteredData = data;

		for (let i = 0; i < data.length; i++) {
			if (items.length <= this.scrollRequest.totalLoaded) {
				items.push(this.createItem(undefined));
			}

			if (scrollRequest.totalLoaded <= this.max) {
				items[scrollRequest.totalLoaded++].data = data[i];
			}
		}
	}

	/**
	 * Initializes events
	 */
	protected initEvents(): void {
		this.async.on(this.scrollEmitter, 'scroll', this.onScroll.bind(this), {
			label: $$.scroll,
			group: this.asyncGroup
		});

		this.async.on(globalThis, 'resize', async () => {
			await this.async.sleep(50, {label: $$.resizeSleep, join: false}).catch(stderr);
			this.onResize();

		}, {
			label: $$.resize,
			group: this.asyncGroup,
			join: false
		});
	}

	/**
	 * Renders the content
	 */
	protected render(): void {
		const
			{async: $a, component} = this;

		const r = () => {
			const {nodes, positions, items} = this.renderItems();
			this.appendNodes(nodes, items);
			this.clearNodes();
			this.cacheItemsSize();
			this.updateCurrentPosition();
			this.setTombstonePosition(positions);
			this.setItemsPosition(positions);
			this.updateScrollRunnerPosition();

			if (component.containerSize && !this.scrollRequest.isRequestsDone) {
				this.updateContainerSize();
			}

			this.hideTombstones(positions);
		};

		if (Boolean(is.iOS)) {
			r();

		} else {
			$a.requestAnimationFrame(r.bind(this), {group: 'scroll-render'});
		}

		this.scrollRequest.try();
	}

	/**
	 * Renders items
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
	 * Appends the specified nodes to the document, and bind nodes to items
	 *
	 * @param nodes
	 * @param items
	 */
	protected appendNodes(nodes: HTMLElement[], items: [RenderItem, number][]): void {
		const
			fragment = document.createDocumentFragment();

		for (let i = 0; i < items.length; i++) {
			const
				[item] = items[i];

			item.node = nodes[i];
			item.destructor = this.dom.appendChild(fragment, item.node, 'scroll-render-elements') || undefined;
		}

		this.refs.container.appendChild(fragment);
	}

	/**
	 * Sets size to the container
	 */
	protected updateContainerSize(): void {
		const
			{refs, scrollEnd, currentPosition, sizeProp, component} = this;

		const
			val =  Math.max(scrollEnd, currentPosition + component.scrollRunnerOffset);

		if (val === this.cachedContainerSize) {
			return;
		}

		this.cachedContainerSize = val;
		refs.container.style[sizeProp] = this.cachedContainerSize.px;
	}

	/**
	 * Sets a position of the scroll runner
	 */
	protected updateScrollRunnerPosition(): void {
		const
			{scrollEnd, component, currentPosition, scrollProp, refs} = this;

		if (this.scrollEnd > currentPosition + component.scrollRunnerOffset) {
			return;
		}

		this.scrollEnd = Math.max(scrollEnd, currentPosition + component.scrollRunnerOffset);
		refs.scrollRunner.style.transform = `translate3d(0, ${this.scrollEnd.px}, 0)`;
		refs.container[scrollProp] = this.scrollPosition;
	}

	/**
	 * Sets a position for items
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
	 * Sets a position for tombstones
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
	 * Sets current position
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

		let i = currentAnchor.index;

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
	 * Clears unused nodes
	 */
	protected clearNodes(): void {
		const
			{range, items} = this;

		const clear = (item) => {
			item.data ? this.clearItem(item) : this.clearTombstone(item);
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
	 * Clears the specified item
	 * @param item
	 */
	protected clearItem(item: RenderItem): void {
		if (!item.node) {
			return;
		}

		if (!item.destructor) {
			return;
		}

		item.destructor();
	}

	/**
	 * Clears the specified tombstone
	 * @param item
	 */
	protected clearTombstone(item: RenderItem): void {
		if (!item.node) {
			return;
		}

		if (this.hasTombstoneClass(item.node)) {
			this.component.setMod(item.node, 'hidden', 'true');
			this.componentRender.recycleTombstone(item.node);
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
	 * Caches items height
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
	 * Calculates size of window and items
	 */
	protected calculateSizes(): void {
		const
			{refs, items, columns} = this,
			tombstone = <CanUndef<HTMLElement>>refs.tombstone.children[0];

		if (tombstone) {
			refs.container.appendChild(tombstone);

			this.tombstoneSize = {
				height: getHeightWithMargin(tombstone) / columns,
				width: tombstone.offsetWidth
			};

			refs.tombstone.appendChild(tombstone);
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
	 * Fix container height when all data is loaded
	 */
	protected fixSize(): void {
		const size = this.items.reduce<number>((acc, item) => acc + (item.data && item.height || 0), 0);
		this.refs.container.style[this.sizeProp] = size.px;
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
