/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { concatURLs } from 'core/url';
import { getSrcSet } from 'core/html';

import { setVNodePatchFlags } from 'core/component/render';

import type { VNode } from 'core/component/engines';
import type { ImageOptions, ImageSource, VirtualElement } from 'core/component/directives/image/interface';

/**
 * Returns a value of the `currentSrc` property from the passed image element
 * @param image
 */
export function getCurrentSrc(image: HTMLImageElement | HTMLPictureElement): CanUndef<string> {
	return image instanceof HTMLImageElement ? image.currentSrc : image.querySelector('img')?.currentSrc;
}

/**
 * Creates an image element by the passed parameters.
 * The function returns a special structure, with methods to create the element as a DOM or VDOM node.
 *
 * @param imageParams - the requested image parameters
 * @param [commonParams] - common parameters
 */
export function createImageElement(
	imageParams: ImageOptions,
	commonParams: ImageOptions = imageParams
): VirtualElement<HTMLImageElement | HTMLPictureElement> {
	const fn = imageParams.sources != null ? createPictureElement : createImgElement;
	return fn(imageParams, commonParams);
}

/**
 * Creates an `img` element by the passed parameters.
 * The function returns a special structure, with methods to create the element as a DOM or VDOM node.
 *
 * @param imageParams - the requested image parameters
 * @param [commonParams] - common parameters
 */
export function createImgElement(
	imageParams: ImageOptions,
	commonParams: ImageOptions = imageParams
): VirtualElement<HTMLImageElement> {
	let
		broken = '';

	if (Object.isString(imageParams.broken)) {
		broken = `url(${imageParams.broken})`;

	} else if (Object.isDictionary(imageParams.broken)) {
		broken = `url(${getCurrentSrc(createImageElement(imageParams.broken, imageParams).toElement())})`;
	}

	const attrs = {
		src: resolveSrc(imageParams.src, imageParams, commonParams),
		srcset: resolveSrcSet(imageParams.srcset, imageParams, commonParams),

		alt: imageParams.alt,
		loading: imageParams === commonParams && imageParams.lazy !== false ? 'lazy' : undefined,

		width: imageParams.width,
		height: imageParams.height,
		sizes: imageParams.sizes,

		onload: [
			"this._ = this.closest('span')",
			"this._.style['background-image'] = ''",
			"this._.setAttribute('data-image', 'loaded')",
			'this.style.opacity = 1'
		].join(';'),

		onerror: [
			"this._ = this.closest('span')",
			`this._.style['background-image'] = '${broken}'`,
			"this._.setAttribute('data-image', 'failed')"
		].join(';'),

		style: {
			opacity: 0
		}
	};

	return {
		toElement: () => {
			const
				img = document.createElement('img');

			Object.forEach(attrs, (val, prop) => {
				if (Object.isDictionary(val)) {
					Object.assign(img[prop], val);

				} else if (Object.isTruly(val)) {
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
 * Creates a `picture` element with resources by the passed parameters.
 * The function returns a special structure, with methods to create the element as a DOM or VDOM node.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/picture
 * @param imageParams - the requested image parameters
 * @param [commonParams] - common parameters
 */
export function createPictureElement(
	imageParams: ImageOptions,
	commonParams: ImageOptions = imageParams
): VirtualElement<HTMLElement> {
	return {
		toElement: () => {
			const
				picture = document.createElement('picture');

			picture.appendChild(createSourceElements(imageParams, commonParams).toElement());
			picture.appendChild(createImgElement(imageParams, commonParams).toElement());

			return picture;
		},

		toVNode: (create) => {
			const
				picture = create('picture');

			picture.children = Array.concat(
				[],
				createSourceElements(imageParams, commonParams).toVNode(create),
				createImgElement(imageParams, commonParams).toVNode(create)
			);

			setVNodePatchFlags(picture, 'children');
			return picture;
		}
	};
}

/**
 * Creates `source` elements by the passed parameters.
 * The function returns a special structure, with methods to create the elements as a DOM or VDOM nodes.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/source
 * @param imageParams - the requested image parameters
 * @param [commonParams] - common parameters
 */
export function createSourceElements(
	imageParams: ImageOptions,
	commonParams: ImageOptions = imageParams
): VirtualElement<DocumentFragment, []> {
	return {
		toElement: () => {
			const
				fragment = document.createDocumentFragment();

			if (imageParams.sources == null || imageParams.sources.length === 0) {
				return fragment;
			}

			imageParams.sources.forEach((source) => {
				const node = document.createElement('source');
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

	function addPropsFromSource(props: Dictionary, source: ImageSource): void {
		if (Object.isTruly(source.src)) {
			props.src = resolveSrc(source.src, imageParams, commonParams);
		}

		if (Object.isTruly(source.srcset)) {
			props.srcset = resolveSrcSet(source.srcset, imageParams, commonParams);
		}

		if (Object.isTruly(source.type)) {
			props.type = `image/${source.type}`;
		}

		['media', 'sizes', 'width', 'height'].forEach((attr) => {
			if (Object.isTruly(source[attr])) {
				props[attr] = source[attr];
			}
		});
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
