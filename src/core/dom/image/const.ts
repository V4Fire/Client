/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { DefaultParams } from 'core/dom/image/interface';

/**
 * Default parameters for image placeholders: `defaultBrokenImageOptions` and `defaultPreviewImageOptions`
 *
 * @example
 * ```typescript
 * export const defaultParams = {
 *   broken: 'https://broken-images.com/broken.png'
 * }
 * ```
 */
export const defaultParams: CanUndef<DefaultParams> = undefined;

export const
	SHADOW_PREVIEW = Symbol('Preview element stage'),
	SHADOW_BROKEN = Symbol('Broken element stage'),
	SHADOW_MAIN = Symbol('Main element stage'),
	ID = Symbol('Element Id');

export const
	IS_LOADED = Symbol('The image is loaded'),
	IS_LOADING = Symbol('The image is loading');

export const
	loadImage = Symbol('Load the image');
