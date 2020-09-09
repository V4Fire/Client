/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { DefaultParams } from 'core/dom/image/interface';

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

/*
 * @see https://github.com/microsoft/TypeScript/issues/1863
 */
export const
	SHADOW_PREVIEW_SYMBOL: unique symbol = Symbol('Preview element stage'),
	SHADOW_BROKEN_SYMBOL: unique symbol = Symbol('Broken element stage'),
	SHADOW_MAIN_SYMBOL: unique symbol = Symbol('Stage of a main element'),
	ID_SYMBOL: unique symbol = Symbol('Element Id');

export const
	SHADOW_PREVIEW = <any>SHADOW_PREVIEW_SYMBOL,
	SHADOW_BROKEN = <any>SHADOW_BROKEN_SYMBOL,
	SHADOW_MAIN = <any>SHADOW_MAIN_SYMBOL,
	ID = <any>ID_SYMBOL;

/*
 * @see https://github.com/microsoft/TypeScript/issues/1863
 */
export const
	IMG_IS_LOADED_SYMBOL: unique symbol = Symbol('Load indicator'),
	INIT_LOAD_SYMBOL: unique symbol = Symbol('Load initializer'),
	LOADING_STARTED_SYMBOL: unique symbol = Symbol('Loading indicator');

/*
 * @see https://github.com/microsoft/TypeScript/issues/1863
 */
export const
	IMG_IS_LOADED = <any>IMG_IS_LOADED_SYMBOL,
	INIT_LOAD = <any>INIT_LOAD_SYMBOL,
	LOADING_STARTED = <any>LOADING_STARTED_SYMBOL;
