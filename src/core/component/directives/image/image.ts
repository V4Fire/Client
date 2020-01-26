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
	 * Set of pending nodes
	 */
	protected pending: Set<HTMLElement> = new Set();

	/**
	 * Starts loading an image for the specified element
	 *
	 * @param el
	 * @param value
	 */
	load(el: HTMLElement, value: DirectiveValue): void {
		const
			opts = this.normalizeOptions(value);

		const
			srcset = Object.isPlainObject(opts.srcset) ? getSrcSet(opts.srcset) : opts.srcset,
			{src, load, error} = opts;

		if (!src && !srcset) {
			this.isImg(el) ? el.src = '' : this.setBackgroundImage(el, '');
			return;
		}

		if (this.isImg(el)) {
			if (src) {
				el.src = src;
			}

			if (srcset) {
				el.srcset = srcset;
			}

			this.attachListeners(el, load, error);

		} else {
			const
				img = new Image(),
				normalized = this.normalizeOptions(value);

			el[$$.img] = img;

			this.load(el[$$.img], {
				...normalized,

				load: () => {
					this.setBackgroundImage(el, img.currentSrc);
					load && load(el);
				},

				error: () => {
					error && error(el);
				}
			});
		}
	}

	/**
	 * Removes an element from the set of pending elements
	 * @param el
	 */
	removeFromPending(el: HTMLElement): void {
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
	 * Sets a background image style for the specified element
	 *
	 * @param el
	 * @param imageSrc
	 */
	setBackgroundImage(el: HTMLElement, imageSrc: string): void {
		const
			url = `url('${imageSrc}')`,
			{backgroundImage} = el.style;

		el.style.backgroundImage = backgroundImage ? `${backgroundImage}, ${url}` : `${url}`;
	}

	/**
	 * Returns true if the specified element is an instance of HTMLImageElement
	 * @param el
	 */
	protected isImg(el: HTMLElement): el is HTMLImageElement {
		return el instanceof HTMLImageElement;
	}

	/**
	 * Attaches load/error listeners for the specified image
	 *
	 * @param img
	 * @param [onLoad]
	 * @param [onError]
	 */
	protected attachListeners(img: HTMLImageElement, onLoad?: Function, onError?: Function): void {
		const
			{pending} = this;

		img.init
			.then(() => {
				if (!pending.has(img)) {
					return;
				}

				pending.delete(img);
				onLoad && onLoad(img);
			})

			.catch(() => {
				if (!pending.has(img)) {
					return;
				}

				pending.delete(img);
				onError && onError(img);
			});

		pending.add(img);
	}
}
