/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import iBlock from 'super/i-block/i-block';
import { VNodeDirective } from 'core/component/engines';

export interface DirectiveOptions extends VNodeDirective {
	modifiers: {
		[key: string]: boolean;
	};

	value?: DirectiveValue;
}

export interface ImageOptions {
	/**
	 * Execution context
	 *
	 * An async module will be used from the passed context to set events.
	 * If the context is not specified `vNode.context` will be used.
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
	ctx: iBlock;

	/**
	 * Base url to an image
	 */
	src?: string;

	/**
	 * Srcset to an image
	 */
	srcset?: Dictionary<string> | string;

	/**
	 * `alt` attribute for an image
	 */
	alt?: string;

	/**
	 * Options for a preview image.
	 *
	 * The preview image will be showing while the main image is loading.
	 */
	preview?: string | ImageHelperOptions;

	/**
	 * Options for a broken image.
	 *
	 * The broken image will be showing if the loading error appears.
	 */
	broken?: string | ImageHelperOptions;

	/**
	 * Image `sizes` attribute
	 */
	sizes?: string;

	/**
	 * If this options is set to `false` – `update` directive hook will be ignored
	 *
	 * @default `false`
	 */
	handleUpdate?: boolean;

	/**
	 * `source` tags for a `picture` tag
	 */
	sources?: ImageSource[];

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
	 * If true, then for each change of the image (preview, broken, main)
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
	stateClasses?: boolean;

	/** @see [[ImageBackgroundOptions]] */
	backgroundOptions?: ImageBackgroundOptions;

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

export interface ImageHelperOptions extends ImageOptions {
	/** @override */
	preview: never;

	/** @override */
	broken: never;

	/** @override */
	ctx: never;

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

export const
	SHADOW_PREVIEW: unique symbol = Symbol.for('state of a preview element'),
	SHADOW_BROKEN: unique symbol = Symbol.for('state of a broken element'),
	SHADOW_MAIN: unique symbol = Symbol.for('state of a main element'),
	ID: unique symbol = Symbol.for('id of an element');

export interface ImageNode extends HTMLElement {
	[SHADOW_PREVIEW]?: ShadowElState;
	[SHADOW_BROKEN]?: ShadowElState;
	[SHADOW_MAIN]: ShadowElState;
	[ID]: string;
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

export const
	IMG_IS_LOADED: unique symbol = Symbol.for('image is successfully loaded indicator'),
	INIT_LOAD: unique symbol = Symbol.for('image loading initiator'),
	LOADING_STARTED: unique symbol = Symbol.for('indicator of an image starts a loading');

export interface HTMLShadowImageElement extends HTMLImageElement {
	/**
	 * If
	 *   - `true` – image was successfully loaded
	 *   - `false`– loading failed
	 *   - `undefined` – initial state, loading was not completed
	 */
	[IMG_IS_LOADED]?: boolean;

	/**
	 * Initializes loading of the image
	 */
	[INIT_LOAD]?: Function;

	/**
	 * Indicator of an image starts loading
	 */
	[LOADING_STARTED]?: true;
}

/**
 * Stage of an image
 */
export type ImageHelperType = 'preview' | 'broken';
export type ImageType = 'main' | ImageHelperType;
export type BackgroundSizeType = 'contain' | 'cover';
export type DirectiveValue = string | Omit<ImageOptions, 'isPreviewImage' | 'isBrokenImage' | 'isMainImage'>;
