/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import extend from 'core/prelude/extend';

/**
 * Executes the specified callbacks after loading of the image
 *
 * @param onSuccess
 * @param [onFail]
 */
extend(HTMLImageElement.prototype, 'onInit', function (
	this: HTMLImageElement,
	onSuccess: () => void,
	onFail?: (err?: Error) => void
): void {
	// tslint:disable-next-line:no-string-literal
	globalThis['setImmediate'](() => {
		if (this.complete) {
			if (this.height || this.width) {
				onSuccess.call(this);

			} else {
				onFail && onFail.call(this);
			}

		} else {
			const onError = (err) => {
				onFail && onFail.call(this, err);
				this.removeEventListener('error', onError);
				this.removeEventListener('load', onLoad);
			};

			const onLoad = () => {
				onSuccess.call(this);
				this.removeEventListener('error', onError);
				this.removeEventListener('load', onLoad);
			};

			this.addEventListener('error', onError);
			this.addEventListener('load', onLoad);
		}
	});
});

/**
 * Returns a promise that resolves after loading of the image
 */
extend(HTMLImageElement.prototype, 'init', {
	get(): Promise<HTMLImageElement> {
		return new Promise((resolve, reject) => this.onInit(() => resolve(this), reject));
	}
});
