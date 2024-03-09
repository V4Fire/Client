/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { ComponentInterface, State } from 'core/component';

export { globalEmitter, ComponentResetType } from 'core/component';

export type RemoteState = State;

export interface RootMod {
	name: string;
	value: string;
	class: string;
	component: ComponentInterface;
}
