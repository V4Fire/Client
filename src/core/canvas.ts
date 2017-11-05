/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

if (!HTMLCanvasElement.prototype.toBlob) {
	const hasBlobConstructor = (() => {
		try {
			return Boolean(new Blob());

		} catch (_) {
			return false;
		}
	})();

	const hasArrayBufferViewSupport = hasBlobConstructor && (() => {
		try {
			const SIZE = 100;
			return new Blob([new Uint8Array(SIZE)]).size === SIZE;

		} catch (_) {
			return false;
		}
	})();

	HTMLCanvasElement.prototype.toBlob = function (
		cb: (blob: Blob) => void,
		mime: string = 'image/png',
		quality: number = 1
	): void {
		if (mime === 'image/png' && this.msToBlob) {
			cb(this.msToBlob());
			return;
		}

		const
			byteString = atob(this.toDataURL(mime, quality).replace(/[^,]*,/, '')),
			buffer = new ArrayBuffer(byteString.length),
			intArray = new Uint8Array(buffer);

		for (let i = 0; i < byteString.length; i++) {
			intArray[i] = byteString.charCodeAt(i);
		}

		if (hasBlobConstructor) {
			cb(new Blob(
				[hasArrayBufferViewSupport ? intArray : buffer],
				{type: mime}
			));

			return;
		}

		const builder = new MSBlobBuilder();
		builder.append(buffer);
		cb(builder.getBlob(mime));
	};
}
