/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:core/component/README.md]]
 * @packageDocumentation
 */

import 'core/component/directives';

export * as init from 'core/component/init';
export * as gc from 'core/component/gc';

export type { State } from 'core/component/state';
export { ComponentEngine as default } from 'core/component/engines';

export { runHook } from 'core/component/hook';
export { bindRemoteWatchers, canSkipWatching, isCustomWatcher, customWatcherRgxp } from 'core/component/watch';

export { callMethodFromComponent } from 'core/component/method';
export { normalizeClass, normalizeStyle, normalizeComponentForceUpdateProps } from 'core/component/render';

export {

	app,

	isComponent,
	rootComponents,

	V4_COMPONENT,
	ASYNC_RENDER_ID,
	PARENT

} from 'core/component/const';

export {

	initEmitter,
	globalEmitter,

	destroyApp,
	resetComponents,

	ComponentResetType

} from 'core/component/event';

export { getFieldsStore } from 'core/component/field';

export * from 'core/component/reflect';
export * from 'core/component/decorators';
export * from 'core/component/interface';
