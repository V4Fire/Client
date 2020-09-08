/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import iBlock from 'super/i-block/i-block';

import {

	SHADOW_PREVIEW_SYMBOL,
	SHADOW_BROKEN_SYMBOL,
	SHADOW_MAIN_SYMBOL,
	ID_SYMBOL,
	IMG_IS_LOADED_SYMBOL,
	INIT_LOAD_SYMBOL,
	LOADING_STARTED_SYMBOL

} from 'core/dom/image';

export interface ImageOptions {
	/**
	 * URL of an image
	 */
	src?: string;

	/**
	 * Base URL for `src` and `srcset`
	 *
	 * @example
	 * ```typescript
	 * {
	 *   src: 'img.png',
	 *   baseSrc: 'https://url-to-img',
	 *   ctx: this
	 * }
	 * ```
	 *
	 * ```html
	 * <img src="https://url-to-img/img.png">
	 * ```
	 */
	baseSrc?: string;

	/**
	 * Srcset of an image. This option helps to manage the situation with multiple resolutions of the image to load.
	 * @see https://developer.mozilla.org/en-US/docs/Learn/HTML/Multimedia_and_embedding/Responsive_images
	 */
	srcset?: Dictionary<string> | string;

	/**
	 * Image `sizes` attribute
	 * @see https://developer.mozilla.org/ru/docs/Learn/HTML/Multimedia_and_embedding/Responsive_images
	 */
	sizes?: string;

	/**
	 * Values of `source` tags within `picture`
	 * @see https://developer.mozilla.org/ru/docs/Web/HTML/Element/source
	 */
	sources?: ImageSource[];

	/**
	 * Alternative value of an image to improve accessibility
	 */
	alt?: string;

	/** @see [[ImageBackgroundOptions]] */
	bgOptions?: ImageBackgroundOptions;

	/**
	 * If true, then for each changing of an imaging stage (initial, preview, broken, main), the image element will get a class with the stage value
	 * the class will be installed with the current state
	 *
	 * @example
	 * ```typescript
	 * {
	 *   src: 'img.png',
	 *   stageClasses: true,
	 *   ctx: this
	 * }
	 * ```
	 *
	 * ```html
	 * <div class="b-block b-block__v-image_stage_preview"></div>
	 * ```
	 *
	 * @default `false`
	 */
	stageClasses?: boolean;

	/**
	 * Options of a loading placeholder. The placeholder will be shown while the main image is loading.
	 *
	 * The preview image will be showing while the main image is loading.
	 */
	preview?: string | ImageHelperOptions;

	/**
	 * Options of an error placeholder. The placeholder will be shown when the main image hasn't been loaded due to an error.
	 *
	 * The broken image will be showing if the loading error appears.
	 */
	broken?: string | ImageHelperOptions;

	/**
	 * Execution context.
	 *
	 * The context is used to provide a component environment, like, async, event emitters, etc.
	 * When API is used as a directive, the context will automatically taken from a VNode instance.
	 *
	 * Make sure you are not using `load` or `error` without the context provided, cause this can lead to unexpected results.
	 *
	 * When used as a directive, the context will be set automatically
	 * (but you can override it explicitly by specifying the context).
	 *
	 * @example
	 * ```typescript
	 * class Test {
	 *   setImageToDiv() {
	 *     ImageLoader.init(this.$refs.div, {src: 'https://img.jpg', ctx: this})
	 *   }
	 * }
	 * ```
	 */
	ctx?: iBlock;

	/**
	 * If true, then image placeholder will use the default options.
	 * (which were set to `defaultBrokenImageOptions` and `defaultPreviewImageOptions`)
	 *
	 * @default `true`
	 */
	useDefaultImageStages?: boolean;

	/**
	 * If this options is set to `false` – `update` directive hook will be ignored.
	 * It only makes sense if used in directive mode
	 *
	 * @default `false`
	 */
	handleUpdate?: boolean;

	/**
	 * Will be called after the successful loading of an image (`img.onload`)
	 * @param el
	 */
	load?(el: Element): unknown;

	/**
	 * Will be called if loading error appears
	 * @param el
	 */
	error?(el: Element): unknown;
}

/**
 * Options of a background image
 */
export interface ImageBackgroundOptions {
	/**
	 * Image background size type
	 */
	size?: BackgroundSizeType ;

	/**
	 * Image background position
	 */
	position?: string;

	/**
	 * Style (backgroundImage) before the image background
	 */
	beforeImg?: CanArray<string>;

	/**
	 * Style (backgroundImage) after the image background
	 */
	afterImg?: CanArray<string>;

	/**
	 * Image aspect ratio
	 */
	ratio?: number;
}

export interface ImageHelperOptions extends ImageOptions {
	/** @override */
	preview?: never;

	/** @override */
	broken?: never;

	/** @override */
	ctx?: never;

	/**
	 * True if the specified helper image is a default image
	 */
	isDefault?: boolean;
}

export interface ImageSource {
	/**
	 * `type` attribute for a `source` tag
	 */
	type?: string;

	/**
	 * `media` attribute for a `source` tag
	 */
	media?: string;

	/**
	 * `srcset` attribute for a `source` tag
	 */
	srcset?: string;

	/**
	 * `sizes` attribute for a `source` tag
	 */
	sizes?: string;
}

export interface ShadowElState {
	/**
	 * True if an image loading was failed
	 */
	isFailed: boolean;

	/**
	 * Type of a shadow image
	 */
	type: ImageType;

	/**
	 * Picture shadow node
	 */
	pictureNode?: HTMLPictureElement;

	/**
	 * Image shadow node
	 */
	imgNode: HTMLShadowImageElement;

	/**
	 * Image loading promise
	 */
	loadPromise?: Promise<unknown>;

	/**
	 * Options of a shadow state
	 */
	selfOptions: ImageOptions;

	/**
	 * Options of a main shadow state
	 */
	mainOptions: ImageOptions;
}

export interface PictureFactoryResult {
	picture: HTMLPictureElement;
	img: HTMLShadowImageElement;
}

export interface ImageNode extends HTMLElement {
	[SHADOW_PREVIEW_SYMBOL]?: ShadowElState;
	[SHADOW_BROKEN_SYMBOL]?: ShadowElState;
	[SHADOW_MAIN_SYMBOL]: ShadowElState;
	[ID_SYMBOL]: string;
}

interface HTMLShadowImageElement extends HTMLImageElement {
	/**
	 * If
	 *   - `true` – the image has been successfully loaded;
	 *   - `false`– the image loading has been failed;
	 *   - `undefined` – initial state, loading isn't finished
	 */
	[IMG_IS_LOADED_SYMBOL]?: boolean;

	/**
	 * Initializes loading of the image
	 */
	[INIT_LOAD_SYMBOL]?: Function;

	/**
	 * Indicator of an image starts loading
	 */
	[LOADING_STARTED_SYMBOL]?: true;
}

/**
 * Set of default parameters
 */
export interface DefaultParams {
	broken?: string | ImageOptions['broken'];
	preview?: string | ImageOptions['preview'];
}

/**
 * Stage of an image
 */
export type ImageHelperType = 'preview' | 'broken';
export type ImageType = 'main' | ImageHelperType;
export type BackgroundSizeType = 'contain' | 'cover';
export type InitValue = string | ImageOptions;
