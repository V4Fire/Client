/*!
 * V4Fire Core
 * https://github.com/V4Fire/Core
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Core/blob/master/LICENSE
 */

import { Config as SuperConfig } from '@v4fire/core/config/interface';

export interface Config extends SuperConfig {
	components: typeof COMPONENTS;
}
