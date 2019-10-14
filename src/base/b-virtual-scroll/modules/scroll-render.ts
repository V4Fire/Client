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

import bVirtualScroll from 'base/b-virtual-scroll/b-virtual-scroll';
import ComponentRender from 'base/b-virtual-scroll/modules/component-render';
import { RemoteData, RequestMoreParams, AnchoredItem, RenderItem, Size } from 'base/b-virtual-scroll/modules/interface';

export const
	$$ = symbolGenerator();

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
	 * Maximum amount of elements
	 */
	max: number = Infinity;

	/**
	 * True if the last request returned an empty array or undefined
	 */
	isLastEmpty: boolean = false;

	/**
	 * True if it is considered that all data is uploaded
	 */
	isRequestsDone: boolean = false;

	/**
	 * Data for render
	 */
	items: RenderItem[] = [];

	/**
	 * All loaded data
	 */
	loadedData: unknown[] = [];

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
	 * Link to the component
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
		// @ts-ignore (access)
		return this.component.block.getFullElName('tombstone-el');
	}

	/**
	 * Async instance
	 */
	protected get async(): Async<bVirtualScroll> {
		// @ts-ignore (access)
		return this.component.async;
	}

	/**
	 * Link to the recycle module
	 */
	protected get componentRender(): ComponentRender {
		// @ts-ignore (access)
		return this.component.componentRender;
	}

	/**
	 * Link to the scroll root
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
	 * Link to the component refs
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
	 * Initializes data rendering
	 */
	initRendering(): void {
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
			this.loadedData = component.db.data || [];
		}

		this.checksRequestDone(getRequestParams(this));
		this.initEvents();
		this.render();
	}

	/**
	 * Re-initializes a scroll render
	 */
	reInit(): Promise<void> {
		const
			{component} = this,
			group = {group: 'scroll-render'};

		this.scrollEnd = 0;
		this.scrollPosition = 0;
		this.totalLoaded = 0;
		this.cachedContainerSize = 0;
		this.page = 1;
		this.isRequestsDone = false;

		this.items = [];
		this.lastRegisterData = [];
		this.loadedData = [];

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
	 * Registers the specified array of options
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
	 * Updates the current elements range
	 */
	protected updateRange(): void {
		const
			{scrollRoot, scrollProp, scrollPosition, range, component, currentAnchor, max, loadedData} = this,
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
			const
				shouldRenderMore = component.mods.progress === 'true' && max === Infinity && lastItem.index > loadedData.length;

			if (shouldRenderMore) {
				return;
			}

			range.start = Math.max(0, currentAnchor.index - component.oppositeElementsSize);
			range.end = lastItem.index + component.realElementsSize;
		}

		this.render();
	}

	/**
	 * Renders the content
	 */
	protected render(): void {
		const
			{async: $a, component} = this;

		$a.requestAnimationFrame(() => {
			this.clearNodes();
			this.clearUnused();
			this.cacheItemsHeight();
			this.setCurrentPosition();

			const
				positions = this.renderItems();

			this.setTombstoneTransform(positions);
			this.setItemsTransform(positions);
			this.setScrollRunner();

			if (component.containerSize) {
				this.setContainerHeight();
			}

			this.hideTombstones(positions);

		}, {group: 'render-scroll'});

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
			shouldRequest = Object.isFunction(component.shouldRequest) && component.shouldRequest(getRequestParams(this));

		if (this.isRequestsDone) {
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
				if (!component.field.get('data.length', v)) {
					this.isLastEmpty = true;
					this.checksRequestDone(getRequestParams(this, {lastLoaded: []}));
					return;
				}

				const
					{data, total} = <RemoteData>v;

				this.page++;
				this.max = total || Infinity;
				this.isLastEmpty = false;
				this.loadedData = this.loadedData.concat(data);

				this.registerData(data);
				this.checksRequestDone(getRequestParams(this));
				this.updateRange();

			}).catch(stderr);
	}

	/**
	 * Renders items
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
	 * Sets a height to the container
	 */
	protected setContainerHeight(): void {
		const
			{$refs, scrollEnd, currentPosition, component} = this;

		const
			val =  Math.max(scrollEnd, currentPosition + component.scrollRunnerMin);

		if (val === this.cachedContainerSize) {
			return;
		}

		this.cachedContainerSize = val;
		$refs.container.style.height = this.cachedContainerSize.px;
	}

	/**
	 * Sets a position of the scroll runner
	 */
	protected setScrollRunner(): void {
		const
			{scrollEnd, component, currentPosition, $refs} = this;

		// Проверять направление скролла и treshold
		if (this.scrollEnd > currentPosition + component.scrollRunnerMin) {
			return;
		}

		this.scrollEnd = Math.max(scrollEnd, currentPosition + component.scrollRunnerMin);
		$refs.scrollRunner.style.transform = `translate3d(0, ${this.scrollEnd.px}, 0)`;
		$refs.container.scrollTop = this.scrollPosition;
	}

	/**
	 * Sets a position for items
	 * @param positions
	 */
	protected setItemsTransform(positions: Dictionary<[HTMLElement, number]>): void {
		const
			{range, component, items, tombstoneSize} = this,
			{columns} = component;

		for (let i = range.start; i < range.end; i++) {
			const
				[node] = positions[i] || [undefined],
				item = items[i];

			if (!item) {
				continue;
			}

			const
				x = (i % columns) * (item.width || tombstoneSize.width),
				y = this.currentPosition,
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

			if ((i + 1) % columns === 0 || i + 1 === range.end) {
				this.currentPosition += height;
			}
		}
	}

	/**
	 * Sets a tombstone transform
	 * @param positions
	 */
	protected setTombstoneTransform(positions: Dictionary<[HTMLElement, number]>): void {
		const
			{component, items, scrollPosition} = this,
			{columns} = component;

		for (const i in positions) {
			const
				animation = positions[i],
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

		if (this.component.recycle && !this.component.cacheNode) {
			this.componentRender.recycleNode(item.node);
		}

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
			this.componentRender.cacheTombstone(item.node);
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
		this.component.setMod(node, 'hidden', 'true');
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

			this.hideNode(node);
			this.componentRender.cacheTombstone(node);
		}
	}

	/**
	 * Finds an anchored item
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
	 * Caches items height
	 */
	protected cacheItemsHeight(): void {
		const
			{range, items, component} = this;

		for (let i = range.start; i < range.end; i++) {
			const
				item = items[i];

			if (!item) {
				continue;
			}

			if (item.data && item.node && !item.height) {
				item.height = item.node.offsetHeight / component.columns;
				item.width = item.node.offsetWidth;

				const
					style = window.getComputedStyle(item.node);

				item.height = ['top', 'bottom']
					.map((side) => parseInt(style[`margin-${side}`], 10))
					.reduce((total, side) => total + side, item.height);
			}
		}
	}

	/**
	 * Calculates size of window and items
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
			width: $refs.container.offsetWidth,
			height: window.innerHeight
		};
	}

	/**
	 * Checks are all requests complete
	 * @param params
	 */
	protected checksRequestDone(params: RequestMoreParams): void {
		this.isRequestsDone = this.component.isRequestsDone(params);

		if (this.isRequestsDone) {
			this.max = this.items.length;
			this.component.setMod('requestsDone', true);
			this.updateRange();

		} else {
			this.component.removeMod('requestsDone', true);
		}
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
