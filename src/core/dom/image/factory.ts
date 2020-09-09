/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { concatUrls } from 'core/url';
import { getSrcSet } from 'core/html';

import ImageLoader from 'core/dom/image/image';

import {

	ImageOptions,
	PictureFactoryResult,
	ShadowElState,
	ImageStage,

	INIT_LOAD,
	IMG_IS_LOADED,
	LOADING_STARTED

} from 'core/dom/image';

/**
 * Helpers class that provides API to create DOM elements
 */
export default class Factory {
	/**
	 * Parent class
	 */
	protected parent: ImageLoader;

	/**
	 * @param parent
	 */
	constructor(parent: ImageLoader) {
		this.parent = parent;
	}

	/**
	 * Creates a "shadow" state to the specified element.
	 * The state contains the loading state, generated shadow DOM, provided options, and so on.
	 *
	 * @param el
	 * @param selfOptions
	 * @param mainOptions
	 * @param type
	 */
	shadowState(el: HTMLElement, selfOptions: ImageOptions, mainOptions: ImageOptions, type: ImageStage): ShadowElState {
		let res: ShadowElState;

		if (Object.isArray(selfOptions.sources) && selfOptions.sources.length > 0) {
			const {picture, img} = this.picture(selfOptions, mainOptions, type);

			res = {
				pictureNode: picture,
				imgNode: img,
				isFailed: false,
				selfOptions,
				mainOptions,
				stageType: type
			};

		} else {
			const img = this.img(selfOptions, mainOptions, type);

			res = {
				pictureNode: undefined,
				imgNode: img,
				isFailed: false,
				selfOptions,
				mainOptions,
				stageType: type
			};
		}

		return res;
	}

	/**
	 * Creates a picture element with sources and an image tag
	 *
	 * @see https://developer.mozilla.org/ru/docs/Web/HTML/Element/picture
	 *
	 * @example
	 * ```typescript
	 * this.sources({
	 *   src: 'preview.jpg',
	 *   sources: [{srcset: webp, type: 'webp'}]
	 * }, {
	 *   src: 'main.jpg',
	 *   sources: [{srcset: webp, type: 'webp'}],
	 *   baseSrc: 'https://path'
	 * });
	 * ```
	 *
	 * ```html
	 * <picture>
	 *   <source srcset="https://path/preview.webp" type="image/webp">
	 *   <img src="https://path/main.jpg">
	 * </picture>
	 * ```
	 *
	 * @param selfOptions
	 * @param mainOptions
	 * @param type
	 */
	picture(selfOptions: ImageOptions, mainOptions: ImageOptions, type: ImageStage): PictureFactoryResult {
		const
			picture = document.createElement('picture'),
			img = this.img(selfOptions, mainOptions, type);

		if (selfOptions.sources != null && selfOptions.sources.length > 0) {
			const sourcesFragment = this.sources(selfOptions, mainOptions);
			picture.appendChild(sourcesFragment);
		}

		picture.appendChild(img);

		return {picture, img};
	}

	/**
	 * Creates source elements using the specified options to generate attributes
	 *
	 * @see https://developer.mozilla.org/ru/docs/Web/HTML/Element/source
	 *
	 * @example
	 * ```typescript
	 * // Provided options
	 * this.sources({
	 *   src: 'broken.img',
	 *   sources: [{srcset: webp, type: 'webp'}]
	 * }, {
	 *   src: 'main.img',
	 *   baseSrc: 'https://path'
	 * });
	 *
	 * // The result is a document fragment with <source srcset="https://path/broken.img" type="image/webp">
	 * ```
	 *
	 * @param selfOptions
	 * @param mainOptions
	 */
	sources(selfOptions: ImageOptions, mainOptions: ImageOptions): DocumentFragment {
		const fragment = document.createDocumentFragment();

		if (selfOptions.sources == null || selfOptions.sources.length === 0) {
			return fragment;
		}

		for (let i = 0; i < selfOptions.sources.length; i++) {
			const
				source = selfOptions.sources[i],
				sourceNode = document.createElement('source');

			sourceNode.media = source.media ?? '';
			sourceNode.sizes = source.sizes ?? '';
			sourceNode.srcset = this.srcset(source.srcset, selfOptions, mainOptions);
			sourceNode.type = this.type(source.type);

			fragment.appendChild(sourceNode);
		}

		return fragment;
	}

	/**
	 * Creates an image element
	 *
	 * @param selfOptions
	 * @param mainOptions
	 * @param type
	 */
	img(selfOptions: ImageOptions, mainOptions: ImageOptions, type: ImageStage): HTMLImageElement {
		const
			imgNode = document.createElement('img');

		/*
		 * Create a function to prevent immediate loading of the `broken` image
		 */
		imgNode[INIT_LOAD] = () => {
			imgNode.sizes = selfOptions.sizes ?? '';
			imgNode.src = this.src(selfOptions.src, selfOptions, mainOptions);
			imgNode.srcset = this.srcset(selfOptions.srcset, selfOptions, mainOptions);
			imgNode[LOADING_STARTED] = true;

			imgNode.init.then(
				() => imgNode[IMG_IS_LOADED] = true,
				() => imgNode[IMG_IS_LOADED] = false
			);
		};

		/*
		 * Immediate load every image except the `broken` image
		 */
		if (type !== 'broken') {
			imgNode[INIT_LOAD]();
		}

		return imgNode;
	}

	/**
	 * Creates a `type` attribute value of the `source` tag
	 * @param type
	 */
	type(type: CanUndef<string>): string {
		if (type == null || type === '') {
			return '';
		}

		return `image/${type}`;
	}

	/**
	 * Creates a value of the `src` attribute
	 *
	 * @param src
	 * @param selfOptions
	 * @param mainOptions
	 */
	src(src: CanUndef<string>, selfOptions: ImageOptions, mainOptions: ImageOptions): string {
		if (src == null || src === '') {
			return '';
		}

		const
			baseSrc = this.getBaseSrc(selfOptions, mainOptions);

		if (baseSrc == null || baseSrc === '') {
			return src;
		}

		return concatUrls(baseSrc, src);
	}

	/**
	 * Creates a value of the `srcset` attribute
	 *
	 * @param srcset
	 * @param selfOptions
	 * @param mainOptions
	 */
	srcset(srcset: CanUndef<Dictionary<string> | string>, selfOptions: ImageOptions, mainOptions: ImageOptions): string {
		const
			normalized = Object.isPlainObject(srcset) ? getSrcSet(srcset) : srcset;

		if (normalized == null || normalized === '') {
			return '';
		}

		const
			baseSrc = this.getBaseSrc(selfOptions, mainOptions);

		if (baseSrc == null || baseSrc === '') {
			return normalized;
		}

		const
			chunks = normalized.split(','),
			newSrcset = <string[]>[];

		for (let i = 0; i < chunks.length; i++) {
			newSrcset.push(concatUrls(baseSrc, chunks[i]));
		}

		return newSrcset.join(',');
	}

	/**
	 * Returns `baseSrc` from the specified options
	 *
	 * @param selfOptions
	 * @param mainOptions
	 */
	protected getBaseSrc(selfOptions: ImageOptions, mainOptions: ImageOptions): CanUndef<string> {
		return selfOptions.baseSrc ?? mainOptions.baseSrc ?? '';
	}
}
