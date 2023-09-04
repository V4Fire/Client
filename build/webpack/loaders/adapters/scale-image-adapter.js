/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

'use strict';

const sharp = require('sharp');

class Adapter {
	constructor(imagePath) {
		this.image = sharp(imagePath);
	}

	metadata() {
		return this.image.metadata();
	}

	resize({mime, width: x, options: {quality}}) {
		return new Promise(async (resolve, reject) => {
			const
				clone = this.image.clone(),
				{width, height} = await clone.metadata();

			if (width == null || height == null) {
				reject('Unable to receive width and height of the image', this.image);
				return;
			}

			const
				maxSize = 3,
				stepWidth = Math.floor(width / maxSize),
				stepHeight = Math.floor(height / maxSize);

			let scaledImage = clone;

			if (x < maxSize) {
				scaledImage = clone.resize(
					stepWidth * x,
					stepHeight * x
				);
			}

			const formatMethods = {
				'image/png': scaledImage.png,
				'image/jpeg': scaledImage.jpeg,
				'image/jpg': scaledImage.jpeg,
				'image/webp': scaledImage.webp,
				'image/avif': scaledImage.avif
			};

			scaledImage = formatMethods[mime]?.call(scaledImage, {quality});

			scaledImage.toBuffer((err, data, {width, height}) => {
				if (err) {
					reject(err);

				} else {
					resolve({data, width, height});
				}
			});
		});
	}
}

/**
 * Adapter for scaling an image by 1x or 2x of its size
 *
 * @param {string} imagePath - path to the image we want to scale
 * @returns {Adapter}
 */
module.exports = (imagePath) => new Adapter(imagePath);
