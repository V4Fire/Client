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

/*
 * @see https://github.com/microsoft/TypeScript/issues/1863
 */
export const
	SHADOW_PREVIEW_SYMBOL: unique symbol = Symbol('Preview element stage'),
	SHADOW_BROKEN_SYMBOL: unique symbol = Symbol('Broken element stage'),
	SHADOW_MAIN_SYMBOL: unique symbol = Symbol('Main element stage'),
	ID_SYMBOL: unique symbol = Symbol('Element Id');

export const
	SHADOW_PREVIEW = SHADOW_PREVIEW_SYMBOL,
	SHADOW_BROKEN = SHADOW_BROKEN_SYMBOL,
	SHADOW_MAIN = SHADOW_MAIN_SYMBOL,
	ID = ID_SYMBOL;

/*
 * @see https://github.com/microsoft/TypeScript/issues/1863
 */
export const
	IS_LOADED_SYMBOL: unique symbol = Symbol('Load indicator'),
	INIT_LOAD_SYMBOL: unique symbol = Symbol('Load initializer'),
	IS_LOADING_SYMBOL: unique symbol = Symbol('Loading indicator');

/*
 * @see https://github.com/microsoft/TypeScript/issues/1863
 */
export const
	IS_LOADED = IS_LOADED_SYMBOL,
	INIT_LOAD = INIT_LOAD_SYMBOL,
	IS_LOADING = IS_LOADING_SYMBOL;
