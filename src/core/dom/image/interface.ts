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
	 * Make sure you are not using `load` or `error` without the context provided this can lead to unexpected results.
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
	 * Base URL of an image
	 */
	src?: string;

	/**
	 * Srcset of an image. This option helps to manage the situation with multiple resolutions of the image to load.
@see https://developer.mozilla.org/en-US/docs/Learn/HTML/Multimedia_and_embedding/Responsive_images
	 */
	srcset?: Dictionary<string> | string;

	/**
	 * If `true` then default params will be used
	 * (which were set to `defaultBrokenImageOptions` and `defaultPreviewImageOptions`)
	 *
	 * @default `true`
	 */
	useDefaultParams?: boolean;

	/**
	 * Alternative value of an image to improve accessibility
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
	stateClasses?: boolean;

	/** @see [[ImageBackgroundOptions]] */
	bgOptions?: ImageBackgroundOptions;

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

export interface ImageHelperOptions extends Omit<ImageOptions, 'ctx'> {
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

/*
 * @see https://github.com/microsoft/TypeScript/issues/1863
 */
const
	SHADOW_PREVIEW_SYMBOL: unique symbol = Symbol.for('state of a preview element'),
	SHADOW_BROKEN_SYMBOL: unique symbol = Symbol.for('state of a broken element'),
	SHADOW_MAIN_SYMBOL: unique symbol = Symbol.for('state of a main element'),
	ID_SYMBOL: unique symbol = Symbol.for('id of an element');

export const
	SHADOW_PREVIEW = <any>SHADOW_PREVIEW_SYMBOL,
	SHADOW_BROKEN = <any>SHADOW_BROKEN_SYMBOL,
	SHADOW_MAIN = <any>SHADOW_MAIN_SYMBOL,
	ID = <any>ID_SYMBOL;

export interface ImageNode extends HTMLElement {
	[SHADOW_PREVIEW_SYMBOL]?: ShadowElState;
	[SHADOW_BROKEN_SYMBOL]?: ShadowElState;
	[SHADOW_MAIN_SYMBOL]: ShadowElState;
	[ID_SYMBOL]: string;
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

/*
 * @see https://github.com/microsoft/TypeScript/issues/1863
 */
const
	IMG_IS_LOADED_SYMBOL: unique symbol = Symbol.for('image is successfully loaded indicator'),
	INIT_LOAD_SYMBOL: unique symbol = Symbol.for('image loading initiator'),
	LOADING_STARTED_SYMBOL: unique symbol = Symbol.for('indicator of an image starts a loading');

/*
 * @see https://github.com/microsoft/TypeScript/issues/1863
 */
export const
	IMG_IS_LOADED = <any>IMG_IS_LOADED_SYMBOL,
	INIT_LOAD = <any>INIT_LOAD_SYMBOL,
	LOADING_STARTED = <any>LOADING_STARTED_SYMBOL;

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
export type ImageHelperType = 'preview' | 'broken';
export type ImageType = 'main' | ImageHelperType;
export type BackgroundSizeType = 'contain' | 'cover';
export type DirectiveValue = string | ImageOptions;
