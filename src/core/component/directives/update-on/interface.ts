/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { EventEmitterLike } from 'core/async';
import { VNodeDirective } from 'core/component/engines';

export interface DirectiveOptions extends VNodeDirective {
	modifiers: {
		[key: string]: boolean;
	};

	value?: CanArray<DirectiveValue>;
}

export interface DirectiveValue {
	emitter: EventEmitterLike;
	once: boolean;
	event: string;
	listener: Function;
}
