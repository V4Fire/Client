/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import remoteState from 'core/component/state';
import { ComponentInterface } from 'core/component';

export { globalEmitter, ResetType } from 'core/component';
export type RemoteState = typeof remoteState;

export interface RootMod {
	mod: string;
	value: string;
	component: ComponentInterface;
}
