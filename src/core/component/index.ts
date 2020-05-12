/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import 'core/component/filters';
import 'core/component/directives';

export * from 'core/component/const';
export * from 'core/component/functional';
export * from 'core/component/flyweight';

export * from 'core/component/hook';
export * from 'core/component/field';
export * from 'core/component/watch';

export * from 'core/component/register';
export * from 'core/component/reflection';
export * from 'core/component/decorators';

export * from 'core/component/event';
export * from 'core/component/render';

export {

	default as globalEmitter,

	/** @deprecated */
	default as globalEvent

} from 'core/component/event';

export {

	renderData,
	patchVNode,
	ComponentDriver as default,

	WatchOptions,
	WatchOptionsWithHandler,

	VNode,
	VNodeDirective,

	CreateElement,
	ScopedSlot

} from 'core/component/engines';

export * from 'core/component/interface';
