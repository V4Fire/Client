/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import symbolGenerator from 'core/symbol';
import bCrop from 'base/b-crop/b-crop';

const
	$$ = symbolGenerator();

/**
 * Synchronization for the freeSelect field
 *
 * @param component
 * @param value
 * @emits selectStart(e: SelectStartEvent)
 * @emits select(rect: Size)
 * @emits selectEnd(rect: Size)
 */
export function syncFreeSelectWatcher<T extends bCrop>(component: T, value: boolean): void {
	const
		c = component,

		// @ts-ignore (access)
		{async: $a} = c;

	if (!value) {
		$a.off({group: 'dnd.freeSelect'});
		return;
	}

	if (!c.resizeSelect) {
		c.resizeSelect = 1;
	}

	const
		// @ts-ignore (access)
		{r, area, select, clone} = c.$refs,
		{offsetWidth: sWidth, offsetHeight: sHeight} = r,

		// @ts-ignore (access)
		{block: $b} = c;

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
			c.emit('selectStart', {pageX, pageY});
		},

		onDrag: (e) => {
			if (init || (!init && Math.abs(e.pageX - pageX) < sWidth * 3 && Math.abs(e.pageY - pageY) < sHeight * 3)) {
				return false;
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

			c.setSize({
				x,
				y,
				width,
				height
			});

			init = true;
			const trigger = new MouseEvent(e.type === 'mousemove' ? 'mousedown' : 'touchstart', e);
			trigger[$$.cancelMinMax] = true;

			const
				r = $b.element('r', {'hor-align': hor, 'vert-align': vert});

			if (!r) {
				return false;
			}

			r.dispatchEvent(trigger);
			c.emit('select', {x, y, width, height});
		},

		onDragEnd: () => {
			$b.removeElMod(select, 'select', 'hidden');

			if (!init) {
				return false;
			}

			init = false;
			// @ts-ignore (access)
			c._areaDown = false;

			const
				{offsetLeft: x, offsetTop: y, offsetWidth: width, offsetHeight: height} = select;

			c.setFixSize({x, y, width, height});
			c.emit('selectEnd', {x, y, width, height});
		}
	});
}

/**
 * Synchronization for the selectByClick field
 *
 * @param component
 * @param value
 * @emits selectByClick(rect: Size)
 */
export function syncSelectByClickWatcher<T extends bCrop>(component: T, value: boolean): void {
	const
		c = component;

	const
		// @ts-ignore (access)
		{async: $a, block: $b, clickWidth, minWidth, maxWidth, clickHeight, minHeight, maxHeight} = c,
		// @ts-ignore (access)
		{area, select} = c.$refs;

	const
		group = {group: 'selectByClick'};

	if (!value) {
		$a.off(group);
		return;
	}

	$a.on(area, 'mousedown touchstart', (e) => {
		if (e.target === area) {
			// @ts-ignore (access)
			c._areaDown = true;
			$b.setElMod(select, 'select', 'hidden', true);
		}
	}, {...group, options: {capture: true}});

	$a.on(area, 'click', (e) => {
		// @ts-ignore (access)
		if (e.target !== area || !c._areaDown) {
			return;
		}

		const
			width = clickWidth <= maxWidth && clickWidth > minWidth ? clickWidth : minWidth,
			height = clickHeight <= maxHeight && clickHeight > minHeight ? clickHeight : minHeight;

		const
			// @ts-ignore (access)
			{top, left} = c.$refs.clone.getPosition();

		const
			x = e.pageX - left - width / 2,
			y = e.pageY - top - height / 2;

		$b.removeElMod(select, 'select', 'hidden');
		c.setFixSize({x, y, width, height});
		c.emit('selectByClick', {x, y, width, height});
	}, group);
}

/**
 * Synchronization for the resizeSelect field
 *
 * @param component
 * @param value
 * @emits resizeStart()
 * @emits resize(rect: Size)
 * @emits resizeEnd()
 */
export function syncResizeSelectWatcher<T extends bCrop>(component: T, value: boolean): void {
	const
		c = component;

	const
		// @ts-ignore (access)
		{area, select, clone, img} = c.$refs,
		// @ts-ignore (access)
		{async: $a, block: $b, ratably, minWidth: defMinWidth, minHeight: defMinHeight} = c;

	if (!value) {
		c.setMod('resizeSelect', false);
		$a.off({group: 'dnd.resizeSelect'});
		return;
	}

	if (value === true) {
		c.removeMod('resizeSelect');
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
				switch (type) {
					case 'top-left': {
						const diff = width - lastWidth;
						top = lastY - diff;
						left = lastX - diff;
						height = lastHeight + diff;
						break;
					}

					case 'bottom-left': {
						const diff = width - lastWidth;
						height = lastHeight + diff;
						left = lastX - diff;
						break;
					}

					case 'top-right':
					case 'bottom-right':
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
				{minWidth, maxWidth, minHeight, maxHeight} = c.getMinMax(width, height);

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
			c.emit('resize', {x: left, y: top, width, height});
		}
	};

	const init = (el: Element, e: MouseEvent, cancelMinMaxForce?: boolean) => {
		if (e[$$.cancelMinMax] || cancelMinMaxForce) {
			minWidth = 0;
			minHeight = 0;
			cancelMinMax = true;

		} else {
			minWidth = defMinWidth;
			minHeight = defMinHeight;
		}

		target = el;

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
		}
	};

	const switchSide = (
		e: MouseEvent,
		width: Nullable<number>,
		height: Nullable<number>,
		control: boolean,
		action: CanArray<Element>
	) => {
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
	};

	$a.dnd(area, {
		group: 'dnd.resizeSelect',
		onDragStart: {
			capture: true,
			// @ts-ignore (access)
			handler: <Function>c.dom.delegateElement('r', (e) => {
				e.stopPropagation();
				c.setMod('active', true);
				init(e.target, e, cancelMinMax);
				!cancelMinMax && c.emit('resizeStart');
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
					const res = switchSide(
						e,
						width - diffX,
						height - diffY, toAlt,
						[alt.bottom, alt.right, alt.bottomRight]
					);

					if (!res) {
						break;
					}

					setSize(x, y, res.width, res.height);
					break;
				}

				case 'middle-left': {
					const
						res = switchSide(e, width - diffX, null, toAlt, alt);

					if (!res) {
						break;
					}

					setSize(x, null, res.width, null);
					break;
				}

				case 'bottom-left': {
					const
						res = switchSide(e, width - diffX, height + diffY, toAlt, [alt.top, alt.right, alt.topRight]);

					if (!res) {
						break;
					}

					setSize(x, null, res.width, res.height);
					break;
				}

				case 'top-middle': {
					const
						res = switchSide(e, null, height - diffY, toAlt, alt);

					if (!res) {
						break;
					}

					setSize(null, y, null, res.height);
					break;
				}

				case 'bottom-middle': {
					const
						res = switchSide(e, null, height + diffY, toAlt, alt);

					if (!res) {
						break;
					}

					setSize(null, null, null, res.height);
					break;
				}

				case 'top-right': {
					const
						res = switchSide(e, width + diffX, height - diffY, toAlt, [alt.bottom, alt.left, alt.bottomLeft]);

					if (!res) {
						break;
					}

					setSize(null, y, res.width, res.height);
					break;
				}

				case 'middle-right': {
					const
						res = switchSide(e, width + diffX, null, toAlt, alt);

					if (!res) {
						break;
					}

					setSize(null, null, res.width, null);
					break;
				}

				case 'bottom-right': {
					const
						res = switchSide(e, width + diffX, height + diffY, toAlt, [alt.top, alt.left, alt.topLeft]);

					if (!res) {
						break;
					}

					setSize(null, null, res.width, res.height);
				}
			}
		},

		onDragEnd: () => {
			c.setMod('active', false);
			!cancelMinMax && c.emit('resizeEnd');
			cancelMinMax = false;
			type = null;
		}
	});
}

/**
 * Synchronization for the moveSelect field
 *
 * @param component
 * @param value
 * @emits moveStart(e: MoveStartEvent)
 * @emits move(rect: Size)
 * @emits moveEnd()
 */
export function syncMoveSelectWatcher<T extends bCrop>(component: T, value: boolean): void {
	const
		c = component,
		// @ts-ignore (access)
		{async: $a} = c;

	if (!value) {
		$a.off({group: 'dnd.moveSelect'});
		return;
	}

	const
		// @ts-ignore (access)
		{select, img} = c.$refs;

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
			c.setMod('active', true);
			c.emit('moveStart', {offsetX, offsetY, width, height});
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

			c.setSize({x, y, width, height});
			c.emit('move', {x, y, width, height});
		},

		onDragEnd: () => {
			c.setMod('active', false);
			c.emit('moveEnd');
		}
	});
}
