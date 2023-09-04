const sharp = require('sharp');

class Adapter {
	constructor(imagePath) {
		this.image = sharp(imagePath);
	}

	metadata() {
		return this.image.metadata();
	}

	resize({mime, width: x, options: {sizes, quality}}) {
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

			let result = clone;

			if (x < maxSize) {
				result = clone.resize(
					stepWidth * x,
					stepHeight * x
				);
			}

			switch (mime) {
				case 'image/webp': {
					result = result.webp({quality});

					break;
				}

				case 'image/png': {
					result = result.png({quality});

					break;
				}

				default:
			}

			result.toBuffer((err, data, {width, height}) => {
				if (err) {
					reject(err);

				} else {
					resolve({data, width, height});
				}
			});
		});
	}
}

module.exports = function myAdapter(imagePath) {
	return new Adapter(imagePath);
};
