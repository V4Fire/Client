/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type iBlock from 'super/i-block';

import {

	SHADOW_PREVIEW_SYMBOL,
	SHADOW_BROKEN_SYMBOL,
	SHADOW_MAIN_SYMBOL,
	ID_SYMBOL,
	IS_LOADED_SYMBOL,
	INIT_LOAD_SYMBOL,
	IS_LOADING_SYMBOL

} from 'core/dom/image/const';

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
	 * Image `sizes` attribute
	 * @see https://developer.mozilla.org/en-US/docs/Learn/HTML/Multimedia_and_embedding/Responsive_images
	 */
	sizes?: string;

	/**
	 * Values of `source` tags within `picture`
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/source
	 */
	sources?: ImageSource[];

	/**
	 * Alternative value of an image to improve accessibility
	 */
	alt?: string;

	/** @see [[ImageBackgroundOptions]] */
	bgOptions?: ImageBackgroundOptions;

	/**
	 * If true, then for each changing of an imaging stage (initial, preview, broken, main),
	 * the image element will get a class with the stage value
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
	 */
	preview?: string | ImagePlaceholderOptions;

	/**
	 * Options of an error placeholder.
	 * The placeholder will be shown when the main image hasn't been loaded due to an error.
	 */
	broken?: string | ImagePlaceholderOptions;

	/**
	 * If this option is set to `false` – `update` directive hook will be ignored.
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
	 * Make sure you are not using `load` or `error` without the context provided,
	 * cause this can lead to unexpected results.
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
 * Options of a background image
 */
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
export interface ShadowElState {
	/**
	 * True if an image loading has been failed
	 */
	isFailed: boolean;

	/**
	 * Type of the shadow image
	 */
	stageType: ImageStage;

	/**
	 * Shadow picture node
	 */
	pictureNode?: HTMLPictureElement;

	/**
	 * Shadow image node
	 */
	imgNode: HTMLShadowImageElement;

	/**
	 * Options of the shadow state
	 */
	selfOptions: ImageOptions;

	/**
	 * Options of the main shadow state
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
	 *   - `true` – the image has been successfully loaded;
	 *   - `false`– the image loading has been failed;
	 *   - `undefined` – initial state, loading isn't finished
	 */
	[IS_LOADED_SYMBOL]?: boolean;

	/**
	 * Initializes loading of the image
	 */
	[INIT_LOAD_SYMBOL]?: Function;

	/**
	 * True if the image is loading
	 */
	[IS_LOADING_SYMBOL]?: true;
}

export interface DefaultParams {
	broken?: string | ImageOptions['broken'];
	preview?: string | ImageOptions['preview'];
}

export type ImagePlaceholderType = 'preview' | 'broken';
export type ImageStage = 'initial' | 'main' | ImagePlaceholderType;
export type BackgroundSizeType = 'contain' | 'cover';
export type InitValue = string | ImageOptions;
