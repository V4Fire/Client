/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:config/README.md]]
 * @packageDocumentation
 */

import { extend } from '@v4fire/core/config';

export { default } from '@v4fire/core/config';

export * from '@v4fire/core/config';
export * from 'config/interface';

const IS_SSR = Boolean(typeof SSR !== 'undefined' && SSR);

extend({
	image: {},

	asyncRender: {
		weightPerTick: 5,
		delay: 40
	},

	gc: {
		quota: IS_SSR ? 50 : 25,
		delay: IS_SSR ? 1000 : 5000
	},

	/**
	 * Default options for the `v-safe-html` directive.
	 * @see https://github.com/cure53/DOMPurify#can-i-configure-dompurify
	 */
	safeHtml: {
		USE_PROFILES: {
			html: true
		}
	}
});
