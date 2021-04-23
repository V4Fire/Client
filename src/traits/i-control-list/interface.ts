/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type iBlock from 'super/i-block/i-block';

export interface ControlAnalytics {
	event: string;
	details?: Dictionary;
}

export type ControlActionMethodFn<T extends iBlock = iBlock> =
	((this: T, ...args: unknown[]) => unknown) |
	Function;

export interface ControlActionArgsMapFn<T extends iBlock = iBlock> {
	(this: T, args: unknown[]): Nullable<unknown[]>;
}

export interface ControlActionObject {
	method: string | ControlActionMethodFn;
	args?: unknown[];
	argsMap?: string | ControlActionArgsMapFn;
	defArgs?: boolean;
}

export type ControlAction =
	string |
	Function |
	ControlActionObject;

export interface ControlEvent {
	action?: ControlAction;
	analytics?: ControlAnalytics;
}

export interface Control extends ControlEvent {
	text?: string;
	component?: 'b-button' | 'b-file-button' | string;
	attrs?: Dictionary;
}
