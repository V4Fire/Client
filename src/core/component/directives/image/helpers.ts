/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { concatURLs } from 'core/url';
import { getSrcSet } from 'core/html';
import type { VNode } from 'core/component/engines';

import type { ImageOptions, ImageSource, VirtualElement } from 'core/component/directives/image/interface';

/**
 * Creates an `img` element by the passed parameters and returns it
 *
 * @param imageParams - the requested image parameters
 * @param commonParams - common parameters
 */
export function createImg(
	imageParams: ImageOptions,
	commonParams: ImageOptions
): VirtualElement<HTMLElement> {
	const attrs = {
		src: resolveSrc(imageParams.src, imageParams, commonParams),
		srcset: resolveSrcSet(imageParams.srcset, imageParams, commonParams),
		loading: imageParams === commonParams && imageParams.lazy !== false ? 'lazy' : undefined,
		width: imageParams.width,
		height: imageParams.height,
		sizes: imageParams.sizes
	};

	return {
		toElement: () => {
			const
				img = document.createElement('img');

			Object.forEach(attrs, (val, prop) => {
				if (Object.isTruly(val)) {
					img[prop] = val;
				}
			});

			return img;
		},

		toVNode: (create) => {
			const
				img = create('img', {}),
				props = img.props ?? {};

			img.props = props;
			Object.forEach(attrs, (val, prop) => {
				if (Object.isTruly(val)) {
					props[prop] = val;
				}
			});

			return img;
		}
	};
}

/**
 * Creates a `picture` element with resources by the passed parameters and returns it
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/picture
 *
 * @example
 * ```typescript
 * const {picture, img} = createPicture({
 *   src: 'preview.jpg',
 *   sources: [{srcset: 'srcset-with-webp-img', role: 'webp'}]
 * }, {
 *   src: 'main.jpg',
 *   sources: [{srcset: 'srcset-with-webp-img', role: 'webp'}],
 *   baseSrc: 'https://path'
 * });
 *
 * document.appendChild(picture);
 * ```
 *
 * ```html
 * <picture>
 *   <source srcset="https://path/srcset-with-webp-img" role="image/webp">
 *   <img src="https://path/preview.jpg">
 * </picture>
 * ```
 *
 * @param imageParams - the requested image parameters
 * @param commonParams - common parameters
 */
export function createPictureElement(
	imageParams: ImageOptions,
	commonParams: ImageOptions
): VirtualElement<HTMLElement> {
	return {
		toElement: () => {
			const
				picture = document.createElement('picture');

			picture.appendChild(createSourceElements(imageParams, commonParams).toElement());
			picture.appendChild(createImg(imageParams, commonParams).toElement());

			return picture;
		},

		toVNode: (create) => {
			const picture = create('picture');
			picture.shapeFlag += 16;

			picture.children = Array.concat(
				[],
				createSourceElements(imageParams, commonParams).toVNode(create),
				createImg(imageParams, commonParams).toVNode(create)
			);

			return picture;
		}
	};
}

/**
 * Creates `source` elements by the passed parameters and returns them in a single document fragment
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/source
 * @param imageParams - the requested image parameters
 * @param commonParams - common parameters
 */
export function createSourceElements(
	imageParams: ImageOptions,
	commonParams: ImageOptions
): VirtualElement<DocumentFragment, []> {
	return {
		toElement: () => {
			const
				fragment = document.createDocumentFragment();

			if (imageParams.sources == null || imageParams.sources.length === 0) {
				return fragment;
			}

			imageParams.sources.forEach((source) => {
				const
					node = document.createElement('source');

				addPropsFromSource(Object.cast(node), source);
				fragment.appendChild(node);
			});

			return fragment;
		},

		toVNode: (create) => {
			const
				fragment: VNode[] = [];

			if (imageParams.sources == null || imageParams.sources.length === 0) {
				return fragment;
			}

			imageParams.sources.forEach((source) => {
				const
					node = create('source'),
					props = node.props ?? {};

				node.props = props;
				addPropsFromSource(props, source);

				fragment.push(node);
			});

			return fragment;
		}
	};

	function addPropsFromSource(props: Dictionary, source: ImageSource) {
		props.src = resolveSrc(source.src, imageParams, commonParams);
		props.srcset = resolveSrcSet(source.srcset, imageParams, commonParams);
		props.type = getSourceType(source.type);

		if (source.media != null) {
			props.media = source.media;
		}

		if (source.sizes != null) {
			props.sizes = source.sizes;
		}

		if (source.width != null) {
			props.width = source.width;
		}

		if (source.width != null) {
			props.width = source.width;
		}
	}
}

/**
 * Resolves a value of the `srcset` attribute for the given image by the passed parameters and returns it
 *
 * @param srcset - the original image src set
 * @param imageParams - the requested image parameters
 * @param commonParams - common parameters
 */
export function resolveSrcSet(
	srcset: Nullable<Dictionary<string> | string>,
	imageParams: ImageOptions,
	commonParams: ImageOptions
): string {
	const normalizedSrcset = Object.isDictionary(srcset) ?
		getSrcSet(srcset) :
		srcset;

	if (normalizedSrcset == null || normalizedSrcset === '') {
		return '';
	}

	const
		baseSrc = getBaseSrc(imageParams, commonParams);

	if (baseSrc == null || baseSrc === '') {
		return normalizedSrcset;
	}

	return normalizedSrcset.split(',')
		.map((val) => concatURLs(baseSrc, val.trim()))
		.join(',');
}

/**
 * Resolves a value of the `src` attribute for the given image by the passed parameters and returns it
 *
 * @param src - the original image src
 * @param imageParams - the requested image parameters
 * @param commonParams - common parameters
 */
export function resolveSrc(
	src: Nullable<string>,
	imageParams: ImageOptions,
	commonParams: ImageOptions
): string {
	if (src == null || src === '') {
		return '';
	}

	const
		baseSrc = getBaseSrc(imageParams, commonParams);

	if (baseSrc == null || baseSrc === '') {
		return src;
	}

	return concatURLs(baseSrc, src);
}

/**
 * Returns the underlying image src based on the given parameters
 *
 * @param imageParams - the requested image parameters
 * @param commonParams - common parameters
 */
function getBaseSrc(imageParams: ImageOptions, commonParams: ImageOptions): CanUndef<string> {
	return imageParams.baseSrc ?? commonParams.baseSrc ?? '';
}

/**
 * Returns a value of the `type` attribute for the `source` element, based on the passed image type
 * @param type - the original image type
 */
export function getSourceType(type: Nullable<string>): string {
	if (type == null || type === '') {
		return '';
	}

	return `image/${type}`;
}
