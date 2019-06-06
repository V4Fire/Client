/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import symbolGenerator from 'core/symbol';
import iVisible from 'traits/i-visible/i-visible';
import iBlock, { component, prop, field, system, wait, watch, ModsDecl } from 'super/i-block/i-block';
import { SizeOff, MinMax, Ratio, Size, StrSize } from 'base/b-crop/modules/interface';
import * as watchers from 'base/b-crop/modules/watchers';

export * from 'base/b-crop/modules/interface';
export * from 'super/i-block/i-block';

export const
	$$ = symbolGenerator();

@component()
export default class bCrop extends iBlock implements iVisible {
	/**
	 * Image src
	 */
	@prop({
		type: String,
		watch: {
			fn: 'initSelect',
			immediate: true
		}
	})

	readonly src!: string;

	/**
	 * Image width
	 */
	@prop([Number, String])
	readonly width: StrSize = 'auto';

	/**
	 * Image height
	 */
	@prop([Number, String])
	readonly height: StrSize = 'auto';

	/**
	 * Image alt
	 */
	@prop(String)
	readonly alt: string = '';

	/**
	 * Initial crop area minimal width
	 */
	@prop([Number, Boolean])
	readonly minWidthProp: SizeOff = 200;

	/**
	 * Initial crop area minimal height
	 */
	@prop([Number, Boolean])
	readonly minHeightProp: SizeOff = 200;

	/**
	 * Initial crop area maximum width
	 */
	@prop([Number, Boolean])
	readonly maxWidthProp: SizeOff = 600;

	/**
	 * Initial crop area maximum height
	 */
	@prop([Number, Boolean])
	readonly maxHeightProp: SizeOff = 600;

	/**
	 * Crop area width by click
	 */
	@prop(Number)
	readonly clickWidth: number = 200;

	/**
	 * Crop area height by click
	 */
	@prop(Number)
	readonly clickHeight: number = 200;

	/**
	 * Crop area ratio
	 */
	@prop([Array, Number])
	readonly ratio: Ratio = [1, 3];

	/**
	 * If true, then will be enabled "ratably" mode
	 */
	@prop(Boolean)
	readonly ratably: boolean = false;

	/**
	 * If true, then will be enabled "free select" mode
	 */
	@prop(Boolean)
	readonly freeSelect: boolean = true;

	/**
	 * If true, then a crop area can be selected by click
	 */
	@prop(Boolean)
	readonly selectByClick: boolean = true;

	/**
	 * If true, then a crop area can be resize by a mouse
	 */
	@prop(Boolean)
	readonly resizeSelectProp: boolean = true;

	/**
	 * If true, then a crop area can be moving by a mouse
	 */
	@prop(Boolean)
	readonly moveSelect: boolean = true;

	/**
	 * Crop area minimal width
	 */
	@field((o) => o.sync.link((val) => val === false ? 0 : val))
	minWidth!: number;

	/**
	 * Crop area minimal height
	 */
	@field((o) => o.sync.link((val) => val === false ? 0 : val))
	minHeight!: number;

	/**
	 * Crop area maximum width
	 */
	@field((o) => o.sync.link((val) => val === false ? Infinity : val))
	maxWidth!: number;

	/**
	 * Crop area maximum height
	 */
	@field((o) => o.sync.link((val) => val === false ? Infinity : val))
	maxHeight!: number;

	/**
	 * Store for resizeSelect
	 */
	@field((o) => o.sync.link('resizeSelectProp'))
	resizeSelect!: boolean | number;

	/**
	 * Bounds of the selection area
	 */
	get selectedRect(): Size {
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

	/** @inheritDoc */
	static readonly mods: ModsDecl = {
		...iVisible.mods,

		parentProgress: [
			'true',
			['false']
		]
	};

	/** @override */
	protected readonly $refs!: {
		area: HTMLDivElement;
		select: HTMLDivElement;
		clone: HTMLDivElement;
		original: HTMLDivElement;
		img: HTMLImageElement;
		r: HTMLDivElement;
	};

	/** @private */
	@system()
	private _areaEvent!: boolean;

	/** @private */
	@system()
	private _areaDown!: boolean;

	/**
	 * Returns selection restrictions by the specified parameters
	 *
	 * @param width
	 * @param height
	 */
	getMinMax(width: number, height: number): MinMax {
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
	getFixSize({x, y, width, height}: Size): Size {
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
	setSize({x, y, width, height}: Size): void {
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
	setFixSize(params: Size): Size {
		const size = this.getFixSize(params);
		this.setSize(size);
		return size;
	}

	/**
	 * Initialises the selection block
	 * @param [params] - coordinates and size
	 */
	@wait('loading')
	async initSelect(params: Partial<Size> = {}): Promise<void> {
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
				this.setFixSize({width: minWidth, height: minHeight, ...<Size>params});
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

	/**
	 * Synchronization for the freeSelect field
	 *
	 * @param value
	 * @emits selectStart(e: SelectStartEvent)
	 * @emits select(rect: Size)
	 * @emits selectEnd(rect: Size)
	 */
	@watch({field: 'freeSelect', immediate: true})
	@wait('loading')
	protected syncFreeSelectWatcher(value: boolean): void {
		watchers.syncFreeSelectWatcher(this, value);
	}

	/**
	 * Synchronization for the selectByClick field
	 *
	 * @param value
	 * @emits selectByClick(rect: Size)
	 */
	@watch({field: 'selectByClick', immediate: true})
	@wait('loading')
	protected syncSelectByClickWatcher(value: boolean): void {
		watchers.syncSelectByClickWatcher(this, value);
	}

	/**
	 * Synchronization for the resizeSelect field
	 *
	 * @param value
	 * @emits resizeStart()
	 * @emits resize(rect: Size)
	 * @emits resizeEnd()
	 */
	@watch({field: 'resizeSelect', immediate: true})
	@wait('loading')
	protected syncResizeSelectWatcher(value: boolean): void {
		watchers.syncResizeSelectWatcher(this, value);
	}

	/**
	 * Synchronization for the moveSelect field
	 *
	 * @param value
	 * @emits moveStart(e: MoveStartEvent)
	 * @emits move(rect: Size)
	 * @emits moveEnd()
	 */
	@watch({field: 'moveSelect', immediate: true})
	@wait('loading')
	protected syncMoveSelectWatcher(value: boolean): void {
		watchers.syncMoveSelectWatcher(this, value);
	}

	/** @override */
	protected initModEvents(): void {
		super.initModEvents();
		iVisible.initModEvents(this);
	}
}
