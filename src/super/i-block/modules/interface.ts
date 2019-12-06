/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import iBlock from 'super/i-block/i-block';
import { statuses } from 'super/i-block/modules/const';
import { AsyncOptions } from 'core/async';

export type Statuses =
	'destroyed' |
	'inactive' |
	'unloaded' |
	'loading' |
	'beforeReady' |
	'ready';

export interface WaitStatusOptions extends AsyncOptions {
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

export type Stage = string | number;
export type ComponentStatuses = Partial<Record<keyof typeof statuses, boolean>>;

export interface ComponentEventDecl {
	event: string;
	type?: 'error';
}

export interface InitLoadParams {
	silent?: boolean;
	recursive?: boolean;
}
