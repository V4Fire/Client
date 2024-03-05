/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { Config as SuperConfig } from '@v4fire/core/config/interface';
import type { Options as SafeHtmlOptions } from 'core/component/directives/safe-html';

export interface Config extends SuperConfig {
	/**
	 * Default options for the `v-safe-html` directive.
	 * See `components/directives/safe-html` for the more information.
	 */
	safeHtml: SafeHtmlOptions;

	components: typeof COMPONENTS;
	componentStaticDependencies: Dictionary<Array<() => Promise<unknown>>>;
}
