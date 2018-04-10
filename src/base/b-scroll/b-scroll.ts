/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

// tslint:disable:max-file-line-count
import $C = require('collection.js');
import symbolGenerator from 'core/symbol';
import iBlock, { component, prop, system, p, wait, ModsDecl } from 'super/i-block/i-block';

export * from 'super/i-block/i-block';
export type ScrollSide = 'x' | 'y';
export type FixSizeTypes = 'width' | 'height';
export type OverflowTypes = 'auto' | 'hidden' | 'scroll' | 'visible' | 'inherit';

export interface ScrollSize {
	width?: number;
	height?: number;
}

export interface Offset {
	top: number;
	left: number;
}

export interface ScrollerPosition {
	x?: number;
	y?: number;
}

export interface InputScrollerPosition {
	x?: number | 'left' | 'right';
	y?: number | 'top' | 'bottom';
}

export const
	$$ = symbolGenerator();

@component()
export default class bScroll extends iBlock {
	/**
	 * If true, then the content size will be extended with scroll bars
	 * ('width' or 'height' for extending one of sides)
	 */
	@prop({type: [Boolean, String]})
	readonly fixSize: boolean | FixSizeTypes = false;

	/**
	 * Overflow css value
	 */
	@prop(String)
	readonly overflowType: OverflowTypes = 'auto';

	/**
	 * Scroll offset
	 */
	@p({cache: false})
	get scrollOffset(): CanPromise<Offset> {
		return this.waitState('ready', () => {
			const {area} = this.$refs;
			return {
				top: area.scrollTop,
				left: area.scrollLeft
			};
		});
	}

	/**
	 * Scroll width
	 */
	@p({cache: false})
	get scrollWidth(): CanPromise<number> {
		return this.waitState('ready', () => this.$refs.area.scrollWidth);
	}

	/**
	 * Scroll height
	 */
	@p({cache: false})
	get scrollHeight(): CanPromise<number> {
		return this.waitState('ready', () => this.$refs.area.scrollHeight);
	}

	/**
	 * Block width
	 */
	@p({cache: false})
	get width(): CanPromise<number> {
		return this.waitState('ready', () => this.$refs.area.clientWidth);
	}

	/**
	 * Block height
	 */
	@p({cache: false})
	get height(): CanPromise<number> {
		return this.waitState('ready', () => this.$refs.area.clientHeight);
	}

	/** @inheritDoc */
	static mods: ModsDecl = {
		theme: [
			bScroll.PARENT,
			'light'
		],

		scroll: [
			'true',
			['false']
		]
	};

	/**
	 * Temporary scroller x position
	 */
	@system()
	protected maxScrollerXPos: number = 0;

	/**
	 * Temporary scroller y position
	 */
	@system()
	protected maxScrollerYPos: number = 0;

	/**
	 * Temporary scroller x offset
	 */
	@system()
	protected scrollerOffsetX: number = 0;

	/**
	 * Temporary scroller y offset
	 */
	@system()
	protected scrollerOffsetY: number = 0;

	/** @override */
	protected readonly $refs!: {
		area: HTMLElement;
		scrollerX: HTMLElement;
		scrollWrapperX: HTMLElement;
		scrollerY: HTMLElement;
		scrollWrapperY: HTMLElement;
	};

	/**
	 * Sets a new scroll offset
	 * @param offset
	 */
	@wait('ready', {defer: true, label: $$.setScrollOffset})
	async setScrollOffset(offset: Partial<Offset>): Promise<Offset> {
		const
			{top, left} = offset,
			{area} = this.$refs;

		if (top !== undefined) {
			area.scrollTop = top;
		}

		if (left !== undefined) {
			area.scrollLeft = left;
		}

		return this.scrollOffset;
	}

	/**
	 * Sets the block width
	 * @param value
	 */
	@wait('ready', {defer: true, label: $$.setWidth})
	async setWidth(value: number | string): Promise<number> {
		this.$refs.area.style.maxWidth = Object.isString(value) ? value : value.px;
		await this.calcScroll('x');
		return this.width;
	}

	/**
	 * Sets the block height
	 * @param value
	 */
	@wait('ready', {defer: true, label: $$.setHeight})
	async setHeight(value: number | string): Promise<number> {
		this.$refs.area.style.maxHeight = Object.isString(value) ? value : value.px;
		await this.calcScroll('y');
		return this.height;
	}

	/**
	 * Initializes the scroll area
	 *
	 * @param [scrollerPosition]
	 * @param [side] - scroll side
	 */
	@wait('ready', {defer: true})
	initScroll(scrollerPosition?: InputScrollerPosition, side?: ScrollSide): Promise<void> {
		return this.async.promise(new Promise(async (resolve) => {
			await this.putInStream(async () => {
				await this.calcScroll(side);
				scrollerPosition && this.setScrollerPosition(scrollerPosition);
				resolve();
			});

		}), {
			label: $$.initScroll,
			join: 'replace'
		});
	}

	/**
	 * Calculates the scroll area and returns it size
	 * @param [side] - scroll side
	 */
	@wait('ready', {label: $$.calcScroll, defer: true})
	async calcScroll(side?: ScrollSide): Promise<ScrollSize> {
		const
			el = <HTMLElement>this.$el,
			parent = <HTMLElement>el.parentNode,
			r = this.$refs;

		delete el.style.height;
		delete el.style.width;

		if (parent) {
			if (parent.clientHeight < el.offsetHeight) {
				el.style.height = parent.clientHeight.px;
			}

			if (parent.clientWidth < el.offsetWidth) {
				el.style.width = parent.clientWidth.px;
			}
		}

		const get = {
			x: {
				scroller: r.scrollerX,
				wrapper: r.scrollWrapperX,
				pos: 'left',
				size: 'width',
				delta: '_deltaX',
				cache: 'maxScrollerXPos'
			},

			y: {
				scroller: r.scrollerY,
				wrapper: r.scrollWrapperY,
				pos: 'top',
				size: 'height',
				delta: '_deltaY',
				cache: 'maxScrollerYPos'
			}
		};

		function c(val: string): string {
			return val.camelize(false);
		}

		const
			isX = side === 'x',
			sideVal = isX ? 'width' : 'height';

		if (side) {
			r.area.style[sideVal] = 'auto';

		} else {
			Object.assign(r.area.style, {
				width: 'auto',
				height: 'auto'
			});
		}

		const fxs = this.fixSize;
		$C(side ? [side] : ['y', 'x']).forEach((key) => {
			const
				el = get[key];

			const
				clientVal = c(`client-${el.size}`),
				offsetVal = c(`offset-${el.size}`),
				overflow = c(`overflow-${key}`);

			// Force reflow
			r.area.style[overflow] = this.overflowType;

			let
				scrollerMaxSize = r.area[clientVal];

			if (Object.isString(fxs) ? fxs === el.size : fxs) {
				r.area.style[el.size] = (scrollerMaxSize + (r.area[offsetVal] - r.area[clientVal]) * 2).px;
				scrollerMaxSize = r.area[clientVal];
			}

			const
				contentSize = r.area[c(`scroll-${el.size}`)] - 1,
				scrollerMinSize = Number.parseFloat(getComputedStyle(el.scroller)[c(`min-${el.size}`)]),
				scrollerSize = Math.round(Math.pow(scrollerMaxSize, 2) / contentSize) + 1;

			const
				show = contentSize > scrollerMaxSize;

			this.block.setElMod(el.wrapper, 'scroll-wrapper', 'hidden', !show);
			r.area.style[overflow] = show ? this.overflowType : 'hidden';

			if (show) {
				el.scroller.style[el.size] = (scrollerSize < scrollerMinSize ? scrollerMinSize : scrollerSize).px;
				const offset = el.scroller[offsetVal];
				this[el.cache] = scrollerMaxSize - offset;
				this[el.delta] = (contentSize - scrollerMaxSize) / (scrollerMaxSize - offset);
			}
		});

		const
			{offsetWidth, offsetHeight, clientWidth, clientHeight} = r.area;

		const
			diffX = offsetWidth - clientWidth,
			diffY = offsetHeight - clientHeight;

		if (side) {
			r.area.style[sideVal] = (isX ? offsetWidth : offsetHeight).px;
			r[isX ? 'scrollWrapperX' : 'scrollWrapperY'].style[isX ? 'height' : 'width'] = (isX ? diffY : diffX).px;
			return {[sideVal]: isX ? offsetWidth + diffX : offsetHeight + diffY};
		}

		Object.assign(r.area.style, {
			width: offsetWidth.px,
			height: offsetHeight.px
		});

		r.scrollWrapperY.style.width = diffX.px;
		r.scrollWrapperX.style.height = diffY.px;

		return {
			width: offsetWidth + diffX,
			height: offsetHeight + diffY
		};
	}

	/**
	 * Sets the scroller position and returns it
	 *
	 * @param x - left offset or a constant value
	 * @param y - top offset or a constant value
	 * @param pseudo - if true, then the scroll position won't be affected for the scroll
	 */
	@wait('ready', {label: $$.setScrollerPosition})
	setScrollerPosition({x, y}: InputScrollerPosition = {}, pseudo?: boolean): CanPromise<ScrollerPosition> {
		const
			r = this.$refs;

		const map = {
			top: 0,
			left: 0,
			bottom: r.area.scrollHeight,
			right: r.area.scrollWidth
		};

		const get = {
			x: {
				scroller: r.scrollerX,
				pos: 'left',
				size: 'width',
				delta: '_deltaX',
				cache: 'maxScrollerXPos'
			},

			y: {
				scroller: r.scrollerY,
				pos: 'top',
				size: 'height',
				delta: '_deltaY',
				cache: 'maxScrollerYPos'
			}
		};

		function c(val: string): string {
			return val.camelize(false);
		}

		return $C({x, y}).to({}).reduce((res, val, key) => {
			if (val == null) {
				return res;
			}

			const
				el = get[key],
				scroll = c(`scroll-${el.pos}`),
				d = this[el.delta] || 1,
				pos = val in map ? map[val] : val;

			if (pseudo !== undefined) {
				// tslint:disable-next-line
				if (pseudo) {
					res[key] = el.scroller.style[el.pos] = pos.px;

				} else {
					res[key] = r.area[scroll] = pos * d;
				}

			} else {
				r.area[scroll] = pos;
				if (this[el.cache]) {
					res[key] = el.scroller.style[el.pos] = (
						this[el.cache] * r.area[scroll] / (r.area[c(`scroll-${el.size}`)] - r.area[c(`client-${el.size}`)])
					).px;
				}
			}

			return res;
		});
	}

	/**
	 * Calculates horizontal and vertical positions and returns it
	 */
	protected calcDirs(): ScrollerPosition {
		const
			{area} = this.$refs;

		return {
			x: this.maxScrollerXPos && this.maxScrollerXPos * area.scrollLeft / (area.scrollWidth - area.clientWidth),
			y: this.maxScrollerYPos && this.maxScrollerYPos * area.scrollTop / (area.scrollHeight - area.clientHeight)
		};
	}

	/**
	 * Sets inView mods to area child items
	 *
	 * @param children - area children node list
	 * @param dirs
	 */
	protected calcInView(children: HTMLCollection, dirs: ScrollerPosition): void {
		const
			breakpoints = {left: 0, top: 0},
			{scrollWidth: areaWidth, scrollHeight: areaHeight} = this.$el;

		$C(children).forEach((el) => {
			if (this.$(el)) {
				const
					{height, width} = el.getBoundingClientRect();

				const isInRange = (dir) => {
					const s = {
						left: {
							area: areaWidth,
							self: width
						},
						top: {
							area: areaHeight,
							self: height
						}
					};

					const
						areaRange = Number.range(this.scrollOffset[dir], s[dir].area + this.scrollOffset[dir]),
						itemRange = Number.range(breakpoints[dir], breakpoints[dir] + s[dir].self);

					return Boolean(areaRange.intersect(itemRange).toArray().length);
				};

				const inView = {
					left: dirs.x !== undefined ? isInRange('left') : true,
					top: dirs.y !== undefined ? isInRange('top') : true
				};

				const
					block = this.$(el);

				if (block) {
					block.setMod('view', inView.left && inView.top);
					breakpoints.left += dirs.x !== undefined ? width : 0;
					breakpoints.top += dirs.y !== undefined ? height : 0;
				}
			}
		});
	}

	/**
	 * Handler: base scroll
	 *
	 * @param e
	 * @emits scroll(e: Event)
	 */
	protected onScroll(e: Event): void {
		const
			dirs = this.calcDirs(),
			{children} = <HTMLElement>this.block.element('area');

		this.setScrollerPosition(dirs, true);

		if (children) {
			this.calcInView(children, dirs);
		}

		this.emit('scroll', e);
	}

	/**
	 * Handler: scroller drag start
	 *
	 * @param e
	 * @param scroller - link to the element
	 */
	protected onScrollerDragStart(e: MouseEvent, scroller: HTMLElement): void {
		const
			{scrollerX, scrollerY} = this.$refs;

		this.scrollerOffsetX = e.pageX - scrollerX.offsetLeft;
		this.scrollerOffsetY = e.pageY - scrollerY.offsetTop;

		if (e) {
			this.block.setElMod(scroller, 'scroller', 'active', true);
		}
	}

	/**
	 * Handler: scroller drag
	 * @param e
	 */
	protected onScrollerDrag(e: MouseEvent): void {
		this.setScrollerPosition({
			x: e.pageX - this.scrollerOffsetX,
			y: e.pageY - this.scrollerOffsetY
		}, false);
	}

	/**
	 * Handler: scroller drag end
	 */
	protected onScrollerDragEnd(): void {
		$C(['scrollerX', 'scrollerY']).forEach((el) => {
			this.block.setElMod(this.$refs[el], 'scroller', 'active', false);
		});
	}

	/**
	 * Handler: wheel scroll
	 * @param e
	 */
	protected async onWheel(e: WheelEvent): Promise<void> {
		const
			target = document.elementFromPoint(e.clientX, e.clientY);

		if (target && target.closest(`.${this.blockId}`)) {
			const
				{area, scrollWrapperY} = this.$refs;

			if (this.block.getElMod(scrollWrapperY, 'scroll-wrapper', 'hidden') !== 'false') {
				const
					d = (e.deltaX || e.deltaY) > 0 ? -1 : 1;

				try {
					const
						baseScroll = area.scrollLeft;

					for (let i = 0; i < 9; i++) {
						area.scrollLeft += d * (10 - i);

						if (!i && area.scrollLeft > 0 && area.scrollLeft !== baseScroll) {
							e.preventDefault();
						}

						await this.async.nextTick({label: $$.wheel});
					}

				} catch (_) {}
			}
		}
	}

	/** @override */
	protected created(): void {
		super.created();
		this.async.on(document, 'wheel', this.onWheel, {options: {capture: true}});
	}

	/** @override */
	protected async mounted(): Promise<void> {
		await super.mounted();
		await this.initScroll();

		let
			offset = this.scrollOffset;

		const setScrollMod = (val) => {
			const
				{block: $b} = this,
				{scrollerX, scrollerY} = this.$refs;

			this.setMod('scroll', val);
			$b.setElMod(scrollerX, 'scroller', 'scroll', val);
			$b.setElMod(scrollerY, 'scroller', 'scroll', val);
		};

		const
			{area} = this.$refs;

		if (area && area.children) {
			this.calcInView(area.children, this.calcDirs());
		}

		this.async.on(this.$el, 'scroll', () => {
			const
				newOffset = this.scrollOffset;

			if (Object.fastCompare(offset, newOffset)) {
				return;
			}

			offset = newOffset;
			setScrollMod(true);

			this.async.setTimeout(() => setScrollMod(false), 0.3.second(), {
				label: $$.scroll
			});

		}, {
			join: true,
			label: $$.scroll,
			options: {
				capture: true
			}
		});
	}
}
