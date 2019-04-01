/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

// tslint:disable:no-bitwise

onmessage = (e) => {
	const {original, final, lobes, id} = e.data;
	return new Resizer(original, final, lobes, id);
};

interface LanczosFn {
	(x: number): number;
}

interface Pixel {
	x: number;
	y: number;
}

class Resizer {
	id: unknown;

	originalImg: ImageData;
	tmpImg: ImageData;
	finalImg: ImageData;

	ratio: number;
	rcpRatio: number;
	range: number;

	lanczosFn: LanczosFn;
	cache: Dictionary<Dictionary<number>>;

	center: Pixel;
	iCenter: Pixel;

	prev: number;
	progress: number;

	/**
	 * @param original - original image object
	 * @param final - final image object
	 * @param lobes - smoothing level
	 * @param id - task ID
	 */
	constructor(original: ImageData, final: ImageData, lobes: number, id: unknown) {
		postMessage({event: {type: 'init', data: {id}}}, '*');

		this.id = id;
		this.originalImg = original;
		this.finalImg = final;

		const
			{width, height} = final,
			data = width * height * 3;

		this.tmpImg = {
			width,
			height,
			data: typeof Uint8ClampedArray === 'undefined' ? <any>(new Uint8Array(data)) : new Uint8ClampedArray(data)
		};

		this.lanczosFn = this.createLanczosFn(lobes);
		this.ratio = original.width / width;
		this.rcpRatio = 1 / this.ratio;
		this.range = Math.ceil((this.ratio * lobes) / 2);
		this.cache = Object.create(null);
		this.center = {x: 0, y: 0};
		this.iCenter = {x: 0, y: 0};
		this.progress = 0;
		this.prev = 0;
		this.process(-1);
	}

	/**
	 * Creates Lanczos function
	 * @param lobes - smoothing level
	 */
	createLanczosFn(lobes: number): (x: number) => number {
		return (x) => {
			if (x > lobes) {
				return 0;
			}

			x *= Math.PI;
			if (Math.abs(x) < 1e-16) {
				return 1;
			}

			const xx = x / lobes;
			return Math.sin(x) * Math.sin(xx) / x / xx;
		};
	}

	/**
	 * Starts image processing for the specified column
	 * @param column
	 */
	process(column: number): void {
		const
			oData = this.originalImg.data,
			dData = this.tmpImg.data;

		const
			{width, height} = this.tmpImg,
			{width: oWidth, height: oHeight} = this.originalImg,
			{center, iCenter, cache} = this;

		while (++column < width) {
			this.progress = Math.round((column / width) * 100);

			if (this.progress % 4 === 0 && this.progress !== this.prev) {
				postMessage({
					event: {
						type: 'progress',
						data: {
							progress: this.progress,
							id: this.id
						}
					}
				}, '*');
			}

			this.prev = this.progress;
			center.x = (column + 0.5) * this.ratio;
			iCenter.x = this.center.x << 0;

			for (let v = 0; v < height; v++) {
				center.y = (v + 0.5) * this.ratio;
				iCenter.y = center.y << 0;

				let
					[a, r, g, b] = [0, 0, 0, 0];

				for (let i = iCenter.x - this.range; i <= iCenter.x + this.range; i++) {
					if (i < 0 || i >= oWidth) {
						continue;
					}

					const
						fX = (Math.abs(i - center.x) * 1e3) << 0,
						cacheVal = cache[fX] = cache[fX] || {};

					for (let j = iCenter.y - this.range; j <= iCenter.y + this.range; j++) {
						if (j < 0 || j >= oHeight) {
							continue;
						}

						const
							fY = (Math.abs(j - center.y) * 1e3) << 0;

						if (cacheVal[fY] === undefined) {
							cacheVal[fY] = this.lanczosFn(
								Math.sqrt(
									fX * this.rcpRatio * fX * this.rcpRatio +
									fY * this.rcpRatio * fY * this.rcpRatio
								) / 1000
							);
						}

						const
							weight = <number>cacheVal[fY];

						if (weight > 0) {
							const
								idx = (j * oWidth + i) * 4;

							a += weight;
							r += weight * oData[idx];
							g += weight * oData[idx + 1];
							b += weight * oData[idx + 2];
						}
					}
				}

				const
					idx = (v * width + column) * 3;

				dData[idx] = r / a;
				dData[idx + 1] = g / a;
				dData[idx + 2] = b / a;
			}
		}

		this.progress = Math.round(
			(column / width) * 1e2
		);

		postMessage({
			event: {
				type: 'progress',
				data: {
					progress: this.progress,
					id: this.id
				}
			}
		}, '*');

		this.end();
	}

	/**
	 * Applies the changes to the final image
	 */
	end(): void {
		const
			{width, height} = this.tmpImg;

		const
			fData = this.finalImg.data,
			dData = this.tmpImg.data;

		let
			idx,
			idx2;

		for (let i = 0; i < width; i++) {
			for (let j = 0; j < height; j++) {
				idx = (j * width + i) * 3;
				idx2 = (j * width + i) * 4;
				fData[idx2] = dData[idx];
				fData[idx2 + 1] = dData[idx + 1];
				fData[idx2 + 2] = dData[idx + 2];
			}
		}

		postMessage({
			event: {
				type: 'complete',
				data: {
					id: this.id,
					img: this.finalImg,
					width: this.tmpImg.width,
					height: this.tmpImg.height
				}
			}
		}, '*');
	}
}
