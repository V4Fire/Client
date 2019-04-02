/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Editor from 'core/image-editor';

import bCrop from 'base/b-crop/b-crop';
import bProgress from 'base/b-progress/b-progress';
import iVisible from 'traits/i-visible/i-visible';

import iBlock, { component, prop, field, system, wait, hook, ModsDecl } from 'super/i-block/i-block';
import { Size, StrSize, RotateSide, Tools, NormalizedTools } from 'base/b-image-editor/modules/interface';

export * from 'base/b-image-editor/modules/interface';
export * from 'super/i-block/i-block';

@component()
export default class bImageEditor extends iBlock implements iVisible {
	/**
	 * Initial image src
	 */
	@prop(String)
	srcProp!: string;

	/**
	 * Image width
	 */
	@prop([Number, String])
	width: StrSize = 'auto';

	/**
	 * Image height
	 */
	@prop([Number, String])
	height: StrSize = 'auto';

	/**
	 * Image maximum width
	 */
	@prop(Number)
	maxWidth: number = 600;

	/**
	 * Image maximum height
	 */
	@prop(Number)
	maxHeight: number = 600;

	/**
	 * Image alt text
	 */
	@prop(String)
	alt: string = '';

	/**
	 * Image smoothing level
	 */
	@prop(Number)
	smooth: number = 1;

	/**
	 * If true, then size limits for processing will be skipped
	 */
	@prop(Number)
	skipTest: boolean = false;

	/**
	 * Initial image tools options
	 */
	@prop(Object)
	toolsProp: Tools = {};

	/**
	 * Link for a canvas element
	 */
	@system(() => document.createElement('canvas'))
	canvas!: HTMLCanvasElement;

	/**
	 * Link for a buffer canvas element
	 */
	@system()
	buffer!: HTMLCanvasElement;

	/**
	 * Link for a CanvasRenderingContext2D element
	 */
	@system({
		after: 'canvas',
		init: (o: bImageEditor) => o.canvas.getContext('2d')
	})

	ctx!: CanvasRenderingContext2D;

	/**
	 * Image src
	 */
	@field((o) => o.sync.link('srcProp'))
	src!: string;

	/**
	 * Image tools options
	 */
	@field((o) => o.sync.link((val) =>
		Object.mixin(true, {crop: {}, rotate: {left: true, right: true}}, val)))

	tools!: NormalizedTools;

	/**
	 * Link for the source image
	 */
	get img(): HTMLImageElement {
		return this.tools.crop ? this.$refs.crop.img : this.$refs.img;
	}

	/** @inheritDoc */
	static readonly mods: ModsDecl = {
		...iVisible.mods
	};

	/** @override */
	protected readonly $refs!: {
		img: HTMLImageElement;
		crop: bCrop;
		progress: bProgress;
	};

	/** @private */
	@system()
	private _n: number = 0;

	/**
	 * Initialises an image
	 *
	 * @param [src]
	 * @param [thumbRect]
	 *
	 * @emits imageProgress(progress: number, id: unknown)
	 * @emits imageInit(canvas: HTMLCanvasElement, id: unknown)
	 * @emits imageError(err: Error)
	 */
	@hook('created')
	async initImage(src?: string, thumbRect?: Size): Promise<CanUndef<HTMLCanvasElement>> {
		this.src = src || this.src;

		if (!this.src) {
			return;
		}

		const
			{async: $a} = this,
			group = {group: 'initImage'};

		$a.clearAll(group);
		this.setMod('progress', true);

		const r = $a.promise<{canvas: HTMLCanvasElement; id: unknown}>(new Promise(async (resolve, reject) => {
			const img = Object.assign(new Image(), {
				src: this.src
			});

			const workers = Editor.resize({
				img: await $a.promise(img.init, group),

				onError: reject,
				onProgress: (progress, id) => {
					this.$refs.progress.value = progress;
					this.emit('imageProgress', progress, id);
				},

				onComplete: async (canvas, id) => {
					$a.terminateWorker(group);

					const
						buffer = this.buffer = document.createElement('canvas');

					buffer.width = canvas.width;
					buffer.height = canvas.height;
					(<CanvasRenderingContext2D>buffer.getContext('2d')).drawImage(canvas, 0, 0);
					this.src = canvas.toDataURL('image/png');

					await this.nextTick(group);
					await $a.promise<unknown>(thumbRect ? this.initSelect(thumbRect) : this.img.init, group);

					resolve({canvas, id});
				},

				width: this.maxWidth,
				height: this.maxHeight,
				canvas: this.canvas,
				smooth: this.smooth,
				skipTest: this.skipTest
			});

			for (let i = 0; i < workers.length; i++) {
				$a.worker(workers[i], group);
			}

		}), group);

		try {
			const {canvas, id} = await r;
			this.setMod('progress', false);
			this.emit('imageInit', canvas, id);
			return canvas;

		} catch (err) {
			this.setMod('progress', false);
			this.emit('imageError', err);
		}
	}

	/**
	 * Initialises the selection area
	 * @param [params] - selection bounds and parameters
	 */
	async initSelect(params?: Size): Promise<void> {
		if (!this.tools.crop) {
			this.tools.crop = {};
			await this.nextTick();
		}

		await this.$refs.crop.initSelect(params);
	}

	/**
	 * Rotates the image
	 *
	 * @param [side] - "left" or "right"
	 * @emits rotate(side: RotateSide)
	 */
	@wait('ready')
	async rotate(side: RotateSide = 'left'): Promise<void> {
		const
			{canvas, ctx, buffer} = this;

		let
			{width, height} = buffer;

		if (side === 'left') {
			this._n--;

		} else {
			this._n++;
		}

		if (Math.abs(this._n) === 4) {
			this._n = 0;
		}

		const
			{_n} = this;

		const
			max = width > height ? width : height,
			val = _n / _n;

		ctx.clearRect(0, 0, max, max);
		ctx.save();

		if (_n % 2 !== 0) {
			const
				nHeight = width;

			let
				nnHeight,
				nnWidth;

			if (nHeight > height) {
				nnHeight = height;
				nnWidth = Math.round((height * height) / width);

			} else {
				nnWidth = width;
				nnHeight = Math.round((width * width) / height);
			}

			canvas.width = nnWidth;
			canvas.height = nnHeight;

			width = nnHeight;
			height = nnWidth;

			if (_n === -1 || _n === 3) {
				ctx.translate(0, width);
				ctx.rotate((Math.PI / 180) * -90);

			} else {
				ctx.translate(height, 0);
				ctx.rotate((Math.PI / 180) * 90);
			}

		} else {
			canvas.width = width;
			canvas.height = height;
			ctx.translate(val * width, val * height);
			ctx.rotate(val * 180 * (Math.PI / 180));
		}

		ctx.drawImage(this.buffer, 0, 0, width, height);
		ctx.restore();

		this.src = canvas.toDataURL('image/png');
		await this.nextTick();
		this.emit('rotate', side);
	}

	/**
	 * Returns bounds of the selected area
	 */
	getSelectedRect(): Size {
		if (this.tools.crop) {
			return this.$refs.crop.selectedRect;
		}

		return {
			x: 0,
			y: 0,
			width: this.canvas.width,
			height: this.canvas.height
		};
	}

	/**
	 * Returns image data of the selected area
	 */
	getSelectedImageData(): ImageData {
		if (this.tools.crop) {
			const {x, y, width, height} = this.$refs.crop.selectedRect;
			return this.ctx.getImageData(x, y, width, height);
		}

		return this.getImageData();
	}

	/**
	 * Returns data uri of the selected area
	 *
	 * @param [mime]
	 * @param [quality]
	 */
	getSelectedImageDataURL(mime: string = 'image/png', quality: number = 1): string {
		if (this.tools.crop) {
			const
				{x, y, width, height} = this.$refs.crop.selectedRect;

			const
				data = this.ctx.getImageData(x, y, width, height),
				canvas = document.createElement('canvas');

			canvas.width = width;
			canvas.height = height;
			(<CanvasRenderingContext2D>canvas.getContext('2d')).putImageData(data, 0, 0);

			return canvas.toDataURL(mime, quality);
		}

		return this.getImageDataURL(mime, quality);
	}

	/**
	 * Returns blob data of the selected area
	 *
	 * @param [mime]
	 * @param [quality]
	 */
	getSelectedImageBlob(mime: string = 'image/png', quality: number = 1): Promise<Blob | null> {
		if (this.tools.crop) {
			const
				{x, y, width, height} = this.$refs.crop.selectedRect;

			const
				data = this.ctx.getImageData(x, y, width, height),
				canvas = document.createElement('canvas');

			canvas.width = width;
			canvas.height = height;
			(<CanvasRenderingContext2D>canvas.getContext('2d')).putImageData(data, 0, 0);

			return new Promise((resolve) => canvas.toBlob(resolve, mime, quality));
		}

		return this.getImageBlob(mime, quality);
	}

	/**
	 * Returns image data of the source image
	 */
	getImageData(): ImageData {
		return this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
	}

	/**
	 * Returns data uri of the source image
	 *
	 * @param [mime]
	 * @param [quality]
	 */
	getImageDataURL(mime: string = 'image/png', quality: number = 1): string {
		return this.canvas.toDataURL(mime, quality);
	}

	/**
	 * Returns blob data of the source image
	 *
	 * @param [mime]
	 * @param [quality]
	 */
	getImageBlob(mime: string = 'image/png', quality: number = 1): Promise<Blob | null> {
		return new Promise((resolve) => this.canvas.toBlob(resolve, mime, quality));
	}

	/** @override */
	protected initModEvents(): void {
		super.initModEvents();
		this.localEvent.on('block.mod.set.progress.*', ({value}) => {
			const {crop} = this.$refs;
			crop && crop.setMod('parentProgress', value);
		});
	}
}
