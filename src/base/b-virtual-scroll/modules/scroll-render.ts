import Async from 'core/async';
import symbolGenerator from 'core/symbol';
import Range from 'core/range';

import bVirtualScroll from 'base/b-virtual-scroll/b-virtual-scroll';
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

export default class ScrollRender {
	/**
	 * Link to component
	 */
	protected component: bVirtualScroll;

	/**
	 * Unused elements
	 */
	protected unused: HTMLElement[] = [];

	/**
	 * Data for render
	 */
	protected items: RenderItem[] = [];

	/**
	 * Current scroll position
	 */
	protected scrollPosition: number = 0;

	/**
	 * Current position
	 */
	protected currentPosition: number = 0;

	/**
	 * Maximum elements
	 */
	protected max: number = Infinity;

	/**
	 * Last loaded data
	 */
	protected lastRegisterData: unknown[] = [];

	/**
	 * Current page
	 */
	protected page: number = 1;

	/**
	 * Size of tombstone
	 */
	protected tombstoneSize: {
		width: number;
		height: number;
	} = {width: 0, height: 0};

	/**
	 * Range of rendered items
	 */
	protected range: Range<number>;

	/**
	 * Anchor element
	 */
	protected currentAnchor: AnchoredItem = {index: 0, offset: 0};

	/**
	 * List of elements position
	 */
	protected positionList: Dictionary<Dictionary<number>> = {};

	/**
	 * Window size
	 */
	protected windowSize: {
		width: number;
		height: number;
	} = {width: 0, height: 0};

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
		return `${this.component.componentName}__el_hidden_true`;
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
		return this.component.scrollDirection === 'x' ? 'scrollLeft' : 'scrollTop';
	}

	/**
	 * Name of padding prop1
	 */
	protected get paddingProp(): string {
		return this.component.scrollDirection === 'x' ? 'paddingLeft' : 'paddingTop';
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

		if (ctx.options && ctx.options.length) {
			this.registerData(ctx.options);
		}

		this.calculateSizes();

		this.async.on(document, 'scroll', () => this.async.setTimeout(() => {
			this.onScroll();
		}, 50, {label: $$.onScrollDelay}), {label: $$.scroll});

		this.async.on(window, 'resize orientationchange', async () => {
			await this.async.sleep(50, {label: $$.resizeSleep, join: false}).catch(stderr);
			this.calculateSizes();

		}, {
			label: $$.resize,
			join: false
		});
	}

	/**
	 * Register a specified array of options
	 * @param data
	 * @param [forceUpdate]
	 */
	registerData(data: unknown[], forceUpdate: boolean = true): void {
		this.items = this.items.concat(data.map(this.createItem));
		forceUpdate && this.updateRange();
	}

	/**
	 * Sets a position of item to position list
	 *
	 * @param row
	 * @param column
	 * @param value
	 */
	protected setItemPosition(row: number, column: number, value: number): void {
		(<Dictionary<number>>this.getItemPosition(row))[column] = value;
	}

	/**
	 * Gets a position of item from position list
	 *
	 * @param row
	 * @param [column]
	 */
	protected getItemPosition(row: number, column?: number): Dictionary<number> | CanUndef<number> {
		const
			{component} = this;

		if (!this.positionList[row]) {
			const data = {};

			for (let i = 0; i < component.columns; i++) {
				data[i] = this.currentPosition;
			}

			this.positionList[row] = data;
		}

		if (column === undefined) {
			return <Dictionary<number>>this.positionList[row];
		}

		return (<Dictionary<number>>this.positionList[row])[column];
	}

	/**
	 * Updates current elements range
	 */
	protected updateRange(): void {
		const
			{scrollRoot, scrollProp, scrollPosition, range: currentRange, component, currentAnchor} = this,
			scrollValue = scrollRoot[scrollProp],
			diff = scrollValue - scrollPosition;

		if (scrollValue === 0) {
			Object.assign(currentAnchor, {index: 0, offset: 0});

		} else {
			Object.assign(currentAnchor, this.findAnchoredItem(diff));
		}

		this.scrollPosition = scrollValue;

		const
			lastItem = this.findAnchoredItem(this.$refs.container.offsetHeight); // Здесь будет 0

		if (diff < 0) {
			currentRange.start = Math.max(0, currentAnchor.index - component.realElementsSize);
			currentRange.end = lastItem.index + component.oppositeElementsSize;

		} else {
			currentRange.start = Math.max(0, currentAnchor.index - component.oppositeElementsSize);
			currentRange.end = lastItem.index + component.realElementsSize;
		}

		this.draw();
	}

	/**
	 * Draws a content into container
	 */
	protected draw(): void {
		this.clearNodes();

		const
			animations = this.renderItems();

		this.async.requestAnimationFrame(() => {
			this.cacheItemsHeight();
			this.clearUnused();
		});

		this.setCurrentPosition();

		this.async.requestAnimationFrame(() => {
			this.setItemsTransform(animations);
			this.setTombstoneTransform(animations);
		});

		this.async.setTimeout(() => this.hideTombstones(animations), 300);
		this.request();
	}

	/**
	 * Requests an additional data
	 */
	protected request(): void {
		const
			{component, items, range, currentAnchor} = this;

		if (!component.dataProvider || component.mods.progress === 'true') {
			return;
		}

		const
			itemsToRichBottom = component.options.length - currentAnchor.index,
			currentSlice = items.slice(range.start, range.end);

		if (itemsToRichBottom <= 0 && !items.length) {
			return;
		}

		// @ts-ignore (access)
		component.requestRemoteData({
			currentPage: this.page,
			nextPage: this.page + 1,
			currentRange: this.range,
			lastLoaded: this.lastRegisterData,
			currentSlice,
			itemsToRichBottom,
			items
		})
			.then((data: CanUndef<unknown[]>) => {
				if (!data || !data.length) {
					return;
				}

				this.page++;
				this.registerData(data);
			});
	}

	/**
	 * Renders an items
	 */
	protected renderItems(): Dictionary<[HTMLElement, number]> {
		const
			{max, component, range: currentRange, scrollPosition, items, $refs} = this;

		const
			nodes: HTMLElement[] = [],
			animations = {},
			last = Math.floor((currentRange.end + component.realElementsSize) / component.columns) * component.columns;

		if (last > max) {
			currentRange.end = max;
		}

		const r = (item) => {
			const
				res = item.data ? this.componentRender.render(item.data, item) : this.componentRender.getTombstone();

			if (!res) {
				return;
			}

			item.top = -1;
			item.node = res;
			nodes.push(res);
		};

		for (let i = currentRange.start; i < currentRange.end; i++) {

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

			if (component.waterflow) {
				this.isLayoutInView(i) && r(item);

			} else {
				r(item);
			}
		}

		nodes.forEach((n) => $refs.container.appendChild(n));
		return animations;
	}

	/**
	 * Sets a position for items
	 */
	protected setItemsTransform(animations: Dictionary<[HTMLElement, number]>): void {
		const
			{range, component, items, tombstoneSize} = this,
			{columns, waterflow} = component;

		for (let i = range.start; i < range.end; i++) {
			const
				[node] = animations[i] || [],
				item = items[i];

			if (!item) {
				continue;
			}

			const
				row = waterflow ? Math.floor(i / columns) : 0,
				x = (i % columns) * (item.width || tombstoneSize.width),
				y = waterflow ? <CanUndef<number>>this.getItemPosition(row, i % columns) || 0 : this.currentPosition;

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

			if (waterflow) {
				this.setItemPosition(row + 1, i % columns, y + height);
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
				x = (Number(i) % columns) * item[i].width,
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

		this.currentPosition = this.scrollPosition;
		this.scrollPosition += currentAnchor.offset;

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
	 * @param full - if true, clear all nodes
	 */
	protected clearNodes(full: boolean = false): void {
		const
			{range: currentRange, items, component} = this;

		const clear = (item) => {
			item.data ? this.clearItem(item) : this.clearTombstone(item);
			item.node = undefined;
		};

		for (let i = 0; i < items.length; i++) {
			const
				item = items[i];

			if (component.waterflow) {
				if (item.node && (full || !this.isLayoutInView(i))) {
					clear(item);
				}

			} else {
				if (i === currentRange.start) {
					i = currentRange.end - 1;
					continue;
				}

				clear(item);
			}
		}
	}

	/**
	 * Clears a render item
	 * @param item
	 */
	protected clearItem(item: RenderItem): void {
		const
			{component, $refs: {container}} = this;

		if (component.cacheNode && item.node) {
			container.removeChild(item.node);
			return;
		}

		if (item.node) {
			this.unused.push(item.node);
		}
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

		} else {
			this.unused.push(item.node);
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
	 * Hides a tombstones
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
	 * Is the specified element in view
	 * @param i
	 */
	protected isLayoutInView(i: number): boolean {
		const
			{component: {columns}, windowSize, scrollPosition} = this;

		const
			top = this.getItemPosition(Math.floor(i / columns), i % columns);

		if (!top) {
			return true;
		}

		if (!Object.isNumber(top)) {
			return false;
		}

		const
			index = top - scrollPosition;

		return index > -windowSize.height * 0.5 && index < windowSize.height;
	}

	/**
	 * Find anchored item
	 * @param diff
	 */
	protected findAnchoredItem(diff: number): AnchoredItem {
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

			$refs.container.removeChild(tombstone);
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
