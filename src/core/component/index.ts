/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import 'core/component/filters';
import 'core/component/directives';

export * from '@src/core/component/const';
export * from '@src/core/component/functional';
export * from '@src/core/component/flyweight';

export * from '@src/core/component/hook';
export * from '@src/core/component/field';
export * from '@src/core/component/ref';
export * from '@src/core/component/watch';

export * from '@src/core/component/register';
export * from '@src/core/component/reflection';
export * from '@src/core/component/method';

export * from '@src/core/component/event';
export * from '@src/core/component/render';

export {

	default as globalEmitter,

	/** @deprecated */
	default as globalEvent

} from '@src/core/component/event';

export {

	cloneVNode,
	renderVNode,
	patchVNode,

	ComponentEngine as default,

	VNode,
	VNodeDirective,

	CreateElement,
	ScopedSlot

} from '@src/core/component/engines';

export * from '@src/core/component/interface';
