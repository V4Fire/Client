/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { CreateAppFunction } from 'core/component/engines';
import type { ComponentInterface } from 'core/component/interface';

export interface App {
	context: Nullable<ReturnType<CreateAppFunction>>;
	component: Nullable<ComponentInterface>;
}
