'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Store from 'core/store';
import iBlock, { abstract, field, wait, watch, params } from 'super/i-block/i-block';
import { component } from 'core/component';

export const
	$$ = new Store();

/**
 * Size type
 */
export type $$size = {
	x: number,
	y: number,
	width: number,
	height: number
};

@component()
export default class bCrop extends iBlock {
	/**
	 * Image src
	 */
	@watch('initSelect', {immediate: true})
	src: string;

	/**
	 * Image width
	 */
	width: ?number | string = 'auto';

	/**
	 * Image height
	 */
	height: ?number | string = 'auto';

	/**
	 * Image alt
	 */
	alt: string = '';

	/**
	 * Initial crop area minimal width
	 */
	minWidthProp: number | boolean = 200;

	/**
	 * Initial crop area minimal height
	 */
	minHeightProp: number | boolean = 200;

	/**
	 * Initial crop area maximum width
	 */
	maxWidthProp: number | boolean = 600;

	/**
	 * Initial crop area maximum height
	 */
	maxHeightProp: number | boolean = 600;

	/**
	 * Crop area width by click
	 */
	clickWidth: number = 200;

	/**
	 * Crop area height by click
	 */
	clickHeight: number = 200;

	/**
	 * Crop area ratio
	 */
	ratio: Array | boolean = [1, 3];

	/**
	 * If true, then will be enabled "ratably" mode
	 */
	ratably: boolean = false;

	/**
	 * If true, then will be enabled "free select" mode
	 */
	freeSelect: boolean = true;

	/**
	 * If true, then a crop area can be selected by click
	 */
	selectByClick: boolean = true;

	/**
	 * If true, then a crop area can be resize by a mouse
	 */
	resizeSelectProp: boolean = true;

	/**
	 * If true, then a crop area can be moving by a mouse
	 */
	moveSelect: boolean = true;

	/**
	 * Crop area minimal width
	 */
	@field((o) => o.link('minWidthProp', (val) => val === false ? 0 : val))
	minWidth: number;

	/**
	 * Crop area minimal height
	 */
	@field((o) => o.link('minHeightProp', (val) => val === false ? 0 : val))
	minHeight: number;

	/**
	 * Crop area maximum width
	 */
	@field((o) => o.link('maxWidthProp', (val) => val === false ? Infinity : val))
	maxWidth: number;

	/**
	 * Crop area maximum height
	 */
	@field((o) => o.link('maxHeightProp', (val) => val === false ? Infinity : val))
	maxHeight: number;

	/**
	 * "resize select" store
	 */
	@field((o) => o.link('resizeSelectProp'))
	resizeSelect: boolean | number;

	/** @private */
	@abstract
	_areaEvent: boolean;

	/** @private */
	@abstract
	_areaDown: boolean;

	/** @inheritDoc */
	static mods = {
		parentProgress: [
			'true',
			['false']
		]
	};

	/** @override */
	get $refs(): {
		area: HTMLDivElement,
		select: HTMLDivElement,
		clone: HTMLDivElement,
		original: HTMLDivElement,
		img: HTMLImageElement,
		r: HTMLDivElement
	} {}

	/**
	 * Bounds of the selection area
	 */
	get selectedRect(): $$size {
		const {select} = this.$refs;
		return {
			x: select.offsetLeft,
			y: select.offsetTop,
			width: select.offsetWidth,
			height: select.offsetHeight
		};
	}

	/**
	 * Link for .$refs.img
	 */
	get img(): HTMLImageElement {
		return this.$refs.img;
	}

	/**
	 * "freeSelect" mode watcher
	 *
	 * @param value
	 * @emits selectStart({pageX: number, pageY: number})
	 * @emits select({x: number, y: number, width: number, height: number})
	 * @emits selectEnd({x: number, y: number, width: number, height: number})
	 */
	@wait('loading')
	@params({immediate: true})
	$$freeSelect(value: boolean) {
		const
			{async: $a} = this;

		if (!value) {
			$a.off({group: 'dnd.freeSelect'});
			return;
		}

		if (!this.resizeSelect) {
			this.resizeSelect = 1;
		}

		const
			{r, area, select, clone} = this.$refs,
			{offsetWidth: sWidth, offsetHeight: sHeight} = r,
			{block: $b} = this;

		let
			pageX,
			pageY,
			init;

		$a.dnd(area, {
			group: 'dnd.freeSelect',
			onDragStart: (e) => {
				if (e.target !== area) {
					return false;
				}

				pageX = e.pageX;
				pageY = e.pageY;

				$b.setElMod(select, 'select', 'hidden', true);
				this.emit('selectStart', {pageX, pageY});
			},

			onDrag: (e) => {
				if (init || (!init && Math.abs(e.pageX - pageX) < sWidth * 3 && Math.abs(e.pageY - pageY) < sHeight * 3)) {
					return;
				}

				$b.removeElMod(select, 'select', 'hidden');

				const
					{left, top} = clone.getPosition();

				const
					x = pageX - left,
					y = pageY - top;

				let
					width = e.pageX - pageX,
					height = e.pageY - pageY;

				const
					hor = width < 0 ? 'left' : 'right',
					vert = height < 0 ? 'top' : 'bottom';

				width = Math.abs(width);
				height = Math.abs(height);

				this.setSize({
					x,
					y,
					width,
					height
				});

				init = true;
				const trigger = new MouseEvent(e.type === 'mousemove' ? 'mousedown' : 'touchstart', e);
				trigger.cancelMinMax = true;

				$b.element('r', {'hor-align': hor, 'vert-align': vert}).dispatchEvent(trigger);
				this.emit('select', {x, y, width, height});
			},

			onDragEnd: () => {
				$b.removeElMod(select, 'select', 'hidden');

				if (!init) {
					return;
				}

				init = false;
				this._areaDown = false;

				const
					{offsetLeft: x, offsetTop: y, offsetWidth: width, offsetHeight: height} = select;

				this.setFixSize({x, y, width, height});
				this.emit('selectEnd', {x, y, width, height});
			}
		});
	}

	/**
	 * "selectByClick" mode watcher
	 *
	 * @param value
	 * @emits selectByClick({x: number, y: number, width: number, height: number})
	 */
	@wait('loading')
	@params({immediate: true})
	$$selectByClick(value: boolean) {
		const
			{async: $a, block: $b, clickWidth, minWidth, maxWidth, clickHeight, minHeight, maxHeight} = this,
			{area, select} = this.$refs;

		if (!value) {
			$a.off({group: 'selectByClick'});
			return;
		}

		$a.on(area, 'mousedown touchstart', {
			group: 'selectByClick',
			fn: (e) => {
				if (e.target === area) {
					this._areaDown = true;
					$b.setElMod(select, 'select', 'hidden', true);
				}
			}
		}, true);

		$a.on(area, 'click', {
			group: 'selectByClick',
			fn: (e) => {
				if (e.target !== area || !this._areaDown) {
					return;
				}

				const
					width = clickWidth <= maxWidth && clickWidth > minWidth ? clickWidth : minWidth,
					height = clickHeight <= maxHeight && clickHeight > minHeight ? clickHeight : minHeight;

				const
					{top, left} = this.$refs.clone.getPosition();

				const
					x = e.pageX - left - width / 2,
					y = e.pageY - top - height / 2;

				$b.removeElMod(select, 'select', 'hidden');
				this.setFixSize({x, y, width, height});
				this.emit('selectByClick', {x, y, width, height});
			}
		});
	}

	/**
	 * "resizeSelect" mode watcher
	 *
	 * @param value
	 * @emits resizeStart()
	 * @emits resize({x: number, y: number, width: number, height: number})
	 * @emits resizeEnd()
	 */
	@wait('loading')
	@params({immediate: true})
	$$resizeSelect(value: boolean) {
		const
			{area, select, clone, img} = this.$refs,
			{async: $a, block: $b, ratably, minWidth: defMinWidth, minHeight: defMinHeight} = this;

		if (!value) {
			this.setMod('resizeSelect', false);
			$a.off({group: 'dnd.resizeSelect'});
			return;
		}

		if (value === true) {
			this.removeMod('resizeSelect');
		}

		let
			offsetY,
			offsetX;

		let
			baseY,
			baseX;

		let
			iWidth,
			iHeight;

		let
			width,
			height;

		let
			baseRate;

		let
			pWidth,
			pHeight;

		let
			type,
			target,
			alt;

		let
			minWidth,
			minHeight;

		let
			lastY,
			lastX,
			lastWidth,
			lastHeight;

		let
			toAlt,
			cancelMinMax;

		const setSize = (left, top, width, height) => {
			const
				vert = Boolean(top || height),
				hor = Boolean(left || width);

			left = Object.isNumber(left) ? left : lastX;
			top = Object.isNumber(top) ? top : lastY;
			width = Object.isNumber(width) ? width : lastWidth;
			height = Object.isNumber(height) ? height : lastHeight;

			let
				breakTop,
				breakLeft;

			if (left < 0) {
				left = 0;
				breakLeft = true;
			}

			if (top < 0) {
				top = 0;
				breakTop = true;
			}

			if (!cancelMinMax) {
				if (ratably) {
					if (type === 'top-left') {
						const diff = width - lastWidth;
						top = lastY - diff;
						left = lastX - diff;
						height = lastHeight + diff;

					} else if (type === 'bottom-left') {
						const diff = width - lastWidth;
						height = lastHeight + diff;
						left = lastX - diff;

					} else if (type === 'top-right' || type === 'bottom-right') {
						width = height;
					}

					if (
						left < 0 ||
						top < 0 ||
						height + top > iHeight ||
						width + left > iWidth ||
						(width / height).toFixed(1) !== baseRate

					) {
						left = lastX;
						top = lastY;
						width = lastWidth;
						height = lastHeight;
					}
				}

				const
					{minWidth, maxWidth, minHeight, maxHeight} = this.getMinMax(width, height);

				if (hor) {
					const
						maxW = lastWidth > maxWidth ? lastWidth : maxWidth,
						minW = lastWidth < minWidth ? lastWidth : minWidth;

					if (minWidth && width <= minW) {
						if (lastX < left) {
							left = lastX + lastWidth - minW;
							width = lastX !== left ? minW : lastWidth;

						} else {
							width = minW;
						}

					} else if (maxWidth && width >= maxW) {
						if (lastX > left) {
							left = lastWidth !== maxW ? lastX - (maxW - lastWidth) : lastX;
							breakLeft = false;
						}

						width = maxW;
					}
				}

				if (vert) {
					const
						maxH = lastHeight > maxHeight ? lastHeight : maxHeight,
						minH = lastHeight < minHeight ? lastHeight : minHeight;

					if (minHeight && height <= minH) {
						if (lastY < top) {
							top = lastY + lastHeight - minH;
							height = lastY !== top ? minH : lastHeight;

						} else {
							height = minH;
						}

					} else if (maxHeight && height >= maxH) {
						if (lastY > top) {
							top = lastHeight !== maxH ? lastY - (maxH - lastHeight) : lastY;
							breakTop = false;
						}

						height = maxH;
					}
				}
			}

			if (breakLeft) {
				width = lastWidth;

			} else if (width + left > iWidth) {
				width -= width + left - iWidth;
				width = width < 0 ? lastWidth : width;
			}

			if (breakTop) {
				height = lastHeight;

			} else if (height + top > iHeight) {
				height -= height + top - iHeight;
				height = height < 0 ? iHeight : height;
			}

			Object.assign(select.style, {
				top: (lastY = top).px,
				left: (lastX = left).px,
				width: (lastWidth = width).px,
				height: (lastHeight = height).px
			});

			clone.style.clip = `rect(
				${lastY.px},
				${(lastWidth + lastX).px},
				${(lastHeight + lastY).px},
				${lastX.px}
			)`;

			baseRate = (lastWidth / lastHeight).toFixed(1);

			if (!cancelMinMax) {
				this.emit('resize', {x: left, y: top, width, height});
			}
		};

		const init = (node, e, cancelMinMaxForce) => {
			if (e.cancelMinMax || cancelMinMaxForce) {
				minWidth = 0;
				minHeight = 0;
				cancelMinMax = true;

			} else {
				minWidth = defMinWidth;
				minHeight = defMinHeight;
			}

			target = node;

			const
				{top, left} = target.getOffset(area);

			const
				pageX = e.clientX + pageXOffset,
				pageY = e.clientY + pageYOffset;

			offsetX = pageX - left;
			offsetY = pageY - top;

			lastX = select.offsetLeft;
			lastY = select.offsetTop;

			baseX = pageX + target.offsetWidth / 2;
			baseY = pageY + target.offsetHeight / 2;

			pWidth = minWidth ? minWidth / 6 : target.offsetWidth;
			pHeight = minWidth ? minHeight / 6 : target.offsetHeight;

			iWidth = img.width;
			iHeight = img.height;

			width = lastWidth = select.offsetWidth;
			height = lastHeight = select.offsetHeight;

			baseRate = (lastWidth / lastHeight).toFixed(1);
			type = `${$b.getElMod(target, 'r', 'vert-align')}-${$b.getElMod(target, 'r', 'hor-align')}`;

			switch (type) {
				case 'middle-left':
					alt = $b.element('r', {'vert-align': 'middle', 'hor-align': 'right'});
					break;

				case 'middle-right':
					alt = $b.element('r', {'vert-align': 'middle', 'hor-align': 'left'});
					break;

				case 'top-middle':
					alt = $b.element('r', {'vert-align': 'bottom', 'hor-align': 'middle'});
					break;

				case 'bottom-middle':
					alt = $b.element('r', {'vert-align': 'top', 'hor-align': 'middle'});
					break;

				case 'top-left':
					alt = {
						bottom: $b.element('r', {'vert-align': 'bottom', 'hor-align': 'left'}),
						right: $b.element('r', {'vert-align': 'top', 'hor-align': 'right'}),
						bottomRight: $b.element('r', {'vert-align': 'bottom', 'hor-align': 'right'})
					};

					break;

				case 'bottom-left':
					alt = {
						top: $b.element('r', {'vert-align': 'top', 'hor-align': 'left'}),
						right: $b.element('r', {'vert-align': 'bottom', 'hor-align': 'right'}),
						topRight: $b.element('r', {'vert-align': 'top', 'hor-align': 'right'})
					};

					break;

				case 'top-right':
					alt = {
						bottom: $b.element('r', {'vert-align': 'bottom', 'hor-align': 'right'}),
						left: $b.element('r', {'vert-align': 'top', 'hor-align': 'left'}),
						bottomLeft: $b.element('r', {'vert-align': 'bottom', 'hor-align': 'left'})
					};

					break;

				case 'bottom-right':
					alt = {
						top: $b.element('r', {'vert-align': 'top', 'hor-align': 'right'}),
						left: $b.element('r', {'vert-align': 'bottom', 'hor-align': 'left'}),
						topLeft: $b.element('r', {'vert-align': 'top', 'hor-align': 'left'})
					};

					break;
			}
		};

		function switchSide(e, width, height, control, action) {
			width = Object.isNumber(width) ? width : NaN;
			width = width <= pWidth ? pWidth / 2 : width;

			height = Object.isNumber(height) ? height : NaN;
			height = height <= pHeight ? pHeight / 2 : height;

			if ((height < pHeight || width < pWidth) && !control) {
				if (Object.isArray(action)) {
					if (height < pHeight && width > pWidth) {
						init(action[0], e, cancelMinMax);

					} else if (height > pHeight && width < pWidth) {
						init(action[1], e, cancelMinMax);

					} else {
						init(action[2], e, cancelMinMax);
					}

				} else {
					init(action, e, cancelMinMax);
				}

				toAlt = true;
				return false;
			}

			if ((isNaN(height) || height > pHeight) && (isNaN(width) || width > pWidth)) {
				toAlt = false;
			}

			return {width, height};
		}

		$a.dnd(area, {
			group: 'dnd.resizeSelect',
			onDragStart: {
				capture: true,
				handler: this.delegateElement('r', (e) => {
					e.stopPropagation();
					this.setMod('active', true);
					init(e.target, e, cancelMinMax);
					!cancelMinMax && this.emit('resizeStart');
				})
			},

			onDrag: (e) => {
				if (!type) {
					return;
				}

				const
					x = e.pageX - offsetX,
					y = e.pageY - offsetY;

				const
					diffX = e.pageX - baseX,
					diffY = e.pageY - baseY;

				switch (type) {
					case 'top-left': {
						const
							res = switchSide(e, width - diffX, height - diffY, toAlt, [alt.bottom, alt.right, alt.bottomRight]);

						if (!res) {
							break;
						}

						setSize(x, y, res.width, res.height);
					} break;

					case 'middle-left': {
						const
							res = switchSide(e, width - diffX, null, toAlt, alt);

						if (!res) {
							break;
						}

						setSize(x, null, res.width, null);
					} break;

					case 'bottom-left': {
						const
							res = switchSide(e, width - diffX, height + diffY, toAlt, [alt.top, alt.right, alt.topRight]);

						if (!res) {
							break;
						}

						setSize(x, null, res.width, res.height);
					} break;

					case 'top-middle': {
						const
							res = switchSide(e, null, height - diffY, toAlt, alt);

						if (!res) {
							break;
						}

						setSize(null, y, null, res.height);
					} break;

					case 'bottom-middle': {
						const
							res = switchSide(e, null, height + diffY, toAlt, alt);

						if (!res) {
							break;
						}

						setSize(null, null, null, res.height);
					} break;

					case 'top-right': {
						const
							res = switchSide(e, width + diffX, height - diffY, toAlt, [alt.bottom, alt.left, alt.bottomLeft]);

						if (!res) {
							break;
						}

						setSize(null, y, res.width, res.height);
					} break;

					case 'middle-right': {
						const
							res = switchSide(e, width + diffX, null, toAlt, alt);

						if (!res) {
							break;
						}

						setSize(null, null, res.width, null);
					} break;

					case 'bottom-right': {
						const
							res = switchSide(e, width + diffX, height + diffY, toAlt, [alt.top, alt.left, alt.topLeft]);

						if (!res) {
							break;
						}

						setSize(null, null, res.width, res.height);
					} break;
				}
			},

			onDragEnd: () => {
				this.setMod('active', false);
				!cancelMinMax && this.emit('resizeEnd');
				cancelMinMax = false;
				type = null;
			}
		});
	}

	/**
	 * "moveSelect" mode watcher
	 *
	 * @param value
	 * @emits moveStart({offsetX: number, offsetY: number, width: number, height: number})
	 * @emits move({x: number, y: number, width: number, height: number})
	 * @emits moveEnd()
	 */
	@wait('loading')
	@params({immediate: true})
	$$moveSelect(value: boolean) {
		const
			{async: $a} = this;

		if (!value) {
			$a.off({group: 'dnd.moveSelect'});
			return;
		}

		const
			{select, img} = this.$refs;

		let
			rWidth,
			rHeight;

		let
			width,
			height;

		let
			offsetY,
			offsetX;

		$a.dnd(select, {
			group: 'dnd.moveSelect',
			onDragStart: (e) => {
				rWidth = img.width;
				rHeight = img.height;
				width = select.offsetWidth;
				height = select.offsetHeight;
				offsetX = e.pageX - select.offsetLeft;
				offsetY = e.pageY - select.offsetTop;
				this.setMod('active', true);
				this.emit('moveStart', {offsetX, offsetY, width, height});
			},

			onDrag: (e) => {
				let
					x = e.pageX - offsetX,
					y = e.pageY - offsetY;

				if (y < 0) {
					y = 0;

				} else if (height + y > rHeight) {
					y = rHeight - height;
					y = y < 0 ? 0 : y;
				}

				if (x < 0) {
					x = 0;

				} else if (width + x > rWidth) {
					x = rWidth - width;
					x = x < 0 ? 0 : x;
				}

				this.setSize({x, y, width, height});
				this.emit('move', {x, y, width, height});
			},

			onDragEnd: () => {
				this.setMod('active', false);
				this.emit('moveEnd');
			}
		});
	}

	/**
	 * Returns selection restrictions by the specified parameters
	 *
	 * @param width
	 * @param height
	 */
	getMinMax(width: number, height: number): {
		minWidth: number,
		maxWidth: number,
		minHeight: number,
		maxHeight: number
	} {
		const
			{width: iWidth, height: iHeight} = this.img,
			{ratio} = this;

		let {minWidth, maxWidth} = this;
		minWidth = minWidth > iWidth ? iWidth : minWidth;
		maxWidth = maxWidth > iWidth ? iWidth : maxWidth;

		let {minHeight, maxHeight} = this;
		minHeight = minHeight > iHeight ? iHeight : minHeight;
		maxHeight = maxHeight > iHeight ? iHeight : maxHeight;

		if (ratio) {
			maxWidth = maxHeight * ratio[0];

			if (width > height) {
				if (width / height > ratio[0]) {
					maxWidth = height > maxWidth ? maxWidth : height;

					const
						val = width / ratio[0];

					if (val > minHeight) {
						minHeight = val;
					}
				}

			} else if (height > width) {
				if (height / width > ratio[1]) {
					maxHeight = width > maxHeight ? maxHeight : width;

					const
						val = height / ratio[1];

					if (val > minWidth) {
						minWidth = val;
					}
				}
			}
		}

		return {minWidth, maxWidth, minHeight, maxHeight};
	}

	/**
	 * Returns bounds of the selection area taking into account the limits and proportions
	 *
	 * @param x
	 * @param y
	 * @param width
	 * @param height
	 */
	getFixSize({x, y, width, height}: $$size): $$size {
		const
			{width: iWidth, height: iHeight} = this.img,
			{minWidth, maxWidth, minHeight, maxHeight, ratio} = this;

		if (ratio) {
			if (width > height) {
				if (width / height > ratio[0]) {
					height = width = width / ratio[0];
				}

			} else if (height > width) {
				if (height / width > ratio[1]) {
					width = height / ratio[1];
				}
			}
		}

		if (width < minWidth) {
			width = minWidth;

		} else if (width > maxWidth) {
			width = maxWidth;
		}

		if (height < minHeight) {
			height = minHeight;

		} else if (height > maxHeight) {
			height = maxHeight;
		}

		if (iWidth > iHeight) {
			if (width > iWidth || height > iHeight) {
				width = height = iHeight;
			}

		} else {
			if (width > iWidth || height > iHeight) {
				width = height = iWidth;
			}
		}

		if (x < 0) {
			x = 0;

		} else if (x + width > iWidth) {
			x = iWidth - width;
		}

		if (y < 0) {
			y = 0;

		} else if (y + height > iHeight) {
			y = iHeight - height;
		}

		return {x, y, width, height};
	}

	/**
	 * Sets bounds the selection area by the specified parameters
	 *
	 * @param x
	 * @param y
	 * @param width
	 * @param height
	 */
	setSize({x, y, width, height}: $$size) {
		const
			{select, clone} = this.$refs;

		if (width) {
			Object.assign(select.style, {
				top: y.px,
				left: x.px,
				width: width.px,
				height: height.px
			});
		}

		clone.style.clip = `rect(
			${y.px},
			${((width || select.offsetWidth) + x).px},
			${((height || select.offsetHeight) + y).px},
			${x.px}
		)`;
	}

	/**
	 * Sets bounds of the selection area by the specified parameters taking into account the limits and proportions
	 * @param params
	 */
	setFixSize(params: $$size): $$size {
		const size = this.getFixSize(params);
		this.setSize(size);
		return size;
	}

	/**
	 * Initialises the selection block
	 * @param [params] - coordinates and size
	 */
	@wait('loading')
	async initSelect(params?: $$size = {}) {
		this.setMod('progress', true);

		try {
			await this.async.promise(this.img.init, {label: $$.initSelect});
		} catch (_) {}

		this._areaEvent = false;

		if (!this.src) {
			return;
		}

		const
			{width: rWidth, height: rHeight} = this.img,
			{minWidth, maxWidth, minHeight, maxHeight} = this;

		if (params.x != null) {
			if (minWidth && minHeight || params.width && params.height) {
				this.setFixSize(Object.assign({width: minWidth, height: minHeight}, params));
			}

		} else {
			let
				w = rWidth > maxWidth ? maxWidth : rWidth,
				h = rHeight > maxHeight ? maxHeight : rHeight;

			if (rWidth > rHeight) {
				w = h;

			} else {
				h = w;
			}

			const
				offset = 20;

			if (!minWidth || w - offset > minWidth) {
				w -= offset;
			}

			if (!minHeight || h - offset > minHeight) {
				h -= offset;
			}

			this.setSize({
				x: rWidth / 2 - w / 2,
				y: rHeight / 2 - h / 2,
				width: w,
				height: h
			});
		}

		this.setMod('progress', false);
	}
}
