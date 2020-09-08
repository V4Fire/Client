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

} from 'core/dom/image/const';

export interface ImageOptions {
	/**
	 * URL of an image
	 */
	src?: string;

	/**
	 * Base url for `src` and `srcset`
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
	 * `source` tags for a `picture` tag
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
	 * If true, then for each change of the image (initial, preview, broken, main)
	 * the class will be installed with the current state
	 *
	 * @example
	 * ```typescript
	 * {
	 *   src: 'img.png',
	 *   stateClasses: true,
	 *   ctx: this
	 * }
	 * ```
	 *
	 * ```html
	 * <div class="b-block b-block__v-image_state_preview"></div>
	 * ```
	 *
	 * @default `false`
	 */
	stageClasses?: boolean;

	/**
	 * Options for a preview image.
	 *
	 * The preview image will be showing while the main image is loading.
	 */
	preview?: string | ImagePlaceholderOptions;

	/**
	 * Options for a broken image.
	 *
	 * The broken image will be showing if the loading error appears.
	 */
	broken?: string | ImagePlaceholderOptions;

	/**
	 * If this options is set to `false` – `update` directive hook will be ignored.
	 * It only makes sense if used in directive mode.
	 *
	 * When calling the state update method for a node, the old parameters, and new parameters will be compared.
	 * If they differ, the current state will be completely cleared and recreated.
	 * This can be useful if you change the image's src or any options on the same node during re-rendering.
	 *
	 * @default `false`
	 */
	handleUpdate?: boolean;

	/**
	 * Execution context.
	 *
	 * The context is used to provide a component environment, like, async, event emitters, etc.
	 * When API is used as a directive, the context will automatically taken from a VNode instance.
	 *
	 * Make sure you are not using `load` or `error` without the context provided this can lead to unexpected results.
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
	 * Will be called after successful loading (`img.onload`)
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
 * Options for background image
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

export interface ImagePlaceholderOptions extends ImageOptions {
	/** @override */
	preview?: never;

	/** @override */
	broken?: never;

	/** @override */
	ctx?: never;
}

export interface DefaultImagePlaceholderOptions extends ImagePlaceholderOptions {
	/**
	 * True if the specified helper image is a default image
	 */
	isDefault?: boolean;
}

export interface ImageSource {
	/**
	 * MIME resource type
	 * @see https://developer.mozilla.org/ru/docs/Web/HTML/Element/source
	 */
	type?: string;

	/**
	 * `media` attribute for a `source` tag
	 * @see https://developer.mozilla.org/ru/docs/Web/HTML/Element/source
	 */
	media?: string;

	/**
	 * `srcset` attribute for a `source` tag
	 * @see https://developer.mozilla.org/ru/docs/Web/HTML/Element/source
	 */
	srcset?: string;

	/**
	 * `sizes` attribute for a `source` tag
	 * @see https://developer.mozilla.org/ru/docs/Web/HTML/Element/source
	 */
	sizes?: string;
}

/**
 * The hidden state that binds to the node.
 * This state contains Shadow DOM, image loading state, etc
 */
export interface ShadowElState {
	/**
	 * True if an image loading was failed
	 */
	isFailed: boolean;

	/**
	 * Type of a shadow image
	 */
	stageType: ImageStage;

	/**
	 * Picture shadow node
	 */
	pictureNode?: HTMLPictureElement;

	/**
	 * Image shadow node
	 */
	imgNode: HTMLShadowImageElement;

	/**
	 * Options of a shadow state
	 */
	selfOptions: ImageOptions;

	/**
	 * Options of a main shadow state
	 */
	mainOptions: ImageOptions;

	/**
	 * Image loading promise
	 */
	loadPromise?: Promise<unknown>;
}

/**
 * Result of generating HTMLPictureElement
 */
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
	 *   - `true` – image was successfully loaded
	 *   - `false`– loading failed
	 *   - `undefined` – initial state, loading was not completed
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
export type ImagePlaceholderType = 'preview' | 'broken';
export type ImageStage = 'initial' | 'main' | ImagePlaceholderType;
export type BackgroundSizeType = 'contain' | 'cover';
export type InitValue = string | ImageOptions;
