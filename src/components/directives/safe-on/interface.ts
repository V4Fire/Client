/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { DirectiveBinding } from 'core/component/engines';

export interface SafeOnDirectiveParams extends DirectiveBinding {
	value: EventListener;
	arg?: SafeOnEventType;
}

export interface SafeOnElement extends Element {
	'[[SAFE_ON]]'?: WeakMap<Function, {
		fn: EventListener;
		eventType: SafeOnEventType;
	}>;
}

export type SafeOnEventType = string | keyof ElementEventMap;

export type KeyedEvent = KeyboardEvent | MouseEvent | TouchEvent;

export type ModifierGuards =
  | 'shift'
  | 'ctrl'
  | 'alt'
  | 'meta'
  | 'left'
  | 'right'
  | 'stop'
  | 'prevent'
  | 'self'
  | 'middle'
  | 'exact';
