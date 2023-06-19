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
import type { ImageOptions, ImageSource, VirtualElement } from 'components/directives/image/interface';

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
	const attrs = {
		'data-img': Object.fastHash(imageParams),

		src: resolveSrc(imageParams.src, imageParams, commonParams),
		srcset: resolveSrcSet(imageParams.srcset, imageParams, commonParams),

		alt: imageParams.alt,
		loading: imageParams === commonParams && imageParams.lazy !== false ? 'lazy' : undefined,

		width: normalizeSizeAttr(imageParams.width),
		height: normalizeSizeAttr(imageParams.height),
		sizes: imageParams.sizes,

		onload(e: Event) {
			const img = (<HTMLImageElement>e.target);
			img.setAttribute('data-img', 'loaded');
		},

		onerror(e: Event) {
			const img = (<HTMLImageElement>e.target);
			img.setAttribute('data-img', 'failed');
			img.style.opacity = '0';
		},

		style: {
			opacity: Object.isTruly(imageParams.preview) ? 0 : undefined
		}
	};

	return {
		toElement: () => {
			console.log(111);

			const
				img = document.createElement('img');

			Object.forEach(attrs, (prop, name) => {
				if (Object.isDictionary(prop)) {
					Object.assign(img[name], prop);

				} else if (Object.isTruly(prop)) {
					img[name] = prop;
				}
			});

			return img;
		},

		toVNode: (create) => {
			const
				img: VNode = create('img');

			const
				props = {},
				dynamicProps: string[] = [];

			Object.forEach(attrs, (prop, name) => {
				if (Object.isTruly(prop)) {
					props[name] = prop;
					dynamicProps.push(name);
				}
			});

			img.props = props;
			img.dynamicProps = dynamicProps;
			setVNodePatchFlags(img, 'props', 'styles');

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
				picture: VNode = create('picture');

			picture.children = Array.concat(
				[],
				createSourceElements(imageParams, commonParams).toVNode(create),
				createImgElement(imageParams, commonParams).toVNode(create)
			);

			picture.dynamicChildren = Object.cast(picture.children.slice());
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
					node: VNode = create('source'),
					props = {};

				node.props = props;
				node.dynamicProps = addPropsFromSource(props, source);
				setVNodePatchFlags(node, 'props');

				fragment.push(node);
			});

			return fragment;
		}
	};

	function addPropsFromSource(props: Dictionary, source: ImageSource): string[] {
		const
			addedProps: string[] = [];

		if (Object.isTruly(source.srcset)) {
			props.srcset = resolveSrcSet(source.srcset, imageParams, commonParams);
			addedProps.push('srcset');
		}

		if (Object.isTruly(source.type)) {
			props.type = `image/${source.type}`;
			addedProps.push('type');
		}

		['media', 'sizes'].forEach((attr) => {
			if (Object.isTruly(source[attr])) {
				props[attr] = source[attr];
				addedProps.push(attr);
			}
		});

		['width', 'height'].forEach((attr) => {
			if (Object.isTruly(source[attr])) {
				props[attr] = normalizeSizeAttr(source[attr]);
				addedProps.push(attr);
			}
		});

		return addedProps;
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
export function getBaseSrc(imageParams: ImageOptions, commonParams: ImageOptions): CanUndef<string> {
	return imageParams.baseSrc ?? commonParams.baseSrc ?? '';
}

/**
 * Normalizes the passed value of a size attribute (`width` or `height`) and returns it
 * @param size
 */
export function normalizeSizeAttr(size: Nullable<string | number>): CanUndef<string> {
	if (size == null || size === '') {
		return;
	}

	return String(size).replace(/[^\d%]/g, '');
}
