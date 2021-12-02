/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type remoteState from '@src/core/component/state';
import type { ComponentInterface } from '@src/core/component';

export { globalEmitter, ResetType } from '@src/core/component';
export type RemoteState = typeof remoteState;

export interface RootMod {
	name: string;
	value: string;
	class: string;
	component: ComponentInterface;
}
