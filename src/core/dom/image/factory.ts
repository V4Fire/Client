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
	ImageType,

	INIT_LOAD,
	IMG_IS_LOADED,
	LOADING_STARTED

} from 'core/dom/image';

/**
 * Helpers class, provides an API for creating DOM elements
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
	 * @param el
	 * @param selfOptions
	 * @param mainOptions
	 * @param type
	 */
	shadowState(el: HTMLElement, selfOptions: ImageOptions, mainOptions: ImageOptions, type: ImageType): ShadowElState {
		let res: ShadowElState;

		if (Object.isArray(selfOptions.sources) && selfOptions.sources.length > 0) {
			const {picture, img} = this.picture(selfOptions, mainOptions, type);

			res = {
				pictureNode: picture,
				imgNode: img,
				isFailed: false,
				selfOptions,
				mainOptions,
				type
			};

		} else {
			const img = this.img(selfOptions, mainOptions, type);

			res = {
				pictureNode: undefined,
				imgNode: img,
				isFailed: false,
				selfOptions,
				mainOptions,
				type
			};
		}

		return res;
	}

	/**
	 * Creates a picture element with sources and an image tag
	 *
	 * @param selfOptions
	 * @param mainOptions
	 * @param type
	 */
	picture(selfOptions: ImageOptions, mainOptions: ImageOptions, type: ImageType): PictureFactoryResult {
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
	 * Creates a `source` elements
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
	img(selfOptions: ImageOptions, mainOptions: ImageOptions, type: ImageType): HTMLImageElement {
		const
			imgNode = document.createElement('img');

		/*
		 * Create a function for prevent immediate loading of a `broken` image
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
		 * Immediate load every image except of a `broken` image
		 */
		if (type !== 'broken') {
			imgNode[INIT_LOAD]();
		}

		return imgNode;
	}

	/**
	 * Creates a value for a `type` attribute for a `source` tag
	 * @param type
	 */
	type(type: CanUndef<string>): string {
		if (type == null || type === '') {
			return '';
		}

		return `image/${type}`;
	}

	/**
	 * Creates a value for a `src` attribute
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
	 * Creates a value for a `srcset` attribute
	 *
	 * @param src
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
	 * Returns a `baseSrc` from the specified options
	 *
	 * @param selfOptions
	 * @param mainOptions
	 */
	protected getBaseSrc(selfOptions: ImageOptions, mainOptions: ImageOptions): CanUndef<string> {
		return selfOptions.baseSrc ?? mainOptions.baseSrc ?? '';
	}
}
