/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import {

	ID,
	loadImage,

	SHADOW_PREVIEW,
	SHADOW_BROKEN,
	SHADOW_MAIN,

	IS_LOADED,
	IS_LOADING

} from 'core/dom/image/const';

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
	 * ```typescript
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
	 * A value of the `srcset` image attribute.
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img#attr-srcset
	 *
	 * This option helps to create responsive images.
	 * @see https://developer.mozilla.org/en-US/docs/Learn/HTML/Multimedia_and_embedding/Responsive_images
	 *
	 * @example
	 * ```typescript
	 * {
	 *   src: 'img.jpg',
	 *   srcset: {'2x': 'http://img-hdpi.png', '3x': 'http://img-xhdpi.png'}
	 * }
	 * ```
	 */
	srcset?: Dictionary<string> | string;

	/**
	 * A value of the `sizes` image attribute.
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
	 * Additional options to display the image to be used when displaying the image via CSS background properties
	 */
	bgOptions?: ImageBackgroundOptions;

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
	 * If true, then each time the image stage changes (initial, preview, broken, main), the image element will be
	 * assigned a class with the stage value. If the value is a string, then it will be used as a BEM block name when
	 * forming the class name.
	 *
	 * @example
	 * ```typescript
	 * {
	 *   src: 'img.png',
	 *   stageClasses: 'b-block'
	 * }
	 * ```
	 *
	 * ```html
	 * <img class="b-block b-block__v-image_stage_preview" src="img.png" />
	 * ```
	 *
	 * @default `false`
	 */
	stageClasses?: boolean | string;

	/**
	 * A function to resolve the passed image options.
	 * The options returned by this function will be used to load the image.
	 *
	 * @example
	 * ```typescript
	 * const optionsResolver = (opts) => {
	 *   return {...opts, src: opts.src + '?size=42'};
	 * }
	 * ```
	 */
	optionsResolver?: OptionsResolver;

	/**
	 * A handler to be called when the image is successfully uploaded
	 * @param el
	 */
	onLoad?(el: Element): void;

	/**
	 * A handler to be called in case of an error while loading the image
	 * @param el
	 */
	onError?(el: Element): void;
}

export interface ImageBackgroundOptions {
	/**
	 * Image background size type
	 */
	size?: BackgroundSizeType;

	/**
	 * Image background position
	 */
	position?: string;

	/**
	 * Image background repeat
	 */
	repeat?: string;

	/**
	 * The string to add to the background image before the URL
	 */
	beforeImg?: CanArray<string>;

	/**
	 * The string to add to the background image after the URL
	 */
	afterImg?: CanArray<string>;

	/**
	 * Image aspect ratio
	 */
	ratio?: number;
}

export type OptionsResolver = (opts: ImageOptions) => ImageOptions;

export type ImagePlaceholderOptions = Omit<ImageOptions, 'preview' | 'broken' | 'ctx'>;

export interface DefaultImagePlaceholderOptions extends ImagePlaceholderOptions {
	/**
	 * True if the placeholder is the default image
	 */
	isDefault?: boolean;
}

/** @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/source */
export interface ImageSource {
	/**
	 * MIME resource type
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/source
	 */
	type?: string;

	/**
	 * `media` attribute
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/source
	 */
	media?: string;

	/**
	 * `srcset` attribute
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/source
	 *
	 * @example
	 *
	 * ```typescript
	 * {
	 *   src: 'img.jpg',
	 *   srcset: {'2x': 'http://img-hdpi.png', '3x': 'http://img-xhdpi.png'}
	 * }
	 * ```
	 */
	srcset?: Dictionary<string> | string;

	/**
	 * `sizes` attribute
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/source
	 */
	sizes?: string;
}

/**
 * The hidden state that binds to the node.
 * This state contains Shadow DOM, image loading state, etc.
 */
export interface ImageState {
	/**
	 * True if an image loading has been failed
	 */
	isFailed: boolean;

	/**
	 * Type of the shadow image
	 */
	role: ImageRole;

	/**
	 * Shadow picture node
	 */
	picture: HTMLPictureElement | null;

	/**
	 * Shadow image node
	 */
	img: HTMLShadowImageElement;

	/**
	 * Options of the shadow state
	 */
	imageParams: ImageOptions;

	/**
	 * Options of the main shadow state
	 */
	commonParams: ImageOptions;

	/**
	 * Image loading promise
	 */
	loadPromise?: Promise<unknown>;
}

/**
 * Result of generating HTMLPictureElement
 */
export interface Picture {
	picture: HTMLPictureElement;
	img: HTMLShadowImageElement;
}

export interface ImageNode extends HTMLElement {
	[SHADOW_PREVIEW]?: ImageState;
	[SHADOW_BROKEN]?: ImageState;
	[SHADOW_MAIN]: ImageState;
	[ID]: string;
}

interface HTMLShadowImageElement extends HTMLImageElement {
	/**
	 * Initializes loading of the image
	 */
	[loadImage]?: Function;

	/**
	 * If
	 *   - `true` – the image has been successfully loaded;
	 *   - `false`– the image loading has been failed;
	 *   - `undefined` – initial state, loading isn't finished
	 */
	[IS_LOADED]?: boolean;

	/**
	 * True if the image is loading
	 */
	[IS_LOADING]?: true;
}

export interface DefaultParams {
	broken?: string | ImageOptions['broken'];
	preview?: string | ImageOptions['preview'];
	optionsResolver?: OptionsResolver;
}

export type ImagePlaceholderRole = 'preview' | 'broken';
export type ImageRole = 'initial' | 'main' | ImagePlaceholderRole;

export type BackgroundSizeType = 'contain' | 'cover';
export type InitValue = string | ImageOptions;
