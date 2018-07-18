/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import emitter from 'core/component/event/emitter';
import 'core/component/event/providers';

export type ResetType =
	'load' |
	'router' |
	'storage';

/**
 * Sends a message for reset to all components
 * @param [type] - reset type
 */
export function reset(type?: ResetType): void {
	emitter.emit(type ? `reset.${type}` : 'reset');
}

export default emitter;
