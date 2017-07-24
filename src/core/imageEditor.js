'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { RawWorker } from 'core/worker';
export class ImageEditorError extends Error {}

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
			lobes: 1
		}
	},

	/**
	 * Scales an image to the specified size
	 * (returns an array of workers)
	 *
	 * @param params
	 * @param [params.id] - task id
	 *
	 * @param params.canvas - reference to the output image canvas
	 * @param params.img - reference to the source image
	 *
	 * @param [params.width=200] - maximum width (if higher, the image is scaled)
	 * @param [params.height=200] - maximum height (if higher, the image is scaled)
	 * @param [params.lobes=1] - smoothing
	 *
	 * @param [params.skipTest=false] - if true, the size limit for processing are removed
	 * @param [params.ratio=[2,3]] - allowable ratio of width to height
	 * @param [params.minWidth=200] - minimum image width (if lower, that throws an error)
	 * @param [params.minHeight=200] - minimum image height (if lower, that throws an error)
	 * @param [params.maxWidth=7e3] - maximum image width (if higher, that throws an error)
	 * @param [params.maxHeight=7e3] - maximum image height (if higher, that throws an error)
	 *
	 * @param [params.onInit]
	 * @param [params.onProgress]
	 * @param params.onComplete
	 * @param params.onError
	 */
	resize(params: {
		id?: string,
		img: HTMLCanvasElement | HTMLImageElement,
		canvas?: HTMLCanvasElement,
		width?: number,
		height?: number,
		skipTest?: boolean,
		ratio?: Array<number>,
		minWidth?: number,
		minHeight?: number,
		maxWidth?: number,
		maxHeight?: number,
		lobes?: number,
		init?: (id: ?string) => void,
		progress?: (progress: number, id: ?string) => void,
		complete(canvas: HTMLCanvasElement, id: ?string): void,
		error(err: Error, id: ?string): void

	}): Array<Worker> {
		const p = {...this.setup.resize, ...params};
		p.canvas = p.canvas || document.createElement('canvas');

		const
			{canvas, img, id, lobes, onComplete, onError} = p,
			workers = [];

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
				onError(new ImageEditorError('INVALID_SIZE'));
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

		if ((side ? iWidth / maxWidth : iHeight / maxHeight) <= 2.5 && lobes === 1) {
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
			max = 700;

		let
			pHeight,
			pWidth;

		if (side) {
			pWidth = max;
			pHeight = Math.round(iHeight * max / iWidth);

		} else {
			pHeight = max;
			pWidth = Math.round(iWidth * max / iHeight);
		}

		let pre;
		if ((side ? img.width > pWidth : img.height > pHeight) && lobes === 1) {
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

		const
			workerCount = 1;

		let counter;
		function createWorker(num) {
			if (counter === undefined) {
				counter = workerCount;
			}

			const original = ctx.getImageData(
				Math.floor(num * iWidth / workerCount),
				0,
				Math.floor((num + 1) * iWidth / workerCount),
				iHeight
			);

			const
				start = Math.floor(num * width / workerCount),
				end = Math.floor((num + 1) * width / workerCount);

			const final = ctx.getImageData(
				start,
				0,
				end,
				height
			);

			const
				worker = new RawWorker(require('raw!core/workers/lanczos'));

			worker.postMessage({
				id,
				lobes,
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
						if (counter === workerCount) {
							canvas.width = width;
							canvas.height = height;
						}

						ctx.putImageData(e.data.img, start, 0, 0, 0, end, height);
						counter--;

						if (!counter) {
							onComplete(canvas, id);
						}

						break;
				}
			};

			return worker;
		}

		for (let i = 0; i < workerCount; i++) {
			workers.push(createWorker(i));
		}

		return workers;
	}
};
