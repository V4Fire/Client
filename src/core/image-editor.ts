/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { RawWorker } from 'core/worker';

export interface ResizeParams {
	id?: string;
	img: HTMLCanvasElement | HTMLImageElement;
	canvas?: HTMLCanvasElement;
	width?: number;
	height?: number;
	skipTest?: boolean;
	ratio?: Array<number>;
	minWidth?: number;
	minHeight?: number;
	maxWidth?: number;
	maxHeight?: number;
	smooth?: number;
	onError(err: Error, id: CanUndef<string>): void
	onComplete(canvas: HTMLCanvasElement, id: CanUndef<string>): void;
	onInit?(id: CanUndef<string>): void;
	onProgress?(progress: number, id: CanUndef<string>): void;
}

export default {
	/**
	 * Default config
	 */
	setup: {
		resize: {
			width: 200,
			height: 200,
			skipTest: false,
			ratio: [2, 3],
			minWidth: 200,
			minHeight: 200,
			maxWidth: 7e3,
			maxHeight: 7e3,
			smooth: 1
		}
	},

	/**
	 * Scales an image to the specified size
	 * (returns an array of workers)
	 *
	 * @param params
	 * @param [params.id] - task id
	 *
	 * @param params.canvas - reference to an output image canvas
	 * @param params.img - reference to a source image
	 *
	 * @param [params.width=200] - maximum width
	 * @param [params.height=200] - maximum height
	 * @param [params.smooth=1] - smoothing level
	 *
	 * @param [params.skipTest=false] - if true, then size limits for processing will be skipped
	 * @param [params.ratio=[2,3]] - allowable ratio of a width to a height
	 * @param [params.minWidth=200] - minimum image width
	 * @param [params.minHeight=200] - minimum image height
	 * @param [params.maxWidth=7e3] - maximum image width
	 * @param [params.maxHeight=7e3] - maximum image height
	 *
	 * @param params.onComplete
	 * @param params.onError
	 * @param [params.onInit]
	 * @param [params.onProgress]
	 */
	resize(params: ResizeParams): Array<Worker> {
		const p = {...this.setup.resize, ...params};
		p.canvas = p.canvas || document.createElement('canvas');

		const
			{canvas, img, id, smooth, onComplete, onError} = p,
			workers = <Worker[]>[];

		let
			{width: iWidth, height: iHeight} = img;

		canvas.width = iWidth;
		canvas.height = iHeight;

		if (!p.skipTest) {
			if (
				iWidth < p.minWidth ||
				iWidth > p.maxWidth ||
				iHeight < p.minHeight ||
				iHeight > p.maxHeight ||
				iWidth > p.ratio[0] * iHeight ||
				iHeight > p.ratio[1] * iWidth

			) {
				onError(new TypeError('Invalid image size'));
				return workers;
			}
		}

		const
			ctx = canvas.getContext('2d');

		try {
			ctx.drawImage(img, 0, 0);

		} catch (err) {
			onError(err);
			return workers;
		}

		const
			side = iWidth > iHeight,
			{width: maxWidth, height: maxHeight} = p;

		if (side ? iWidth <= maxWidth : iHeight <= maxHeight) {
			onComplete(canvas, id);
			return workers;
		}

		if ((side ? iWidth / maxWidth : iHeight / maxHeight) <= 2.5 && smooth === 1) {
			let
				lWidth,
				lHeight;

			if (side) {
				lWidth = maxWidth;
				lHeight = Math.round(iHeight * maxWidth / iWidth);

			} else {
				lHeight = maxHeight;
				lWidth = Math.round(iWidth * maxHeight / iHeight);
			}

			canvas.width = lWidth;
			canvas.height = lHeight;
			ctx.drawImage(img, 0, 0, lWidth, lHeight);

			onComplete(canvas, id);
			return workers;
		}

		const
			WORKER_NUMBER = 1,
			MAX = 700;

		let
			pHeight,
			pWidth;

		if (side) {
			pWidth = MAX;
			pHeight = Math.round(iHeight * MAX / iWidth);

		} else {
			pHeight = MAX;
			pWidth = Math.round(iWidth * MAX / iHeight);
		}

		let
			pre;

		if ((side ? img.width > pWidth : img.height > pHeight) && smooth === 1) {
			canvas.width = pWidth;
			canvas.height = pHeight;
			ctx.drawImage(img, 0, 0, pWidth, pHeight);
			pre = true;

		} else {
			canvas.width = iWidth;
			canvas.height = iHeight;
			ctx.drawImage(img, 0, 0);
		}

		iWidth = pre ? pWidth : iWidth;
		iHeight = pre ? pHeight : iHeight;

		let
			width,
			height;

		if (side) {
			width = maxWidth;
			height = Math.round(iHeight * maxWidth / iWidth);

		} else {
			height = maxHeight;
			width = Math.round(iWidth * maxHeight / iHeight);
		}

		if (side ? iWidth <= width : iHeight <= height) {
			onComplete(canvas, id);
			return workers;
		}

		let
			counter;

		const createWorker = (num) => {
			if (counter === undefined) {
				counter = WORKER_NUMBER;
			}

			const original = ctx.getImageData(
				Math.floor(num * iWidth / WORKER_NUMBER),
				0,
				Math.floor((num + 1) * iWidth / WORKER_NUMBER),
				iHeight
			);

			const
				start = Math.floor(num * width / WORKER_NUMBER),
				end = Math.floor((num + 1) * width / WORKER_NUMBER);

			const final = ctx.getImageData(
				start,
				0,
				end,
				height
			);

			const
				// @ts-ignore
				worker = RawWorker(require('raw!core/workers/lanczos'));

			worker.postMessage({
				id,
				smooth,
				original,
				final
			});

			worker.onmessage = ({data: {event: e}}) => {
				switch (e.type) {
					case 'init':
						p.onInit && p.onInit(e.data.id);
						break;

					case 'progress':
						p.onProgress && p.onProgress(e.data.progress, e.data.id);
						break;

					case 'complete':
						if (counter === WORKER_NUMBER) {
							canvas.width = width;
							canvas.height = height;
						}

						ctx.putImageData(e.data.img, start, 0, 0, 0, end, height);
						counter--;

						if (!counter) {
							onComplete(canvas, id);
						}
				}
			};

			return worker;
		};

		for (let i = 0; i < WORKER_NUMBER; i++) {
			workers.push(createWorker(i));
		}

		return workers;
	}
};
