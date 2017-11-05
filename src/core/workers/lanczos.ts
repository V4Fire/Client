/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

onmessage = function (e: ServiceWorkerMessageEvent): void {
	const {original, final, lobes, id} = e.data;
	new Resizer(original, final, lobes, id);
};

class Resizer {
	/**
	 * @param original - original image object
	 * @param final - final image object
	 * @param lobes - smoothing level
	 * @param id - task ID
	 */
	constructor(original: ImageData, final: ImageData, lobes: number, id: any) {
		postMessage({
			event: {
				type: 'init',
				data: {id}
			}
		});

		this.id = id;
		this.original = original;
		this.final = final;

		const
			{width, height} = final;

		this.dest = {width, height};

		const
			data = width * height * 3;

		if (typeof Uint8ClampedArray === 'undefined') {
			this.dest.data = new Uint8Array(data);

		} else {
			this.dest.data = new Uint8ClampedArray(data);
		}

		this.lanczos = this.lanczosCreate(lobes);
		this.ratio = original.width / width;
		this.rcpRatio = 1 / this.ratio;
		this.range = Math.ceil((this.ratio * lobes) / 2);
		this.cacheLanc = {};
		this.center = {};
		this.iCenter = {};
		this.progress = 0;
		this.prev = 0;
		this.process(-1);
	}

	/**
	 * Creates Lanczos function
	 * @param lobes - smoothing level
	 */
	lanczosCreate(lobes: number): (x: number) => number {
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
	 * Converts the specified column image
	 * @param column
	 */
	process(column: number) {
		const
			oData = this.original.data,
			dData = this.dest.data;

		const
			{width, height} = this.dest,
			{width: oWidth, height: oHeight} = this.original,
			{center, iCenter, cacheLanc} = this;

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
				});
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

					const fX = (1000 * Math.abs(i - center.x)) << 0;
					cacheLanc[fX] = cacheLanc[fX] || {};

					for (let j = iCenter.y - this.range; j <= iCenter.y + this.range; j++) {
						if (j < 0 || j >= oHeight) {
							continue;
						}

						const
							fY = (1e3 * Math.abs(j - center.y)) << 0;

						if (cacheLanc[fX][fY] === undefined) {
							cacheLanc[fX][fY] = this.lanczos(
								Math.sqrt(
									fX * this.rcpRatio * fX * this.rcpRatio +
									fY * this.rcpRatio * fY * this.rcpRatio
								) / 1000
							);
						}

						const
							weight = cacheLanc[fX][fY];

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

		this.progress = Math.round((column / width) * 100);
		postMessage({
			event: {
				type: 'progress',
				data: {
					progress: this.progress,
					id: this.id
				}
			}
		});

		this.end();
	}

	/**
	 * Applies the changes to the final image
	 */
	end() {
		const
			{width, height} = this.dest;

		const
			fData = this.final.data,
			dData = this.dest.data;

		let idx, idx2;
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
					img: this.final,
					width: this.dest.width,
					height: this.dest.height
				}
			}
		});
	}
}
