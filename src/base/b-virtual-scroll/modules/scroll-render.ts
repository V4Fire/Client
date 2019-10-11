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

import bVirtualScroll, { RemoteData, RequestMoreParams } from 'base/b-virtual-scroll/b-virtual-scroll';
import ComponentRender from 'base/b-virtual-scroll/modules/component-render';

export const
	$$ = symbolGenerator();

export interface RenderItem<T extends unknown = unknown> {
	data: T;
	node: CanUndef<HTMLElement>;
	width: number;
	height: number;
	top: number;
}

export interface RenderedNode {
	width: number;
	height: number;
	node: HTMLElement;
}

export interface AnchoredItem {
	index: number;
	offset: number;
}

export interface ElementPosition {
	x: number;
	y: number;
}

export interface Size {
	width: number;
	height: number;
}

export default class ScrollRender {
	/**
	 * Total amount of elements being loaded
	 */
	totalLoaded: number = 0;

	/**
	 * Current page
	 */
	page: number = 1;

	/**
	 * Scroll direction
	 */
	scrollDirection: number = 0;

	/**
	 * Maximum elements
	 */
	max: number = Infinity;

	/**
	 * True if last request returns empty value or empty array
	 */
	isLastEmpty: boolean = false;

	/**
	 * True if there is no need to request more data
	 */
	isRequestsDone: boolean = false;

	/**
	 * Data for render
	 */
	items: RenderItem[] = [];

	/**
	 * Last loaded data
	 */
	lastRegisterData: unknown[] = [];

	/**
	 * Anchor element
	 */
	currentAnchor: AnchoredItem = {index: 0, offset: 0};

	/**
	 * Range of rendered items
	 */
	range: Range<number>;

	/**
	 * Link to component
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
	 * Last calculated height
	 */
	protected lastHeight: number = 0;

	/**
	 * Unused elements
	 */
	protected unused: HTMLElement[] = [];

	/**
	 * Size of tombstone
	 */
	protected tombstoneSize: Size = {width: 0, height: 0};

	/**
	 * Window size
	 */
	protected windowSize: Size = {width: 0, height: 0};

	/**
	 * Class for tombstones
	 */
	protected get tombstoneClass(): string {
		return `${this.component.componentName}__tombstone-el`;
	}

	/**
	 * Hidden modifier
	 */
	protected get hiddenClass(): string {
		return `${this.component.componentName}__el_display_none`;
	}

	/**
	 * Link to async module
	 */
	protected get async(): Async<bVirtualScroll> {
		// @ts-ignore (access)
		return this.component.async;
	}

	/**
	 * Link to recycle module
	 */
	protected get componentRender(): ComponentRender {
		// @ts-ignore (access)
		return this.component.componentRender;
	}

	/**
	 * Link to scroll root
	 */
	protected get scrollRoot(): HTMLElement {
		// @ts-ignore (access)
		return this.component.scrollRoot;
	}

	/**
	 * Name of scroll prop
	 */
	protected get scrollProp(): string {
		return 'scrollTop';
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
		this.range = new Range(0, this.component.realElementsSize);

		this.calculateSizes();
		this.updateRange();
	}

	/**
	 * Initializes a data draw process
	 */
	initDraw(): void {
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
		}

		this.initEvents();
		this.draw();
	}

	/**
	 * Reinitializes a scroll render
	 */
	reInit(): Promise<void> {
		const
			{component} = this,
			group = {group: 'scroll-render'};

		this.scrollEnd = 0;
		this.scrollPosition = 0;
		this.totalLoaded = 0;
		this.lastHeight = 0;
		this.page = 1;
		this.isRequestsDone = false;

		this.items = [];
		this.lastRegisterData = [];

		this.max = Infinity;
		this.range = new Range(0, component.realElementsSize);

		this.currentAnchor = {index: 0, offset: 0};
		this.windowSize = {width: 0, height: 0};
		this.tombstoneSize = {...this.windowSize};

		this.async.clearAll(group);

		return this.async.promise(new Promise((res, rej) => {
			this.async.requestAnimationFrame(() => {
				this.unused.forEach((node) => node.remove());
				this.unused = [];

				this.calculateSizes();
				res();

			}, {label: $$.reInitRaf, ...group});
		}), {label: $$.reInit, ...group});
	}

	/**
	 * Register a specified array of options
	 * @param data
	 */
	registerData(data: unknown[]): void {
		const
			{items} = this;

		this.lastRegisterData = data;

		for (let i = 0; i < data.length; i++) {
			if (items.length <= this.totalLoaded) {
				items.push(this.createItem(undefined));
			}

			if (this.totalLoaded <= this.max) {
				items[this.totalLoaded++].data = data[i];
			}
		}
	}

	/**
	 * Initializes events
	 */
	protected initEvents(): void {
		this.async.on(document, 'scroll', this.onScroll.bind(this), {
			label: $$.scroll,
			group: 'render-scroll'
		});

		this.async.on(window, 'resize orientationchange', async () => {
			await this.async.sleep(50, {label: $$.resizeSleep, join: false}).catch(stderr);
			this.calculateSizes();
		}, {
			label: $$.resize,
			group: 'render-scroll',
			join: false
		});
	}

	/**
	 * Updates current elements range
	 */
	protected updateRange(): void {
		const
			{scrollRoot, scrollProp, scrollPosition, range, component, currentAnchor} = this,
			scrollValue = scrollRoot[scrollProp],
			diff = scrollValue - scrollPosition;

		this.scrollDirection = Math.sign(diff);

		if (scrollValue === 0) {
			Object.assign(currentAnchor, {index: 0, offset: 0});

		} else {
			Object.assign(currentAnchor, this.findAnchoredItem(diff));
		}

		this.scrollPosition = scrollValue;

		const
			lastItem = this.findAnchoredItem();

		if (diff < 0) {
			range.start = Math.max(0, currentAnchor.index - component.realElementsSize);
			range.end = lastItem.index + component.oppositeElementsSize;

		} else {
			if (component.mods.progress === 'true') {
				return;
			}

			range.start = Math.max(0, currentAnchor.index - component.oppositeElementsSize);
			range.end = lastItem.index + component.realElementsSize;
		}

		this.draw();
	}

	/**
	 * Draws a content into container
	 */
	protected draw(): void {
		const
			{async: $a, component} = this;

		this.clearNodes();

		const
			animations = this.renderItems();

		$a.requestAnimationFrame(() => {
			this.clearUnused();
			this.cacheItemsHeight();
			this.setCurrentPosition();
		}, {group: 'render-scroll'});

		$a.requestAnimationFrame(() => {
			this.setTombstoneTransform(animations);
			this.setItemsTransform(animations);
			this.setScrollRunner();

			if (component.containerSize) {
				this.setContainerHeight();
			}

		}, {group: 'render-scroll'});

		$a.setTimeout(() => $a.requestAnimationFrame(() => this.hideTombstones(animations), {group: 'render-scroll'}), 300);

		this.request();
	}

	/**
	 * Requests an additional data
	 */
	protected request(): Promise<void> {
		const
			{component, items, currentAnchor} = this,
			resolved = Promise.resolve();

		const
			shouldRequest = Object.isFunction(component.shouldRequest) && component.shouldRequest(getRequestParams(this)),
			hideTombstones = () => this.isRequestsDone && this.removeTombstones();

		if (this.isRequestsDone) {
			hideTombstones();
			return resolved;
		}

		if (!shouldRequest || !component.dataProvider || component.mods.progress === 'true') {
			return resolved;
		}

		const
			itemsToRichBottom = this.totalLoaded - currentAnchor.index;

		if (itemsToRichBottom <= 0 || !items.length) {
			return resolved;
		}

		const
			params = getRequestParams(this);

		// @ts-ignore (access)
		return component.requestRemoteData(params)
			.then((v: CanUndef<RemoteData>) => {

				if (!v || !v.data || v.data.length === 0) {
					this.isLastEmpty = true;
					this.isRequestsDone = component.isRequestsDone(getRequestParams(this));
					hideTombstones();

					return;
				}

				const
					{data, total} = v;

				this.page++;
				this.max = total || Infinity;
				this.isLastEmpty = false;

				this.isRequestsDone = component.isRequestsDone(getRequestParams(this));
				hideTombstones();

				this.registerData(data);
				this.updateRange();

			}).catch(stderr);
	}

	/**
	 * Renders an items
	 */
	protected renderItems(): Dictionary<[HTMLElement, number]> {
		const
			{max, component, range, scrollPosition, items, $refs} = this;

		const
			nodes: HTMLElement[] = [],
			animations = {},
			last = Math.floor((range.end + component.realElementsSize) / component.columns) * component.columns;

		if (last > max) {
			range.end = max;
		}

		const r = (item, i) => {
			const
				res = item.data ? this.componentRender.render(item.data, item, i) : this.componentRender.getTombstone();

			if (!res) {
				return;
			}

			item.top = -1;
			item.node = res;
			nodes.push(item.node);
		};

		for (let i = range.start; i < range.end; i++) {

			while (items.length <= i) {
				items.push(this.createItem(undefined));
			}

			const
				item = items[i];

			if (!item) {
				continue;
			}

			if (item.node) {
				if (this.hasTombstoneClass(item.node) && item.data) {
					animations[i] = [item.node, item.top - scrollPosition];
					item.node = undefined;

				} else {
					continue;
				}
			}

			r(item, i);
		}

		nodes.forEach((n) => $refs.container.appendChild(n));
		return animations;
	}

	/**
	 * Sets a height to container
	 */
	protected setContainerHeight(): void {
		const
			{$refs, scrollEnd, currentPosition, component} = this;

		const
			val =  Math.max(scrollEnd, currentPosition + component.scrollRunnerMin);

		if (val === this.lastHeight) {
			return;
		}

		this.lastHeight = val;
		$refs.container.style.height = this.lastHeight.px;
	}

	/**
	 * Sets a position of scrollRunner
	 */
	protected setScrollRunner(): void {
		const
			{scrollEnd, component, currentPosition, $refs} = this;

		this.scrollEnd = Math.max(scrollEnd, currentPosition + component.scrollRunnerMin);
		$refs.scrollRunner.style.transform = `translate3d(0, ${this.scrollEnd.px}, 0)`;
		$refs.container.scrollTop = this.scrollPosition;
	}

	/**
	 * Sets a position for items
	 * @param animations
	 */
	protected setItemsTransform(animations: Dictionary<[HTMLElement, number]>): void {
		const
			{range, component, items, tombstoneSize} = this,
			{columns} = component;

		for (let i = range.start; i < range.end; i++) {
			const
				[node] = animations[i] || [],
				item = items[i];

			if (!item) {
				continue;
			}

			const
				x = (i % columns) * (item.width || tombstoneSize.width),
				y = this.currentPosition;

			const
				translate = `translate3d(${x.px}, ${y.px}, 0)`;

			if (node) {
				node.style.transform = translate;
				node.style.opacity = String(0);
			}

			if (item.node && this.currentPosition !== item.top) {
				item.node.style.transform = translate;
			}

			item.top = y;

			const
				height = (item.height || tombstoneSize.height) * columns;

			if ((i + 1) % columns === 0) {
				this.currentPosition += height;
			}
		}
	}

	/**
	 * Sets a tombstone transform
	 */
	protected setTombstoneTransform(animations: Dictionary<[HTMLElement, number]>): void {
		const
			{component, items, scrollPosition} = this,
			{columns} = component;

		for (const i in animations) {
			const
				animation = animations[i],
				item = items[i];

			if (!item || !animation) {
				continue;
			}

			const
				x = (Number(i) % columns) * item.width,
				y = (scrollPosition + (animation[1] || 0)) * columns;

			item.node.style.transform = `translate3d(${x.px}, ${y.px}, 0)`;
		}
	}

	/**
	 * Sets a current position
	 */
	protected setCurrentPosition(): void {
		this.scrollPosition = 0;

		const
			{currentAnchor, items, range, tombstoneSize} = this;

		for (let i = 0; i < currentAnchor.index; i++) {
			this.scrollPosition += items[i].height || tombstoneSize.height;
		}

		this.scrollPosition += currentAnchor.offset;
		this.currentPosition = this.scrollPosition - currentAnchor.offset;

		let i = currentAnchor.index;

		while (i > range.start) {
			this.currentPosition -= items[i - 1].height || tombstoneSize.height;
			i--;
		}

		while (i < range.start) {
			this.currentPosition += items[i].height || tombstoneSize.height;
			i++;
		}
	}

	/**
	 * Clears unused nodes
	 * @param [full] - if true, clear all nodes
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
	 * Clears a render item
	 * @param item
	 */
	protected clearItem(item: RenderItem): void {
		if (!item.node) {
			return;
		}

		const
			{$refs: {container}} = this;

		container.removeChild(item.node);
	}

	/**
	 * Clears a tombstone
	 * @param item
	 */
	protected clearTombstone(item: RenderItem): void {
		if (!item.node) {
			return;
		}

		if (this.hasTombstoneClass(item.node)) {
			this.hideNode(item.node);
			this.componentRender.saveTombstone(item.node);
		}
	}

	/**
	 * Clears unused nodes
	 */
	protected clearUnused(): void {
		while (this.unused.length) {
			this.$refs.container.removeChild(<HTMLElement>this.unused.pop());
		}
	}

	/**
	 * True if the specified node has a tombstone class
	 * @param node
	 */
	protected hasTombstoneClass(node: HTMLElement): boolean {
		return node.classList.contains(this.tombstoneClass);
	}

	/**
	 * Hide the specified node
	 * @param node
	 */
	protected hideNode(node: HTMLElement): void {
		node.classList.add(this.hiddenClass);
	}

	/**
	 * Hides a specified tombstones
	 */
	protected hideTombstones(animations: Dictionary<[HTMLElement, number]>): void {
		for (const i in animations) {
			const
				animation = animations[i],
				node = animation && animation[0];

			if (!node) {
				continue;
			}

			this.hideNode(node);
			this.componentRender.saveTombstone(node);
		}
	}

	/**
	 * Hides all tombstones
	 */
	protected removeTombstones(): void {
		const
			{items} = this;

		for (let i = 0; i < items.length; i++) {
			const
				item = items[i];

			if (!item.node || !this.hasTombstoneClass(item.node) || item.data) {
				continue;
			}

			this.hideNode(item.node);
		}
	}

	/**
	 * Find anchored item
	 * @param [diff]
	 */
	protected findAnchoredItem(diff: number = 0): AnchoredItem {
		const
			{max, currentAnchor, items, tombstoneSize, component: {columns}} = this;

		if (diff === 0) {
			return currentAnchor;
		}

		diff += currentAnchor.offset;

		let
			{index: i} = currentAnchor,
			tombstones = 0;

		if (diff < 0) {
			while (diff < 0 && i > 0 && items[i - 1].height) {
				diff += items[i - 1].height;
				i--;
			}

			tombstones = Math.max(-i, Math.ceil(Math.min(diff, 0) / tombstoneSize.height));

		} else {
			while (diff > 0 && i < items.length && items[i].height && items[i].height < diff) {
				diff -= items[i].height;
				i++;
			}

			if (i >= items.length || !items[i].height) {
				tombstones = Math.floor(Math.max(diff, 0) / tombstoneSize.height);
			}
		}

		i += tombstones;
		diff -= tombstones * tombstoneSize.height;
		i = Math.min(i, max - 1);

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
			width: 0,
			height: 0,
			top: 0,
			data
		};
	}

	/**
	 * Cache item height
	 * @param [drop] - If true, will force drop cache
	 */
	protected cacheItemsHeight(drop: boolean = false): void {
		const
			{range, items, component} = this;

		for (let i = range.start; i < range.end; i++) {
			const
				item = items[i];

			if (!item) {
				continue;
			}

			if (item.data && item.node && (drop || !item.height)) {
				item.height = item.node.offsetHeight / component.columns;
				item.width = item.node.offsetWidth;
			}
		}
	}

	/**
	 * Handler: window resize
	 */
	protected calculateSizes(): void {
		const
			{$refs, component, items} = this,
			tombstone = <CanUndef<HTMLElement>>$refs.tombstone.children[0];

		if (tombstone) {
			$refs.container.appendChild(tombstone);

			this.tombstoneSize = {
				height: tombstone.offsetHeight / component.columns,
				width: tombstone.offsetWidth
			};

			$refs.tombstone.appendChild(tombstone);
		}

		for (let i = 0; i < items.length; i++) {
			items[i].top = -1;
			items[i].height = items[i].width = 0;
		}

		this.windowSize = {
			width: window.innerWidth,
			height: window.innerHeight
		};
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
	}
}

/**
 * Returns a request params
 *
 * @param [ctx]
 * @param [merge]
 */
// this: ScrollRender hack for accessing to protected members
export function getRequestParams(ctx?: ScrollRender, merge?: Dictionary): RequestMoreParams {
	const base = {
		currentPage: 0,
		currentRange: new Range(0, 0),
		items: [],
		lastLoaded: [],
		currentSlice: [],
		isLastEmpty: false,
		itemsToRichBottom: 0
	};

	const params = ctx ? {
		currentRange: ctx.range,
		currentPage: ctx.page,
		lastLoaded: ctx.lastRegisterData,
		isLastEmpty: ctx.isLastEmpty,

		currentSlice: ctx.items.slice(ctx.range.start, ctx.range.end),
		itemsToRichBottom: ctx.totalLoaded - ctx.currentAnchor.index,
		items: ctx.items
	} : base;

	const merged = {
		...params,
		...merge
	};

	// tslint:disable-next-line: prefer-object-spread
	return Object.assign(merged, {
		nextPage: merged.currentPage + 1
	});
}
