'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Store from 'core/store';
import iBlock, { abstract, params, wait, PARENT } from 'super/i-block/i-block';
import { component } from 'core/component';

const
	$C = require('collection.js');

export const
	$$ = new Store();

@component()
export default class bScroll extends iBlock {
	/**
	 * If true, then the content size will be extended with scroll bars
	 * ('width' or 'height' for extending one of sides)
	 */
	fixSize: boolean | string = false;

	/**
	 * Overflow css value
	 */
	overflowType: string = 'auto';

	/** @private */
	@abstract
	_maxScrollerXPos: ?number;

	/** @private */
	@abstract
	_maxScrollerYPos: ?number;

	/** @private */
	@abstract
	_scrollerOffsetX: ?number;

	/** @private */
	@abstract
	_scrollerOffsetY: ?number;

	/** @inheritDoc */
	static mods = {
		theme: [
			PARENT,
			'light'
		],

		scroll: [
			'true',
			['false']
		]
	};

	/** @override */
	get $refs(): {
		area: Element,
		scrollerX: Element,
		scrollWrapperX: Element,
		scrollerY: Element,
		scrollWrapperY: Element
	} {}

	/**
	 * Scroll offset
	 */
	@params({cache: false})
	get scrollOffset(): {top: number, left: number} {
		return this.waitState('ready', () => {
			const {area} = this.$refs;
			return {
				top: area.scrollTop,
				left: area.scrollLeft
			};
		});
	}

	/**
	 * Sets a new scroll offset
	 *
	 * @param top
	 * @param left
	 */
	set scrollOffset({top, left}: {top?: number, left?: number}) {
		const res = this.waitState('ready', () => {
			const
				{area} = this.$refs;

			if (top !== undefined) {
				area.scrollTop = top;
			}

			if (left !== undefined) {
				area.scrollLeft = left;
			}

		}, {label: $$.setScrollOffset, defer: true});

		if (res) {
			res.catch(() => {});
		}
	}

	/**
	 * Scroll width
	 */
	@params({cache: false})
	get scrollWidth(): number {
		return this.waitState('ready', () => this.$refs.area.scrollWidth);
	}

	/**
	 * Scroll height
	 */
	@params({cache: false})
	get scrollHeight(): number {
		return this.waitState('ready', () => this.$refs.area.scrollHeight);
	}

	/**
	 * Block width
	 */
	@params({cache: false})
	get width(): number {
		return this.waitState('ready', () => this.$refs.area.clientWidth);
	}

	/**
	 * Block height
	 */
	@params({cache: false})
	get height(): number {
		return this.waitState('ready', () => this.$refs.area.clientHeight);
	}

	/**
	 * Sets the block width
	 * @param value
	 */
	set width(value: number) {
		const res = this.waitState('ready', async () => {
			this.$refs.area.style.maxWidth = Object.isString(value) ? value : value.px;
			await this.calcScroll('x');
		}, {label: $$.setWidth, defer: true});

		if (res) {
			res.catch(() => {});
		}
	}

	/**
	 * Sets the block height
	 * @param value
	 */
	set height(value: number) {
		const res = this.waitState('ready', async () => {
			this.$refs.area.style.maxHeight = Object.isString(value) ? value : value.px;
			await this.calcScroll('y');
		}, {label: $$.setHeight, defer: true});

		if (res) {
			res.catch(() => {});
		}
	}

	/**
	 * Initializes the scroll
	 *
	 * @param [scrollerPosition]
	 * @param [side] - scroll side (x or y)
	 */
	@wait('ready', {defer: true})
	initScroll(scrollerPosition?: {x?: number | string, y?: number | string}, side?: string): Promise {
		return this.async.promise(new Promise(async (resolve) => {
			await this.putInStream(async () => {
				await this.calcScroll(side);
				scrollerPosition && this.setScrollerPosition(scrollerPosition);
				resolve();
			});

		}, {label: $$.initScroll, join: 'replace'}));
	}

	/**
	 * Calculates the scroll
	 * @param [side] - scroll side (x or y)
	 */
	@wait('ready', {label: $$.calcScroll, defer: true})
	calcScroll(side?: string): Promise<{width?: number, height?: number}> {
		const
			el = this.$el,
			parent = el.parentNode,
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
				cache: '_maxScrollerXPos'
			},

			y: {
				scroller: r.scrollerY,
				wrapper: r.scrollWrapperY,
				pos: 'top',
				size: 'height',
				delta: '_deltaY',
				cache: '_maxScrollerYPos'
			}
		};

		function c(val) {
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
	 * Sets the scroller position
	 *
	 * @param x - left offset or a constant value (left or right)
	 * @param y - top offset or a constant value (top or bottom)
	 * @param pseudo - if true, then the scroll position won't be affected for the scroll
	 */
	@wait('ready', {label: $$.setScrollerPosition})
	setScrollerPosition(
		{x, y}: {
			x?: number | string,
			y?: number | string
		} = {},
		pseudo?: boolean

	): Promise<Object> | Object {
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
				cache: '_maxScrollerXPos'
			},

			y: {
				scroller: r.scrollerY,
				pos: 'top',
				size: 'height',
				delta: '_deltaY',
				cache: '_maxScrollerYPos'
			}
		};

		function c(val) {
			return val.camelize(false);
		}

		return $C({x, y}).reduce((res, val, key) => {
			if (val == null) {
				return res;
			}

			const
				el = get[key],
				scroll = c(`scroll-${el.pos}`),
				d = this[el.delta] || 1;

			if (val in map) {
				val = map[val];
			}

			if (pseudo !== undefined) {
				if (pseudo) {
					res[key] = el.scroller.style[el.pos] = val.px;

				} else {
					res[key] = r.area[scroll] = val * d;
				}

			} else {
				r.area[scroll] = val;
				if (this[el.cache]) {
					res[key] = el.scroller.style[el.pos] = (
						this[el.cache] * r.area[scroll] / (r.area[c(`scroll-${el.size}`)] - r.area[c(`client-${el.size}`)])
					).px;
				}
			}

			return res;
		}, {});
	}

	/**
	 * Calculates horizontal and vertical positions
	 */
	calcDirs(): {x: number, y: number} {
		const
			{area} = this.$refs;

		return {
			x: this._maxScrollerXPos && this._maxScrollerXPos * area.scrollLeft / (area.scrollWidth - area.clientWidth),
			y: this._maxScrollerYPos && this._maxScrollerYPos * area.scrollTop / (area.scrollHeight - area.clientHeight)
		};
	}

	/**
	 * Sets inView mods to area child items
	 *
	 * @param children - area children node list
	 * @param dirs
	 */
	calcInView(children: NodeList, dirs: Object) {
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

				this.$(el).setMod('view', inView.left && inView.top);
				breakpoints.left += dirs.x !== undefined ? width : 0;
				breakpoints.top += dirs.y !== undefined ? height : 0;
			}
		});
	}

	/**
	 * Handler: base scroll
	 *
	 * @param e
	 * @emits scroll(e: Event)
	 */
	onScroll(e: Event) {
		const
			dirs = this.calcDirs(),
			{children} = this.block.element('area');

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
	onScrollerDragStart(e: MouseEvent, scroller: Element) {
		const
			{scrollerX, scrollerY} = this.$refs;

		this._scrollerOffsetX = e.pageX - scrollerX.offsetLeft;
		this._scrollerOffsetY = e.pageY - scrollerY.offsetTop;

		if (e) {
			this.block.setElMod(scroller, 'scroller', 'active', true);
		}
	}

	/**
	 * Handler: scroller drag
	 * @param e
	 */
	onScrollerDrag(e: MouseEvent) {
		this.setScrollerPosition({
			x: e.pageX - this._scrollerOffsetX,
			y: e.pageY - this._scrollerOffsetY
		}, false);
	}

	/**
	 * Handler: scroller drag end
	 */
	onScrollerDragEnd() {
		$C(['scrollerX', 'scrollerY']).forEach((el) => this.block.setElMod(this.$refs[el], 'scroller', 'active', false));
	}

	/** @inheritDoc */
	created() {
		this.async.on(document, 'wheel', async (e) => {
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

		}, true);
	}

	/** @inheritDoc */
	async mounted() {
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

		this.async.on(this.$el, 'scroll', {
			join: true,
			label: $$.scroll,
			fn: () => {
				const
					newOffset = this.scrollOffset;

				if (Object.fastCompare(offset, newOffset)) {
					return;
				}

				offset = newOffset;
				setScrollMod(true);

				this.async.setTimeout({
					label: $$.scroll,
					fn: () => setScrollMod(false)
				}, 0.3.second());
			}

		}, true);
	}
}
