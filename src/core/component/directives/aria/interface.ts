/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { VNode, VNodeDirective } from 'core/component/engines';
import type Async from 'core/async';

export interface DirectiveOptions {
	el: HTMLElement;
	binding: VNodeDirective;
	vnode: VNode;
}

export default abstract class AriaRoleEngine {
	options: DirectiveOptions;
	async: CanUndef<Async>;

	protected constructor(options: DirectiveOptions) {
		this.options = options;
	}

	abstract init(): void;
}

export const enum keyCodes {
	ENTER = 'Enter',
	END = 'End',
	HOME = 'Home',
	LEFT = 'ArrowLeft',
	UP = 'ArrowUp',
	RIGHT = 'ArrowRight',
	DOWN = 'ArrowDown'
}

export const enum eventsNames {
	openEvent = 'onOpen',
	closeEvent = 'onClose',
	changeEvent = 'onChange'
}
