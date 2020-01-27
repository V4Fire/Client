/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import 'core/component/filters';
import 'core/component/directives';

export * from 'core/component/interface';
export * from 'core/component/const';
export * from 'core/component/create/functional';
export * from 'core/component/create/composite';
export * from 'core/component/register';

export {

	default as globalEmitter,

	reset,
	ResetType,

	/** @deprecated */
	default as globalEvent

} from 'core/component/event';

export {

	prop,
	field,
	system,
	p,
	hook,
	watch,
	paramsFactory

} from 'core/component/decorators';

export {

	customWatcherRgxp,
	runHook,
	getFieldInfo,
	cloneWatchValue,
	bindWatchers,
	FieldInfo

} from 'core/component/create/helpers';

export {

	renderData,
	ComponentDriver as default,

	WatchOptions,
	WatchOptionsWithHandler,

	VNode,
	VNodeDirective,
	CreateElement,
	ScopedSlot

} from 'core/component/engines';
