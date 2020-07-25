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
			// eslint-disable-next-line @typescript-eslint/unbound-method
			{src, load, error} = opts;

		if (src == null && srcset == null) {
			if (this.isImg(el)) {
				el.src = '';
				el.alt = opts.alt ?? '';

			} else {
				this.setBackgroundImage(el, '');
			}

			return;
		}

		if (this.isImg(el)) {
			if (src != null) {
				el.src = src;
			}

			if (srcset != null) {
				el.srcset = srcset;
			}

			el.alt = opts.alt ?? '';
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
					load?.(el);
				},

				error: () => {
					error?.(el);
				}
			});
		}
	}

	/**
	 * @param el
	 * @param value
	 * @param oldValue
	 */
	update(el: HTMLElement, value?: DirectiveValue, oldValue?: DirectiveValue): void {
		value = value != null ? this.normalizeOptions(value) : undefined;
		oldValue = oldValue != null ? this.normalizeOptions(oldValue) : undefined;

		if (this.compare(value, oldValue)) {
			return;
		}

		this.removeFromPending(el);

		if (value) {
			this.load(el, value);
		}
	}

	/**
	 * Removes an element from the set of pending elements
	 * @param el
	 */
	removeFromPending(el: HTMLElement): void {
		this.pending.delete(el[$$.img] == null ? el : el[$$.img]);
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
		el.style.backgroundImage = `url('${imageSrc}')`;
	}

	/**
	 * Returns true if the specified `val` is equal to `oldVal`
	 *
	 * @param val
	 * @param oldVal
	 */
	protected compare(val: CanUndef<ImageOptions>, oldVal: CanUndef<ImageOptions>): boolean {
		return Object.fastCompare(val, oldVal);
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
				onLoad?.(img);
			})

			.catch(() => {
				if (!pending.has(img)) {
					return;
				}

				pending.delete(img);
				onError?.(img);
			});

		pending.add(img);
	}
}
