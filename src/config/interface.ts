/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { Config as SuperConfig } from '@v4fire/core/config/interface';

export interface Config extends SuperConfig {
	/**
	 * Options of the asynchronous component renderer.
	 * See "core/components/render/daemon" for the more information.
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

	components: typeof COMPONENTS;
	componentStaticDependencies: Dictionary<Array<() => Promise<unknown>>>;
}
