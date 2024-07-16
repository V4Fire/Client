/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { Config as SuperConfig } from '@v4fire/core/config/interface';
import type { ImagePlaceholderOptions } from 'components/directives/image';
import type { SanitizedOptions } from 'components/directives/safe-html';

export interface Config extends SuperConfig {
	/**
	 * Default options for the `v-image` directive.
	 * For more information, see `components/directives/v-image`.
	 */
	image: {
		/**
		 * The base image URL.
		 * If given, it will be used as a prefix for all values in the `src` and `srcset` parameters.
		 *
		 * @example
		 * ```js
		 * {
		 *   src: 'img.png',
		 *   baseSrc: 'https://url-to-img'
		 * }
		 * ```
		 *
		 * ```html
		 * <img src="https://url-to-img/img.png" />
		 * ```
		 */
		baseSrc?: string;

		/**
		 * If false, then the image will start loading immediately, but not when it appears in the viewport
		 * @default `false`
		 */
		lazy?: boolean;

		/**
		 * An image URL to use as a placeholder while the main one is loading.
		 * The option can also accept an object with additional image settings.
		 */
		preview?: string | ImagePlaceholderOptions;

		/**
		 * An image URL to use as a placeholder if the main one cannot be loaded due to an error.
		 * The option can also accept an object with additional image settings.
		 */
		broken?: string | ImagePlaceholderOptions;
	};

	/**
	 * Options of the asynchronous component renderer.
	 * For more information, see `core/components/render/daemon`.
	 */
	asyncRender: {
		/**
		 * The maximum weight of tasks per one render iteration
		 */
		weightPerTick: number;

		/**
		 * The delay in milliseconds between render iterations
		 */
		delay: number;
	};

	/**
	 * Default options for the `v-safe-html` directive.
	 * For more information, see `components/directives/safe-html`.
	 */
	safeHtml: SanitizedOptions;

	components: typeof COMPONENTS;
}
