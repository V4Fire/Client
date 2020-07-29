/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { concatUrls } from 'core/url';
import { getSrcSet } from 'core/html';

import ImageLoader from 'core/component/directives/image/image';
import { ImageOptions, PictureFactoryResult, ShadowElState, ImageType } from 'core/component/directives/image';

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
		const t = performance.now();
		let res: ShadowElState;

		if (Object.isArray(selfOptions.sources) && selfOptions.sources.length > 0) {
			const {picture, img} = this.picture(selfOptions, mainOptions);

			res = {
				pictureNode: picture,
				imgNode: img,
				isFailed: false,
				selfOptions,
				mainOptions,
				type
			};

		} else {
			const img = this.img(selfOptions, mainOptions);

			res = {
				pictureNode: undefined,
				imgNode: img,
				isFailed: false,
				selfOptions,
				mainOptions,
				type
			};
		}

		console.log(performance.now() - t, 'create shadow state');
		return res;
	}

	/**
	 * Creates a picture element with sources and an image tag
	 *
	 * @param selfOptions
	 * @param mainOptions
	 */
	picture(selfOptions: ImageOptions, mainOptions: ImageOptions): PictureFactoryResult {
		const t = performance.now();

		const
			picture = document.createElement('picture'),
			img = this.img(selfOptions, mainOptions);

		if (selfOptions.sources != null && selfOptions.sources.length > 0) {
			const sourcesFragment = this.source(selfOptions, mainOptions);
			picture.appendChild(sourcesFragment);
		}

		console.log(performance.now() - t, 'picture render');
		return {picture, img};
	}

	/**
	 * Creates a source element
	 *
	 * @param selfOptions
	 * @param mainOptions
	 */
	source(selfOptions: ImageOptions, mainOptions: ImageOptions): DocumentFragment {
		const fragment = document.createDocumentFragment();

		if (selfOptions.sources == null || selfOptions.sources.length > 0) {
			return fragment;
		}

		for (let i = 0; i < selfOptions.sources.length; i++) {
			const
				source = selfOptions.sources[i],
				sourceNode = document.createElement('source');

			sourceNode.media = source.media ?? '';
			sourceNode.sizes = source.sizes ?? '';
			sourceNode.src = this.src(source.src, selfOptions, mainOptions);
			sourceNode.srcset = this.srcset(selfOptions.srcset, selfOptions, mainOptions);
			sourceNode.type = this.type(source.type);
		}

		return fragment;
	}

	/**
	 * Creates an image element
	 *
	 * @param selfOptions
	 * @param mainOptions
	 */
	img(selfOptions: ImageOptions, mainOptions: ImageOptions): HTMLImageElement {
		const imgNode = document.createElement('img');

		imgNode.sizes = selfOptions.sizes ?? '';
		imgNode.src = this.src(selfOptions.src, selfOptions, mainOptions);
		imgNode.srcset = this.srcset(selfOptions.srcset, selfOptions, mainOptions);

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
