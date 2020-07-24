/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { VNodeDirective } from 'core/component/engines';

export interface DirectiveOptions extends VNodeDirective {
	modifiers: {
		[key: string]: boolean;
	};

	value?: DirectiveValue;
}

export interface ImageOptions {
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
	preview?: ImageOptions;

	/**
	 * Options for a broken image.
	 *
	 * The broken image will be showing if the loading error appears.
	 */
	broken?: ImageOptions;

	/**
	 * Image `sizes` attribute
	 */
	sizes?: string;

	/**
	 * Image aspect ratio
	 */
	ratio?: number;

	/**
	 * List of a classes
	 */
	classes?: string[];

	/** @see [[ImageBackgroundOptions]] */
	backgroundOptions?: ImageBackgroundOptions;

	/**
	 * Will be called after successful loading
	 * @param el
	 */
	load?(el: Element): unknown;

	/**
	 * Will be called if loading error appears
	 * @param el
	 */
	error?(el: Element): unknown;

	/**
	 * Will be called on an image start loading
	 */
	startLoading?(el: Element): unknown;

	/**
	 * Will be called on a preview image was hidden
	 */
	previewHide?(el?: Element): unknown;
}

/**
 * Options for background image
 */
export interface ImageBackgroundOptions {
	/**
	 * Image background size type
	 */
	sizeType?: BackgroundSizeType ;

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
}

export type BackgroundSizeType = 'contain' | 'cover';
export type DirectiveValue = string | ImageOptions;
