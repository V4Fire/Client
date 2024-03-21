/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { State } from 'core/component/state';
import type { CreateAppFunction } from 'core/component/engines';
import type { ComponentInterface } from 'core/component/interface/component';

/**
 * A component constructor function
 */
export interface ComponentConstructor<T = unknown> {
	new(): T;
}

/**
 * A component root DOM element
 */
export type ComponentElement<T = ComponentInterface> = Element & {
	component?: T;
};

/**
 * References to the context of the entire application and the tied state
 */
export interface ComponentApp {
	context: ReturnType<CreateAppFunction>;
	state: State;
}
