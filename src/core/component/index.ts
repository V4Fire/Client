/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import 'core/component/directives';

export * from 'core/component/const';
export * from 'core/component/functional';

export * from 'core/component/hook';
export * from 'core/component/field';
export * from 'core/component/ref';
export * from 'core/component/watch';

export * from 'core/component/register';
export * from 'core/component/reflect';
export * from 'core/component/method';

export * from 'core/component/event';
export * from 'core/component/render';

export {

	default as globalEmitter,

	/** @deprecated */
	default as globalEvent

} from 'core/component/event';

export {

	cloneVNode,

	ComponentEngine as default,
	VNode

} from 'core/component/engines';

export * from 'core/component/interface';
