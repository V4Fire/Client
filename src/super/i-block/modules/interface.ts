/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import iBlock from 'super/i-block/i-block';
import { AsyncOpts } from 'core/async';

export type Statuses =
	'destroyed' |
	'inactive' |
	'loading' |
	'beforeReady' |
	'ready' |
	'unloaded';

export interface WaitStatusOpts extends AsyncOpts {
	defer?: boolean;
}

export type ParentMessageFields =
	'instanceOf' |
	'globalName' |
	'componentName' |
	'componentId';

export interface ParentMessage<T extends iBlock = iBlock> {
	check: [ParentMessageFields, unknown];
	action(this: T): Function;
}

export type ConverterCallType = 'component' | 'remote';
export type Stage = string | number;
