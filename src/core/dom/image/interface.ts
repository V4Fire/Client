/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

export type OptionsResolver = (opts: ImageOptions) => ImageOptions;

export type ImagePlaceholderOptions = Omit<ImageOptions, 'preview' | 'broken' | 'ctx'>;

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
	 * A value of the `srcset` image attribute.
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
	 * ```js
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
	 * ```js
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

/**
 * Additional options to display the image to be used when displaying the image via CSS background properties
 */
export interface ImageBackgroundOptions {
	/**
	 * Rendered image size via `background-image`
	 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/background-size
	 */
	size?: string;

	/**
	 * The initial position for the image
	 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/background-position
	 */
	position?: string;

	/**
	 * How the image is repeated via `background-image`
	 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/background-repeat
	 */
	repeat?: string;

	/**
	 * A preferred aspect ratio for the image.
	 * The option value can be given as a width-to-height ratio string or number, such as '2/1' or 16/9.
	 *
	 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/aspect-ratio
	 */
	ratio?: string | number;

	/**
	 * A string property or a list of such properties to add to the `background-image` before the main image.
	 * This property is useful for overlaying watermarks, gradients, and more on top of an image.
	 */
	beforeImg?: CanArray<string>;

	/**
	 * A string property or a list of such properties to add to the `background-image` before the main image.
	 * This property is useful for overlaying watermarks, gradients, and more on top of an image.
	 */
	afterImg?: CanArray<string>;
}

/** @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/source */
export interface ImageSource {
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
	 * A value of the `srcset` source attribute.
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
	 * A value of the `sizes` source attribute.
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/source#attr-sizes
	 *
	 * This option helps to create responsive images.
	 * @see https://developer.mozilla.org/en-US/docs/Learn/HTML/Multimedia_and_embedding/Responsive_images
	 */
	sizes?: string;
}
