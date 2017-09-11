'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Editor from 'core/imageEditor';
import iBlock, { abstract, field, wait } from 'super/i-block/i-block';
import { component } from 'core/component';
import type { $$size } from 'base/b-crop/b-crop';

const
	$C = require('collection.js');

@component()
export default class bImageEditor extends iBlock {
	/**
	 * Initial image src
	 */
	srcProp: string;

	/**
	 * Image width
	 */
	width: ?number | string = 'auto';

	/**
	 * Image height
	 */
	height: ?number | string = 'auto';

	/**
	 * Image maximum width
	 */
	maxWidth: number = 600;

	/**
	 * Image maximum height
	 */
	maxHeight: number = 600;

	/**
	 * Image alt text
	 */
	alt: string;

	/**
	 * Image smooth level
	 */
	smooth: number = 1;

	/**
	 * If true, then will be skipped tests for the image
	 */
	skipTest: boolean = false;

	/**
	 * Initial image tools options
	 */
	toolsProp: Object = {};

	/**
	 * Link for a canvas element
	 */
	@abstract
	canvas: ?HTMLCanvasElement;

	/**
	 * Link for a buffer canvas element
	 */
	@abstract
	buffer: ?HTMLCanvasElement;

	/**
	 * Link for a CanvasRenderingContext2D element
	 */
	@abstract
	ctx: ?CanvasRenderingContext2D;

	/**
	 * Image src
	 */
	@field((o) => o.link('srcProp'))
	src: string;

	/**
	 * Image tools options
	 */
	@field((o) => o.link('toolsProp', (val) => {
		if (Object.fastCompare(val, o.tools)) {
			return o.tools;
		}

		return Object.mixin(true, {crop: {}, rotate: {left: true, right: true}}, val);
	}))

	tools: Object;

	/** @private */
	@abstract
	_n: number = 0;

	/** @override */
	get $refs(): {
		crop: ?bCrop,
		img: ?HTMLImageElement,
		progress: bProgress
	} {}

	/**
	 * Link for the source image
	 */
	get img(): HTMLImageElement {
		return this.tools.crop ? this.$refs.crop.img : this.$refs.img;
	}

	/**
	 * Initialises an image
	 *
	 * @param [src]
	 * @param [thumbRect]
	 *
	 * @emits imageProgress(progress: number, id: any)
	 * @emits imageInit(canvas: HTMLCanvasElement, id: any)
	 * @emits imageError(err: Error)
	 */
	async initImage(src?: string, thumbRect?: $$size) {
		this.src = src || this.src;

		if (!this.src) {
			return;
		}

		const
			{async: $a} = this;

		const
			group = 'initImage';

		$a.clearAll({group});
		this.setMod('progress', true);

		const r = $a.promise(new Promise(async (resolve, reject) => {
			const img = Object.assign(new Image(), {src: this.src});
			const workers = Editor.resize({
				img: await $a.promise(img.init, {group}),

				onError: reject,
				onProgress: (progress, id) => {
					this.$refs.progress.value = progress;
					this.emit('imageProgress', progress, id);
				},

				onComplete: async (canvas, id) => {
					$a.terminateAllWorkers({group});

					const
						buffer = this.buffer = document.createElement('canvas');

					buffer.width = canvas.width;
					buffer.height = canvas.height;
					buffer.getContext('2d').drawImage(canvas, 0, 0);

					this.src = canvas.toDataURL('image/png');
					await this.nextTick({group});
					await $a.promise(thumbRect ? this.initSelect(thumbRect) : this.img.init, {group});
					resolve({canvas, id});
				},

				width: this.maxWidth,
				height: this.maxHeight,
				canvas: this.canvas,
				lobes: this.smooth,
				skipTest: this.skipTest
			});

			$C(workers).forEach((worker) => $a.worker(worker, {group}));

		}), {group});

		try {
			const {canvas, id} = await r;
			this.setMod('progress', false);
			this.emit('imageInit', canvas, id);

		} catch (err) {
			this.setMod('progress', false);
			this.emit('imageError', err);
		}
	}

	/**
	 * Initialises the selection area
	 * @param [params] - selection bounds and parameters
	 */
	async initSelect(params?: $$size) {
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
	 * @emits rotate(side: string)
	 */
	@wait('ready')
	async rotate(side?: string = 'left') {
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
				ctx.rotate(-90 * (Math.PI / 180));

			} else {
				ctx.translate(height, 0);
				ctx.rotate(90 * (Math.PI / 180));
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
	getSelectedRect(): $$size {
		if (this.tools.crop) {
			return this.$refs.crop.getSelectedRect();
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
			const {x, y, width, height} = this.$refs.crop.getSelectedRect();
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
	getSelectedImageDataURL(mime?: string = 'image/png', quality?: number = 1): string {
		if (this.tools.crop) {
			const
				{x, y, width, height} = this.$refs.crop.getSelectedRect();

			const
				data = this.ctx.getImageData(x, y, width, height),
				canvas = document.createElement('canvas');

			canvas.width = width;
			canvas.height = height;
			canvas.getContext('2d').putImageData(data, 0, 0);

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
	getSelectedImageBlob(mime?: string = 'image/png', quality?: number = 1): Promise<Blob> {
		if (this.tools.crop) {
			const
				{x, y, width, height} = this.$refs.crop.getSelectedRect();

			const
				data = this.ctx.getImageData(x, y, width, height),
				canvas = document.createElement('canvas');

			canvas.width = width;
			canvas.height = height;
			canvas.getContext('2d').putImageData(data, 0, 0);

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
	getImageDataURL(mime?: string = 'image/png', quality?: number = 1): string {
		return this.canvas.toDataURL(mime, quality);
	}

	/**
	 * Returns blob data of the source image
	 *
	 * @param [mime]
	 * @param [quality]
	 */
	getImageBlob(mime = 'image/png', quality = 1): Promise<Blob> {
		return new Promise((resolve) => this.canvas.toBlob(resolve, mime, quality));
	}

	/** @inheritDoc */
	async created() {
		this.canvas = document.createElement('canvas');
		this.ctx = this.canvas.getContext('2d');

		this.localEvent.on('block.mod.set.progress.*', ({value}) => {
			const {crop} = this.$refs;
			crop && crop.setMod('parentProgress', value);
		});

		await this.initImage();
	}
}
