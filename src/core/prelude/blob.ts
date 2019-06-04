/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

try {
	// tslint:disable-next-line:no-unused-expression
	new Blob();

} catch {
	const
		w = window;

	const BlobBuilder =
		w.BlobBuilder ||
		w.WebKitBlobBuilder ||
		w.MozBlobBuilder ||
		w.MSBlobBuilder;

	if (w.Blob && BlobBuilder) {
		initShim(BlobBuilder);
	}
}

function initShim(BlobBuilder: BlobBuilderConstructor): void {
	const ArrayBufferViews = [
		'Int8Array',
		'Uint8Array',
		'Uint8ClampedArray',
		'Int16Array',
		'Uint16Array',
		'Int32Array',
		'Uint32Array',
		'Float32Array',
		'Float64Array',
		'DataView'
	];

	for (let i = 0; i < ArrayBufferViews.length; i++) {
		const
			c = window[ArrayBufferViews[i]];

		if (c) {
			ArrayBufferViews[i] = c;

		} else {
			ArrayBufferViews.splice(i, 1);
			i--;
		}
	}

	const isArrayBufferView = (o) => {
		for (let i = 0; i !== ArrayBufferViews.length; ++i) {
			if (o instanceof <any>ArrayBufferViews[i]) {
				return true;
			}
		}

		return false;
	};

	function Blob(parts: unknown[] = [], options?: BlobPropertyBag & {endings?: string}): Blob {
		if (!Array.isArray(parts)) {
			throw new TypeError("Failed to construct 'Blob': The provided value is not an array");
		}

		if (options == null) {
			options = {};

		} else if ({object: true, function: true}[typeof options]) {
			throw new TypeError("Failed to construct 'Blob': parameter 2 ('options') is not an object.");
		}

		let
			{type, endings} = options;

		if (endings === undefined) {
			endings = 'transparent';

		} else if (!{transparent: true, native: true}[endings]) {
			throw new TypeError(
				"Failed to construct 'Blob': " +
				`The provided value '${endings}' is not a valid enum value of type NormalizeLineEndings.`
			);
		}

		type = type === undefined ? '' : String(type);

		const
			builder = new BlobBuilder();

		for (let i = 0; i !== parts.length; ++i) {
			const
				part = parts[i];

			if (part instanceof ArrayBuffer || part instanceof Blob) {
				builder.append(part);

			} else if (isArrayBufferView(part)) {
				builder.append(part.buffer);

			} else {
				builder.append(part, endings);
			}
		}

		return builder.getBlob(type);
	}

	Blob.prototype = window.Blob.prototype;
	Blob.prototype.constructor = Blob;
	window.Blob = <any>Blob;
}

if (!window.URL) {
	window.URL = <any>window.webkitURL;
}
