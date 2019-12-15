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
	 * Store for urls that have already been downloaded
	 */
	protected cache: Set<string> = new Set();

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
			{cache} = this,
			opts = this.normalizeOptions(value);

		const
			srcset = Object.isObject(opts.srcset) ? getSrcSet(opts.srcset) : opts.srcset,
			{src, load, error} = opts;

		if (!src && !srcset) {
			return;
		}

		if (el instanceof HTMLImageElement) {
			src && (el.src = src);
			srcset && (el.srcset = srcset);

			if (cache.has(el.currentSrc)) {
				load && load();

			} else {
				this.attachListeners(el, load, error);
			}

		} else {
			const
				img =  new Image(),
				{backgroundImage} = el.style;

			el[$$.img] = img;
			this.load(el[$$.img], value);

			const
				url = `url('${img.currentSrc}')`;

			el.style.backgroundImage = backgroundImage ? `${backgroundImage}, ${url}` : `${url}`;
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
	 * Attach load/error listeners for the specified el
	 *
	 * @param img
	 * @param [loadCb]
	 * @param [errorCb]
	 */
	protected attachListeners(img: HTMLImageElement, loadCb?: Function, errorCb?: Function): void {
		const
			{cache, pending} = this;

		img.addEventListener('load', () => {
			cache.add(img.currentSrc);

			if (!pending.has(img)) {
				return;
			}

			pending.delete(img);
			loadCb && loadCb();
		});

		img.addEventListener('error', () => {
			if (!pending.has(img)) {
				return;
			}

			pending.delete(img);
			errorCb && errorCb();
		});

		pending.add(img);
	}
}
