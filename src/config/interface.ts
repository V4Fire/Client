/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { Config as SuperConfig } from '@v4fire/core/config/interface';

export interface Config extends SuperConfig {
	components: typeof COMPONENTS;
}
