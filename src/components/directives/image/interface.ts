/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/* eslint-disable @v4fire/newline-after-description */

import type { createVNode, VNode, DirectiveBinding } from 'core/component/engines';

export interface DirectiveParams extends DirectiveBinding<ImageOptions> {}

export interface SSRDirectiveParams extends DirectiveParams {
	bindings?: Dictionary & {
		style: Dictionary<string>;
	};
}

export type OptionsResolver = (opts: ImageOptions) => ImageOptions;

export type ImagePlaceholderOptions = Omit<ImageOptions, 'lazy' | 'preview' | 'broken'>;

export interface ImageOptions {
	/**
	 * The image URL.
	 * On browsers supporting `srcset`, `src` is treated like a candidate image with a pixel density descriptor 1x,
	 * unless an image with this pixel density descriptor is already defined in `srcset`,
	 * or unless `srcset` contains `w` descriptors.
	 *
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img#src
	 */
	src?: string;

	/**
	 * The base image URL.
	 * If given, it will be used as a prefix for all values in the `src` and `srcset` parameters.
	 *
	 * @example
	 * ```js
	 * {
	 *   src: 'img.png',
	 *   baseSrc: 'https://url-to-img'
	 * }
	 * ```
	 *
	 * ```html
	 * <img src="https://url-to-img/img.png" />
	 * ```
	 */
	baseSrc?: string;

	/**
	 * Value of the `srcset` image attribute.
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img#attr-srcset
	 *
	 * This option helps to create responsive images.
	 * @see https://developer.mozilla.org/en-US/docs/Learn/HTML/Multimedia_and_embedding/Responsive_images
	 *
	 * @example
	 * ```js
	 * const srcset = {
	 *   src: 'img.jpg',
	 *   srcset: {'2x': 'http://img-hdpi.png', '3x': 'http://img-xhdpi.png'}
	 * };
	 * ```
	 */
	srcset?: Dictionary<string> | string;

	/**
	 * The image width.
	 * If the option is given as a number, then it is treated as pixels.
	 */
	width?: string | number;

	/**
	 * The image height.
	 * If the option is given as a number, then it is treated as pixels.
	 */
	height?: string | number;

	/**
	 * Value of the `sizes` image attribute.
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img#attr-sizes
	 *
	 * This option helps to create responsive images.
	 * @see https://developer.mozilla.org/en-US/docs/Learn/HTML/Multimedia_and_embedding/Responsive_images
	 */
	sizes?: string;

	/**
	 * A list of attributes for `source` elements.
	 * If this option is given, then `picture` will be used to load the image, not `img`.
	 *
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/picture
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/source
	 */
	sources?: ImageSource[];

	/**
	 * A text description of the image, which isn't mandatory but is incredibly useful for accessibility - screen readers
	 * read this description out to their users, so they know what the image means
	 */
	alt?: string;

	/**
	 * If false, then the image will start loading immediately, but not when it appears in the viewport
	 * @default `false`
	 */
	lazy?: boolean;

	/**
	 * An image URL to use as a placeholder while the main one is loading.
	 * The option can also accept an object with additional image settings.
	 */
	preview?: string | ImagePlaceholderOptions;

	/**
	 * An image URL to use as a placeholder if the main one cannot be loaded due to an error.
	 * The option can also accept an object with additional image settings.
	 */
	broken?: string | ImagePlaceholderOptions;

	/**
	 * A handler to be called when the image is successfully loaded
	 * @param el
	 */
	onLoad?(el: Element): void;

	/**
	 * A handler to be called in case of an error while loading the image
	 * @param el
	 */
	onError?(el: Element): void;

	/**
	 * A function to resolve the passed image options.
	 * The options returned by this function will be used to load the image.
	 *
	 * @example
	 * ```js
	 * const optionsResolver = (opts) => ({...opts, src: opts.src + '?size=42'});
	 * ```
	 */
	optionsResolver?: OptionsResolver;

	/**
	 * Indicates whether the image can be dragged,
	 * either with native browser behavior or the HTML Drag and Drop API
	 */
	draggable?: boolean;

	/**
	 * A boolean value which indicates that the image is to be used by a server-side image map.
	 * This may only be used on images located within an `<a>` element.
	 */
	isMap?: boolean;

	/**
	 * The partial URL (starting with `#`) of an image map associated with the element
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img#usemap
	 */
	useMap?: string;

	/**
	 * A string indicating which referrer to use when fetching the resource
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img#referrerpolicy
	 */
	referrerPolicy?: ReferrerPolicy;

	/**
	 * Indicates if the fetching of the image must be done using a CORS request.
	 * Image data from a CORS-enabled image returned from a CORS request can be reused in the `<canvas>` element
	 * without being marked `tainted`.
	 *
	 * Allowed values are:
	 * - `anonymous` - a CORS request is sent with credentials omitted;
	 * - `use-credentials` - the CORS request is sent with any credentials included.
	 *
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img#crossorigin
	 */
	crossOrigin?: 'anonymous' | 'use-credentials';

	/**
	 * Indicates whether the browser should decode images synchronously with other DOM content
	 * for a more accurate presentation, or asynchronously to render other content first and display the image later.
	 *
	 * Allowed values are:
	 * - `sync` - decode the image synchronously along with rendering
	 *    the other DOM content, and present everything together;
	 * - `async` - decode the image asynchronously, after rendering and
	 *    presenting the other DOM content;
	 * - `auto` - no preference for the decoding mode (the browser decides what is best for the user).
	 *
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img#decoding
	 */
	decoding?: 'sync' | 'async' | 'auto';

	/**
	 * Indicates that an element is flagged for tracking by PerformanceObserver
	 * objects using the "element" type
	 *
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/elementtiming
	 */
	elementTiming?: string;

	/**
	 * A hint of the relative priority to use when fetching the image.
	 *
	 * Allowed values are:
	 * - `high` - fetch the image at a high priority relative to other images;
	 * - `low` - fetch the image at a low priority relative to other images;
	 * - `auto` - default mode, which indicates no preference for the fetch priority
	 *   (the browser decides what is best for the user).
	 *
	 * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/fetchPriority
	 */
	fetchPriority?: 'high' | 'low' | 'auto';
}

export interface ImageSource {
	/**
	 * Value of the `srcset` source attribute.
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img#attr-srcset
	 *
	 * This option helps to create responsive images.
	 * @see https://developer.mozilla.org/en-US/docs/Learn/HTML/Multimedia_and_embedding/Responsive_images
	 *
	 * @example
	 * ```js
	 * {
	 *   src: 'img.jpg',
	 *   srcset: {'2x': 'http://img-hdpi.png', '3x': 'http://img-xhdpi.png'}
	 * }
	 * ```
	 */
	srcset?: Dictionary<string> | string;

	/**
	 * The MIME media type of the image
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/source#attr-type
	 */
	type?: string;

	/**
	 * The image media query
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/source#attr-media
	 */
	media?: string;

	/**
	 * The source width.
	 * If the option is given as a number, then it is treated as pixels.
	 */
	width?: string | number;

	/**
	 * The source height.
	 * If the option is given as a number, then it is treated as pixels.
	 */
	height?: string | number;

	/**
	 * Value of the `sizes` source attribute.
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/source#attr-sizes
	 *
	 * This option helps to create responsive images.
	 * @see https://developer.mozilla.org/en-US/docs/Learn/HTML/Multimedia_and_embedding/Responsive_images
	 */
	sizes?: string;
}

export interface VirtualElement<E, V = VNode> {
	toVNode(create: typeof createVNode): V extends [] ? VNode[] : VNode;
	toElement(document?: Document): E;
}
