/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import symbolGenerator from 'core/symbol';
import { getSrcSet } from 'core/html';

import { DirectiveValue, ImageOptions } from 'core/component/directives/image';

export const
	$$ = symbolGenerator();

export default class ImageLoader {
	/**
	 * Nodes that are waiting for loading
	 */
	protected pending: Set<HTMLElement> = new Set();

	/**
	 * Starts loading an image
	 *
	 * @param el
	 * @param value
	 */
	load(el: HTMLElement, value: DirectiveValue): void {
		const
			opts = this.normalizeOptions(value);

		const
			srcset = Object.isObject(opts.srcset) ? getSrcSet(opts.srcset) : opts.srcset,
			{src, load, error} = opts;

		if (!src && !srcset) {
			this.isImg(el) ? el.src = '' : this.setBackgroundImage(el, '');
			return;
		}

		if (this.isImg(el)) {
			src && (el.src = src);
			srcset && (el.srcset = srcset);

			this.attachListeners(el, load, error);

		} else {
			const
				img =  new Image(),
				normalized = this.normalizeOptions(value);

			el[$$.img] = img;

			this.load(el[$$.img], {
				...normalized,
				load: () => {
					this.setBackgroundImage(el, img.currentSrc);
					load && load();
				}
			});
		}
	}

	/**
	 * Removes specified element from pending elements
	 * @param el
	 */
	removePending(el: HTMLElement): void {
		this.pending.delete(el[$$.img] || el);
	}

	/**
	 * Normalizes the specified directive value
	 * @param value
	 */
	normalizeOptions(value: DirectiveValue): ImageOptions {
		if (Object.isString(value)) {
			return {
				src: value
			};
		}

		return value;
	}

	/**
	 * Sets a background image for the specified element
	 *
	 * @param el
	 * @param src
	 */
	setBackgroundImage(el: HTMLElement, src: string): void {
		const
			url = `url('${src}')`,
			{backgroundImage} = el.style;

		el.style.backgroundImage = backgroundImage ? `${backgroundImage}, ${url}` : `${url}`;
	}

	/**
	 * Returns true if the specified element is a HTMLImageElement
	 * @param el
	 */
	protected isImg(el: HTMLElement): el is HTMLImageElement {
		return el instanceof HTMLImageElement;
	}

	/**
	 * Attach load/error listeners for the specified el
	 *
	 * @param img
	 * @param key
	 * @param [errorCb]
	 */
	protected attachListeners(img: HTMLImageElement, loadCb?: Function, errorCb?: Function): void {
		const
			{pending} = this;

		img.init
			.then(() => {

				if (!pending.has(img)) {
					return;
				}

				pending.delete(img);
				loadCb && loadCb();
			})

			.catch(() => {
				if (!pending.has(img)) {
					return;
				}

				pending.delete(img);
				errorCb && errorCb();
			});

		pending.add(img);
	}
}
