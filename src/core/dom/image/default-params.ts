/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { DefaultParams } from 'core/dom/image';

/**
 * This variable is used to override the default (`defaultBrokenImageOptions`, `defaultPreviewImageOptions`) values.
 * Override this file and export variable named as `defaultParams` from it to set the default value.
 *
 * @example
 * ```typescript
 * export const defaultParams = {
 *   broken: 'https://broken-images.com/broken.png'
 * }
 * ```
 */
export const defaultParams: CanUndef<DefaultParams> = undefined;
